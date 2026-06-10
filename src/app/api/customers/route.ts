import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { CustomerSchema } from '@/lib/validators'
import { ok, created, validationError, conflict, serverError, paginated } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

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

    const { phone, email } = parsed.data
    if (phone) {
      const exists = await prisma.customer.findUnique({ where: { phone } })
      if (exists) return conflict('Customer with this phone already exists')
    }
    if (email) {
      const exists = await prisma.customer.findUnique({ where: { email } })
      if (exists) return conflict('Customer with this email already exists')
    }

    const customer = await prisma.customer.create({ data: parsed.data })
    return created(customer)
  } catch (e) {
    console.error('[POST /api/customers]', e)
    return serverError()
  }
}
