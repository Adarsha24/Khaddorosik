import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const StatusSchema = z.object({ status: z.enum(['PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW']) })

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const reservation = await prisma.reservation.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: {
        table: true,
        customer: { select: { id: true, name: true, phone: true, loyaltyPoints: true } },
      },
    })
    if (!reservation) return notFound('Reservation')
    return ok(reservation)
  } catch (e) {
    console.error('[GET /api/reservations/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = StatusSchema.safeParse(await req.json())
    if (!parsed.success) return notFound('Invalid status')

    const exists = await prisma.reservation.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { tableId: true } })
    if (!exists) return notFound('Reservation')

    const reservation = await prisma.reservation.update({ where: { id }, data: { status: parsed.data.status } })

    if (parsed.data.status === 'CONFIRMED' && exists.tableId) {
      await prisma.restaurantTable.update({ where: { id: exists.tableId }, data: { status: 'RESERVED' } })
    }

    return ok(reservation)
  } catch (e) {
    console.error('[PATCH /api/reservations/[id]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const exists = await prisma.reservation.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { id: true } })
    if (!exists) return notFound('Reservation')

    await prisma.reservation.update({ where: { id }, data: { status: 'CANCELLED' } })
    return ok(null, 'Reservation cancelled')
  } catch (e) {
    console.error('[DELETE /api/reservations/[id]]', e)
    return serverError()
  }
}
