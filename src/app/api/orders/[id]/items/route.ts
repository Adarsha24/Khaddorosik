import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const Schema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1),
})

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return badRequest('Invalid items data')

    const order = await prisma.order.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: { restaurant: { select: { taxRate: true, cgstRate: true, sgstRate: true } } },
    })
    if (!order) return notFound('Order')
    if (['PAID', 'CANCELLED'].includes(order.status)) return badRequest('Cannot add items to a closed order')

    const menuItemIds = parsed.data.items.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, available: true, category: { restaurantId: auth.restaurantId } },
    })
    if (menuItems.length !== menuItemIds.length) return badRequest('One or more menu items are unavailable')

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]))

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const newItems = await Promise.all(
        parsed.data.items.map((i) =>
          tx.orderItem.create({
            data: { orderId: id, menuItemId: i.menuItemId, quantity: i.quantity, unitPrice: priceMap.get(i.menuItemId)!, notes: i.notes },
          })
        )
      )

      await tx.kOT.create({
        data: {
          orderId: id, tableId: order.tableId ?? undefined, status: 'PENDING',
          kotItems: { create: newItems.map((item) => ({ orderItemId: item.id, quantity: item.quantity })) },
        },
      })

      const allItems = await tx.orderItem.findMany({ where: { orderId: id } })
      const subtotal = allItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
      const discountAmount = Number(order.discountAmount)
      const taxable = subtotal - discountAmount
      const cgstRate = Number(order.restaurant?.cgstRate ?? 0.025)
      const sgstRate = Number(order.restaurant?.sgstRate ?? 0.025)
      const cgstAmount = parseFloat((taxable * cgstRate).toFixed(2))
      const sgstAmount = parseFloat((taxable * sgstRate).toFixed(2))
      const taxAmount = cgstAmount + sgstAmount
      const total = parseFloat((taxable + taxAmount).toFixed(2))

      return tx.order.update({
        where: { id },
        data: { subtotal, taxAmount, cgstAmount, sgstAmount, total },
        include: { items: { include: { menuItem: { select: { id: true, name: true, veg: true } } } } },
      })
    })

    return ok(updatedOrder)
  } catch (e) {
    console.error('[POST /api/orders/[id]/items]', e)
    return serverError()
  }
}
