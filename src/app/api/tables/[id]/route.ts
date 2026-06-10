import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { TableSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const table = await prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        tableSessions: {
          where: { status: 'OPEN' },
          take: 1,
          include: {
            orders: {
              where: { status: { notIn: ['PAID', 'CANCELLED'] } },
              include: { items: { include: { menuItem: { select: { id: true, name: true, price: true } } } } },
            },
          },
        },
        reservations: {
          where: { date: { gte: new Date() }, status: 'CONFIRMED' },
          orderBy: { date: 'asc' },
          take: 5,
        },
      },
    })

    if (!table) return notFound('Table')
    return ok(table)
  } catch (e) {
    console.error('[GET /api/tables/[id]]', e)
    return serverError()
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = TableSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const table = await prisma.restaurantTable.update({ where: { id }, data: parsed.data })
    return ok(table)
  } catch (e) {
    console.error('[PUT /api/tables/[id]]', e)
    return serverError()
  }
}
