import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, created, badRequest, notFound, validationError, serverError } from '@/lib/response'
import { z } from 'zod'

class OrderAlreadyPaidError extends Error {}

const PaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET', 'SPLIT']),
  reference: z.string().optional(),
  tipAmount: z.number().min(0).default(0),
  splits: z.array(z.object({
    method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET']),
    amount: z.number().positive(),
  })).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    const payments = await prisma.payment.findMany({
      where: {
        order: { restaurantId: auth.restaurantId },
        ...(orderId && { orderId }),
      },
      include: { splits: true, order: { select: { id: true, total: true, tableId: true, billNo: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return ok(payments)
  } catch (e) {
    console.error('[GET /api/payments]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = PaymentSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { orderId, method, splits, reference, tipAmount } = parsed.data

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId: auth.restaurantId },
      select: { id: true, total: true, status: true, tableId: true, customerId: true },
    })
    if (!order) return notFound('Order')
    if (order.status === 'PAID') return badRequest('Order is already paid')
    if (order.status === 'CANCELLED') return badRequest('Cannot pay a cancelled order')

    if (method === 'SPLIT') {
      if (!splits?.length) return badRequest('Split payments require split details')
      const splitTotal = splits.reduce((s, sp) => s + sp.amount, 0)
      // Splits still cover the order total only — tip is tracked separately below,
      // not part of what gets split across payment methods.
      if (Math.abs(splitTotal - Number(order.total)) > 0.01) {
        return badRequest(`Split amounts (${splitTotal}) must equal order total (${order.total})`)
      }
    }

    const payment = await prisma.$transaction(async (tx) => {
      // Guard against two near-simultaneous "Proceed to Payment" clicks:
      // the findFirst check above is a fast pre-check for a friendly error,
      // but only this conditional update inside the transaction is actually
      // race-safe. If another request already flipped the order to PAID
      // between our check and here, this update matches zero rows and we
      // abort instead of creating a second Payment record.
      const guard = await tx.order.updateMany({
        where: { id: orderId, status: { notIn: ['PAID', 'CANCELLED'] } },
        data: { status: 'PAID' },
      })
      if (guard.count === 0) {
        throw new OrderAlreadyPaidError()
      }

      const pmt = await tx.payment.create({
        data: {
          orderId,
          amount: order.total,
          tipAmount,
          method,
          reference,
          status: 'COMPLETED',
          ...(splits && { splits: { create: splits.map((s) => ({ method: s.method, amount: s.amount })) } }),
        },
        include: { splits: true },
      })

      if (order.tableId) {
        await tx.restaurantTable.update({ where: { id: order.tableId }, data: { status: 'CLEANING' } })
        await tx.tableSession.updateMany({
          where: { tableId: order.tableId, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: new Date() },
        })
      }

      if (order.customerId) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalVisits: { increment: 1 },
            // Loyalty points and spend tracking are based on food revenue only,
            // not inflated by tips.
            totalSpent: { increment: Number(order.total) },
            loyaltyPoints: { increment: Math.floor(Number(order.total)) },
          },
        })
      }

      return pmt
    })

    return created(payment, 'Payment processed successfully')
  } catch (e) {
    if (e instanceof OrderAlreadyPaidError) {
      return badRequest('Order is already paid or cancelled')
    }
    console.error('[POST /api/payments]', e)
    return serverError()
  }
}