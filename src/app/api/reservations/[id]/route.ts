import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ReservationSchema, ReservationStatusSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
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

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = ReservationSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { ...parsed.data, date: new Date(parsed.data.date) },
    })
    return ok(reservation)
  } catch (e) {
    console.error('[PUT /api/reservations/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = ReservationStatusSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    // If confirmed, mark table as reserved
    if (parsed.data.status === 'CONFIRMED' && reservation.tableId) {
      await prisma.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: 'RESERVED' },
      })
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
    await prisma.reservation.update({ where: { id }, data: { status: 'CANCELLED' } })
    return ok(null, 'Reservation cancelled')
  } catch (e) {
    console.error('[DELETE /api/reservations/[id]]', e)
    return serverError()
  }
}
