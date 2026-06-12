import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, created, validationError, conflict, serverError, paginated } from '@/lib/response'
import { z } from 'zod'

const CustomerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where = {
      restaurantId: auth.restaurantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: { totalSpent: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ])

    return paginated(customers, total, page, limit)
  } catch (e) {
    console.error('[GET /api/customers]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = CustomerSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { phone } = parsed.data
    if (phone) {
      const exists = await prisma.customer.findUnique({
        where: { restaurantId_phone: { restaurantId: auth.restaurantId, phone } },
      })
      if (exists) return conflict('Customer with this phone already exists')
    }

    const customer = await prisma.customer.create({
      data: { ...parsed.data, restaurantId: auth.restaurantId },
    })
    return created(customer)
  } catch (e) {
    console.error('[POST /api/customers]', e)
    return serverError()
  }
}
