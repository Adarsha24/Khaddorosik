import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, created, badRequest, notFound, validationError, serverError } from '@/lib/response'
import { z } from 'zod'

const PaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET', 'SPLIT']),
  reference: z.string().optional(),
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

    const { orderId, method, splits, reference } = parsed.data

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
      if (Math.abs(splitTotal - Number(order.total)) > 0.01) {
        return badRequest(`Split amounts (${splitTotal}) must equal order total (${order.total})`)
      }
    }

    const payment = await prisma.$transaction(async (tx) => {
      const pmt = await tx.payment.create({
        data: {
          orderId,
          amount: order.total,
          method,
          reference,
          status: 'COMPLETED',
          ...(splits && { splits: { create: splits.map((s) => ({ method: s.method, amount: s.amount })) } }),
        },
        include: { splits: true },
      })

      await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } })

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
            totalSpent: { increment: Number(order.total) },
            loyaltyPoints: { increment: Math.floor(Number(order.total)) },
          },
        })
      }

      return pmt
    })

    return created(payment, 'Payment processed successfully')
  } catch (e) {
    console.error('[POST /api/payments]', e)
    return serverError()
  }
}
