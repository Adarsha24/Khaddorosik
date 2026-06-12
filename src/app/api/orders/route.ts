import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, created, validationError, badRequest, serverError, paginated } from '@/lib/response'
import { z } from 'zod'

const CreateOrderSchema = z.object({
  tableId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']).default('DINE_IN'),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const tableId = searchParams.get('tableId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where = {
      restaurantId: auth.restaurantId,
      ...(status && { status: status as never }),
      ...(tableId && { tableId }),
      ...(from || to ? { createdAt: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } } : {}),
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { id: true, name: true, price: true, veg: true } } } },
          payments: { select: { id: true, method: true, amount: true, status: true } },
          customer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return paginated(orders, total, page, limit)
  } catch (e) {
    console.error('[GET /api/orders]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = CreateOrderSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { tableId, customerId, orderType, notes, items, discountCode } = parsed.data

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
      select: { taxRate: true, cgstRate: true, sgstRate: true },
    })
    const taxRate = Number(restaurant?.taxRate ?? 0.05)
    const cgstRate = Number(restaurant?.cgstRate ?? 0.025)
    const sgstRate = Number(restaurant?.sgstRate ?? 0.025)

    const menuItemIds = items.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, available: true, category: { restaurantId: auth.restaurantId } },
    })

    if (menuItems.length !== menuItemIds.length) {
      return badRequest('One or more menu items are unavailable or do not exist')
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]))
    const subtotal = items.reduce((sum, i) => sum + priceMap.get(i.menuItemId)! * i.quantity, 0)

    // Handle discount
    let discountAmount = 0
    let validDiscount = null
    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: {
          restaurantId: auth.restaurantId,
          code: discountCode.toUpperCase(),
          active: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
          ],
        },
      })
      // Check maxUses in application code (can't compare two fields in Prisma without raw SQL)
      const maxUsesOk = discount === null || discount.maxUses === null || discount.usedCount < discount.maxUses
      if (discount && maxUsesOk && Number(discount.minOrder) <= subtotal) {
        discountAmount = discount.type === 'FLAT'
          ? Math.min(Number(discount.value), subtotal)
          : parseFloat(((subtotal * Number(discount.value)) / 100).toFixed(2))
        validDiscount = discount
      }
    }

    const taxableAmount = subtotal - discountAmount
    const cgstAmount = parseFloat((taxableAmount * cgstRate).toFixed(2))
    const sgstAmount = parseFloat((taxableAmount * sgstRate).toFixed(2))
    const taxAmount = cgstAmount + sgstAmount
    const total = parseFloat((taxableAmount + taxAmount).toFixed(2))

    let tableSessionId: string | undefined
    if (tableId) {
      const session = await prisma.tableSession.findFirst({
        where: { tableId, status: 'OPEN' },
      })
      tableSessionId = session?.id
    }

    // Get next bill number for this restaurant
    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId: auth.restaurantId },
      orderBy: { billNo: 'desc' },
      select: { billNo: true },
    })
    const billNo = (lastOrder?.billNo ?? 0) + 1

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          restaurantId: auth.restaurantId,
          billNo,
          tableId,
          tableSessionId,
          customerId,
          orderType,
          notes,
          subtotal,
          taxAmount,
          cgstAmount,
          sgstAmount,
          discountAmount,
          discountCode: validDiscount?.code,
          total,
          createdBy: auth.userId,
          status: 'PENDING',
          items: {
            create: items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              unitPrice: priceMap.get(i.menuItemId)!,
              notes: i.notes,
            })),
          },
        },
        include: { items: { include: { menuItem: { select: { id: true, name: true, veg: true } } } } },
      })

      await tx.kOT.create({
        data: {
          orderId: newOrder.id,
          tableId,
          status: 'PENDING',
          kotItems: {
            create: newOrder.items.map((item) => ({
              orderItemId: item.id,
              quantity: item.quantity,
            })),
          },
        },
      })

      if (tableId) {
        await tx.restaurantTable.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        })
      }

      if (validDiscount) {
        await tx.discount.update({
          where: { id: validDiscount.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      return newOrder
    })

    return created(order)
  } catch (e) {
    console.error('[POST /api/orders]', e)
    return serverError()
  }
}
