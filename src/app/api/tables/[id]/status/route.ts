import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const Schema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']),
  waiterId: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return notFound('Invalid status')

    const table = await prisma.restaurantTable.findFirst({ where: { id, restaurantId: auth.restaurantId } })
    if (!table) return notFound('Table')

    const { status, waiterId } = parsed.data

    if (status === 'OCCUPIED') {
      await prisma.$transaction([
        prisma.restaurantTable.update({ where: { id }, data: { status } }),
        prisma.tableSession.create({ data: { tableId: id, waiterId } }),
      ])
    } else if (status === 'AVAILABLE') {
      await prisma.$transaction([
        prisma.tableSession.updateMany({ where: { tableId: id, status: 'OPEN' }, data: { status: 'CLOSED', closedAt: new Date() } }),
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
