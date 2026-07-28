import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, conflict, serverError } from '@/lib/response'
import { z } from 'zod'

const TableSchema = z.object({
  number: z.number().int().positive(),
  capacity: z.number().int().positive(),
  section: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const section = searchParams.get('section')

    const tables = await prisma.restaurantTable.findMany({
      where: {
        restaurantId: auth.restaurantId,
        ...(status && { status: status as never }),
        ...(section && { section }),
      },
      include: {
        tableSessions: {
          where: { status: 'OPEN' },
          take: 1,
          include: {
            orders: {
              where: { status: { notIn: ['PAID', 'CANCELLED'] } },
              select: { id: true, total: true, status: true, createdAt: true, items: { select: { quantity: true } } },
            },
          },
        },
      },
      orderBy: { number: 'asc' },
    })

    return ok(tables)
  } catch (e) {
    console.error('[GET /api/tables]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = TableSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const existing = await prisma.restaurantTable.findUnique({
      where: { restaurantId_number: { restaurantId: auth.restaurantId, number: parsed.data.number } },
    })
    if (existing) return conflict(`Table #${parsed.data.number} already exists`)

    const table = await prisma.restaurantTable.create({
      data: { ...parsed.data, restaurantId: auth.restaurantId },
    })
    return created(table)
  } catch (e) {
    console.error('[POST /api/tables]', e)
    return serverError()
  }
}
