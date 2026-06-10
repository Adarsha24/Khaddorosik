import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { TableStatusSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = TableStatusSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const table = await prisma.restaurantTable.findUnique({ where: { id } })
    if (!table) return notFound('Table')

    const { status, waiterId } = parsed.data

    // When opening a table, create a new session
    if (status === 'OCCUPIED') {
      await prisma.$transaction([
        prisma.restaurantTable.update({ where: { id }, data: { status } }),
        prisma.tableSession.create({ data: { tableId: id, waiterId } }),
      ])
    } else if (status === 'AVAILABLE') {
      // Close any open sessions
      await prisma.$transaction([
        prisma.tableSession.updateMany({
          where: { tableId: id, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: new Date() },
        }),
        prisma.restaurantTable.update({ where: { id }, data: { status } }),
      ])
    } else {
      await prisma.restaurantTable.update({ where: { id }, data: { status } })
    }

    const updated = await prisma.restaurantTable.findUnique({ where: { id } })
    return ok(updated)
  } catch (e) {
    console.error('[PATCH /api/tables/[id]/status]', e)
    return serverError()
  }
}
