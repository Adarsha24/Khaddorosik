import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { PaymentSchema } from '@/lib/validators'
import { ok, created, badRequest, notFound, validationError, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    const payments = await prisma.payment.findMany({
      where: { ...(orderId && { orderId }) },
      include: { splits: true, order: { select: { id: true, total: true, tableId: true } } },
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, total: true, status: true, tableId: true },
    })
    if (!order) return notFound('Order')
    if (order.status === 'PAID') return badRequest('Order is already paid')
    if (order.status === 'CANCELLED') return badRequest('Cannot pay a cancelled order')

    // Validate split amounts match total
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
          ...(splits && {
            splits: { create: splits.map((s) => ({ method: s.method, amount: s.amount })) },
          }),
        },
        include: { splits: true },
      })

      // Close the order and update customer stats
      await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } })

      // Free up the table
      if (order.tableId) {
        await tx.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'CLEANING' },
        })
        await tx.tableSession.updateMany({
          where: { tableId: order.tableId, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: new Date() },
        })
      }

      // Update customer loyalty (1 point per full rupee)
      const ordWithCustomer = await tx.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, total: true },
      })
      if (ordWithCustomer?.customerId) {
        await tx.customer.update({
          where: { id: ordWithCustomer.customerId },
          data: {
            totalVisits: { increment: 1 },
            totalSpent: { increment: Number(ordWithCustomer.total) },
            loyaltyPoints: { increment: Math.floor(Number(ordWithCustomer.total)) },
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
