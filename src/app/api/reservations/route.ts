import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ReservationSchema } from '@/lib/validators'
import { ok, created, validationError, serverError, paginated } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where = {
      ...(date && { date: new Date(date) }),
      ...(status && { status: status as never }),
    }

    const [reservations, total] = await prisma.$transaction([
      prisma.reservation.findMany({
        where,
        include: {
          table: { select: { id: true, number: true, capacity: true } },
          customer: { select: { id: true, name: true, phone: true, loyaltyPoints: true } },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ])

    return paginated(reservations, total, page, limit)
  } catch (e) {
    console.error('[GET /api/reservations]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = ReservationSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const reservation = await prisma.reservation.create({
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date),
        status: 'PENDING',
      },
      include: {
        table: { select: { id: true, number: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return created(reservation)
  } catch (e) {
    console.error('[POST /api/reservations]', e)
    return serverError()
  }
}
