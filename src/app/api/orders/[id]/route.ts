import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, badRequest, validationError, serverError } from '@/lib/response'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'


type Ctx = { params: Promise<{ id: string }> }

const UpdateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED']).optional(),
  discountCode: z.string().optional(),
  // null detaches the customer (walk-in)
  customerId: z.string().uuid().nullable().optional(),
}).refine(
  (data) => data.status !== undefined || data.discountCode !== undefined || data.customerId !== undefined,
  { message: 'Provide at least one of: status, discountCode, customerId' },
)

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const order = await prisma.order.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true, veg: true } }, kotItems: true } },
        payments: { include: { splits: true } },
        kots: { include: { kotItems: { include: { orderItem: { include: { menuItem: true } } } } } },
        customer: { select: { id: true, name: true, phone: true, loyaltyPoints: true } },
      },
    })

    if (!order) return notFound('Order')
    return ok(order)
  } catch (e) {
    console.error('[GET /api/orders/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = UpdateOrderSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { status, discountCode, customerId } = parsed.data

    const existing = await prisma.order.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: { items: true },
    })
    if (!existing) return notFound('Order')

    // ── Customer-only update (attach / detach a customer) ────────────────
    if (customerId !== undefined && status === undefined && discountCode === undefined) {
      if (existing.status === 'PAID' || existing.status === 'CANCELLED') {
        return badRequest('Cannot change the customer on a paid or cancelled order')
      }
      if (customerId !== null) {
        const customer = await prisma.customer.findFirst({
          where: { id: customerId, restaurantId: auth.restaurantId },
          select: { id: true },
        })
        if (!customer) return notFound('Customer')
      }
      const updated = await prisma.order.update({
        where: { id },
        data: { customerId },
        include: { customer: { select: { id: true, name: true, phone: true, loyaltyPoints: true } } },
      })
      return ok(updated)
    }

    // ── Status-only update ───────────────────────────────────────────────
    if (status !== undefined && discountCode === undefined) {
  if (status === 'CANCELLED') {
    // Cancelling an order needs to unwind everything the order touched —
    // otherwise the KOT lingers on the Kitchen screen, the table never
    // frees up, and a used discount code's slot is never given back.
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id }, data: { status } })

      // Take any open KOTs for this order off the active kitchen queue.
      // NOTE: mapped to 'COMPLETED' since that's the only "closed" KOT
      // status in use elsewhere in this codebase — if your KotStatus enum
      // has a dedicated CANCELLED value, use that instead here.
      await tx.kOT.updateMany({
        where: { orderId: id, status: { in: ['PENDING', 'PREPARING', 'READY'] } },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })

      if (existing.tableId) {
        await tx.restaurantTable.update({ where: { id: existing.tableId }, data: { status: 'AVAILABLE' } })
        await tx.tableSession.updateMany({
          where: { tableId: existing.tableId, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: new Date() },
        })
      }

      if (existing.discountCode) {
        await tx.discount.updateMany({
          where: { restaurantId: auth.restaurantId, code: existing.discountCode, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        })
      }

      return updated
    })

    logAudit({
      restaurantId: auth.restaurantId,
      userId: auth.userId,
      action: 'ORDER_CANCELLED',
      entityType: 'Order',
      entityId: order.id,
      details: { previousStatus: existing.status, orderTotal: Number(order.total) },
    })

    return ok(order)
  }

  const order = await prisma.order.update({ where: { id }, data: { status } })
  return ok(order)
}

    // ── Discount update: recompute tax/total the same way order creation does ──
    if (existing.status === 'PAID' || existing.status === 'CANCELLED') {
      return badRequest('Cannot apply a discount to a paid or cancelled order')
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
      select: { cgstRate: true, sgstRate: true },
    })
    const cgstRate = Number(restaurant?.cgstRate ?? 0.025)
    const sgstRate = Number(restaurant?.sgstRate ?? 0.025)

    const subtotal = existing.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    )

    let discountAmount = 0
    let validDiscount = null
    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: {
          restaurantId: auth.restaurantId,
          code: discountCode.toUpperCase(),
          active: true,
          AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] }],
        },
      })
      const maxUsesOk = discount === null || discount.maxUses === null || discount.usedCount < discount.maxUses
      if (!discount) return badRequest('Discount code not found or inactive')
      if (!maxUsesOk) return badRequest('Discount code has reached its usage limit')
      if (Number(discount.minOrder) > subtotal) {
        return badRequest(`Order subtotal must be at least ${discount.minOrder} to use this code`)
      }
      discountAmount = discount.type === 'FLAT'
        ? Math.min(Number(discount.value), subtotal)
        : parseFloat(((subtotal * Number(discount.value)) / 100).toFixed(2))
      validDiscount = discount
    }

    const taxableAmount = subtotal - discountAmount
    const cgstAmount = parseFloat((taxableAmount * cgstRate).toFixed(2))
    const sgstAmount = parseFloat((taxableAmount * sgstRate).toFixed(2))
    const taxAmount = cgstAmount + sgstAmount
    const total = parseFloat((taxableAmount + taxAmount).toFixed(2))

    const previousCode = existing.discountCode

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          discountCode: validDiscount?.code,
          discountAmount,
          cgstAmount,
          sgstAmount,
          taxAmount,
          total,
          ...(status !== undefined ? { status } : {}),
        },
      })

      if (discountCode !== undefined) {
        logAudit({
          restaurantId: auth.restaurantId,
          userId: auth.userId,
          action: previousCode ? 'DISCOUNT_CHANGED' : 'DISCOUNT_APPLIED',
          entityType: 'Order',
          entityId: updated.id,
          details: {
            previousCode: previousCode ?? null,
            newCode: validDiscount?.code ?? null,
            discountAmount,
            orderTotal: total,
          },
        }) // fire-and-forget, not awaited — don't slow down the response
      }

      // Only touch usage counters if the discount code actually changed
      const newCode = validDiscount?.code
      if (previousCode !== newCode) {
        // Give back the slot on the old code, if there was one
        if (previousCode) {
          await tx.discount.updateMany({
            where: { restaurantId: auth.restaurantId, code: previousCode, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          })
        }
        // Consume a slot on the new code, if there is one
        if (validDiscount) {
          await tx.discount.update({
            where: { id: validDiscount.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }

      return updated
    })

    return ok(order)
  } catch (e) {
    console.error('[PATCH /api/orders/[id]]', e)
    return serverError()
  }
}