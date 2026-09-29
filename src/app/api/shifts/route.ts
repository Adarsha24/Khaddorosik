import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'

const OpenShiftSchema = z.object({ openingCash: z.number().min(0).default(0), notes: z.string().optional() })

// Calculates what the cash drawer SHOULD contain: opening float + every
// completed CASH payment (order amount + tip) recorded since the shift opened.
async function calculateExpectedCash(restaurantId: string, openingCash: number, openedAt: Date) {
  const cashPayments = await prisma.payment.findMany({
    where: {
      method: 'CASH',
      status: 'COMPLETED',
      createdAt: { gte: openedAt },
      order: { restaurantId },
    },
    select: { amount: true, tipAmount: true },
  })

  const cashCollected = cashPayments.reduce(
    (sum, p) => sum + Number(p.amount) + Number(p.tipAmount ?? 0),
    0
  )

  return {
    expectedCash: parseFloat((openingCash + cashCollected).toFixed(2)),
    cashCollected: parseFloat(cashCollected.toFixed(2)),
    cashPaymentCount: cashPayments.length,
  }
}

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

    // For the currently open shift (if any), attach a live "expected cash"
    // figure so the UI can show a running total before close is even clicked.
    const openShift = shifts.find((s) => s.status === 'OPEN')
    let reconciliation = null
    if (openShift) {
      reconciliation = await calculateExpectedCash(
        auth.restaurantId,
        Number(openShift.openingCash),
        openShift.openedAt
      )
    }

    return ok({ shifts, reconciliation })
  } catch (e) {
    console.error('[GET /api/shifts]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER', 'CASHIER')
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
      if (closingCash === undefined) return badRequest('closingCash is required to close a shift')

      const { expectedCash, cashCollected, cashPaymentCount } = await calculateExpectedCash(
        auth.restaurantId,
        Number(shift.openingCash),
        shift.openedAt
      )
      const variance = parseFloat((closingCash - expectedCash).toFixed(2))

      const updated = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedById: auth.userId,
          closingCash,
          notes: body.notes ?? shift.notes,
        },
      })

      logAudit({
  restaurantId: auth.restaurantId,
  userId: auth.userId,
  action: Math.abs(variance) > 0.01 ? 'SHIFT_CLOSED_WITH_VARIANCE' : 'SHIFT_CLOSED',
  entityType: 'Shift',
  entityId: shift.id,
  details: { openingCash: Number(shift.openingCash), closingCash, expectedCash, variance },
})
      return ok({
  ...updated,
  expectedCash,
  cashCollected,
  cashPaymentCount,
  variance, // positive = drawer has more than expected, negative = short
   })
  }

    return badRequest('Invalid action. Use "open" or "close".')
  } catch (e) {
    console.error('[POST /api/shifts]', e)
    return serverError()
  }
}