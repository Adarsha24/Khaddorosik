import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { AddItemsSchema } from '@/lib/validators'
import { ok, notFound, badRequest, validationError, serverError } from '@/lib/response'

const TAX_RATE = parseFloat(process.env.TAX_RATE ?? '0.05')

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = AddItemsSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return notFound('Order')
    if (['PAID', 'CANCELLED'].includes(order.status)) {
      return badRequest('Cannot add items to a closed order')
    }

    const menuItemIds = parsed.data.items.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, available: true },
    })
    if (menuItems.length !== menuItemIds.length) {
      return badRequest('One or more menu items are unavailable')
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]))

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Add new order items
      const newItems = await Promise.all(
        parsed.data.items.map((i) =>
          tx.orderItem.create({
            data: {
              orderId: id,
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              unitPrice: priceMap.get(i.menuItemId)!,
              notes: i.notes,
            },
          })
        )
      )

      // Generate new KOT for added items
      await tx.kOT.create({
        data: {
          orderId: id,
          tableId: order.tableId ?? undefined,
          status: 'PENDING',
          kotItems: { create: newItems.map((item) => ({ orderItemId: item.id, quantity: item.quantity })) },
        },
      })

      // Recalculate totals
      const allItems = await tx.orderItem.findMany({ where: { orderId: id } })
      const subtotal = allItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
      const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2))
      const total = parseFloat((subtotal + taxAmount).toFixed(2))

      return tx.order.update({
        where: { id },
        data: { subtotal, taxAmount, total },
        include: { items: { include: { menuItem: { select: { id: true, name: true } } } } },
      })
    })

    return ok(updatedOrder)
  } catch (e) {
    console.error('[POST /api/orders/[id]/items]', e)
    return serverError()
  }
}
