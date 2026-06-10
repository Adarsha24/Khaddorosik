import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { UpdateItemSchema } from '@/lib/validators'
import { ok, notFound, badRequest, validationError, serverError } from '@/lib/response'

const TAX_RATE = parseFloat(process.env.TAX_RATE ?? '0.05')

type Ctx = { params: Promise<{ id: string; itemId: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id, itemId } = await params
    const parsed = UpdateItemSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId: id } })
    if (!item) return notFound('Order item')

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity: parsed.data.quantity, notes: parsed.data.notes },
    })

    // Recalculate order totals
    const allItems = await prisma.orderItem.findMany({ where: { orderId: id } })
    const subtotal = allItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2))
    const total = parseFloat((subtotal + taxAmount).toFixed(2))

    const order = await prisma.order.update({
      where: { id },
      data: { subtotal, taxAmount, total },
      include: { items: true },
    })

    return ok(order)
  } catch (e) {
    console.error('[PUT /api/orders/[id]/items/[itemId]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id, itemId } = await params

    const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId: id } })
    if (!item) return notFound('Order item')

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order || ['PAID', 'CANCELLED'].includes(order.status)) {
      return badRequest('Cannot modify a closed order')
    }

    await prisma.$transaction(async (tx) => {
      await tx.kOTItem.deleteMany({ where: { orderItemId: itemId } })
      await tx.orderItem.delete({ where: { id: itemId } })

      const remaining = await tx.orderItem.findMany({ where: { orderId: id } })
      const subtotal = remaining.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
      const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2))
      await tx.order.update({ where: { id }, data: { subtotal, taxAmount, total: subtotal + taxAmount } })
    })

    return ok(null, 'Item removed from order')
  } catch (e) {
    console.error('[DELETE /api/orders/[id]/items/[itemId]]', e)
    return serverError()
  }
}
