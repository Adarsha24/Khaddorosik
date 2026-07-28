import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, created, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

const OpenShiftSchema = z.object({ openingCash: z.number().min(0).default(0), notes: z.string().optional() })

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'OPEN'

    const shifts = await prisma.shift.findMany({
      where: { restaurantId: auth.restaurantId, ...(status && { status: status as never }) },
      orderBy: { openedAt: 'desc' },
      take: 10,
    })
    return ok(shifts)
  } catch (e) {
    console.error('[GET /api/shifts]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const body = await req.json()
    const action = body.action as string

    if (action === 'open') {
      const existing = await prisma.shift.findFirst({
        where: { restaurantId: auth.restaurantId, status: 'OPEN' },
      })
      if (existing) return badRequest('A shift is already open')

      const parsed = OpenShiftSchema.safeParse(body)
      if (!parsed.success) return badRequest('Invalid data')

      const shift = await prisma.shift.create({
        data: { restaurantId: auth.restaurantId, openedById: auth.userId, openingCash: parsed.data.openingCash, notes: parsed.data.notes },
      })
      return created(shift, 'Shift opened')
    }

    if (action === 'close') {
      const shift = await prisma.shift.findFirst({
        where: { restaurantId: auth.restaurantId, status: 'OPEN' },
      })
      if (!shift) return badRequest('No open shift found')

      const closingCash = typeof body.closingCash === 'number' ? body.closingCash : undefined
      const updated = await prisma.shift.update({
        where: { id: shift.id },
        data: { status: 'CLOSED', closedAt: new Date(), closedById: auth.userId, closingCash, notes: body.notes ?? shift.notes },
      })
      return ok(updated)
    }

    return badRequest('Invalid action. Use "open" or "close".')
  } catch (e) {
    console.error('[POST /api/shifts]', e)
    return serverError()
  }
}
