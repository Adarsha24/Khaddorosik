import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { CreateOrderSchema } from '@/lib/validators'
import { ok, created, validationError, badRequest, serverError, paginated } from '@/lib/response'

const TAX_RATE = parseFloat(process.env.TAX_RATE ?? '0.05')

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const tableId = searchParams.get('tableId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where = {
      ...(status && { status: status as never }),
      ...(tableId && { tableId }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
          payments: { select: { id: true, method: true, amount: true, status: true } },
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

    const { tableId, customerId, orderType, notes, items } = parsed.data

    // Fetch menu items to get prices
    const menuItemIds = items.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, available: true },
    })

    if (menuItems.length !== menuItemIds.length) {
      return badRequest('One or more menu items are unavailable or do not exist')
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]))
    const subtotal = items.reduce((sum, i) => sum + priceMap.get(i.menuItemId)! * i.quantity, 0)
    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2))
    const total = parseFloat((subtotal + taxAmount).toFixed(2))

    // Find open table session if tableId provided
    let tableSessionId: string | undefined
    if (tableId) {
      const session = await prisma.tableSession.findFirst({
        where: { tableId, status: 'OPEN' },
      })
      tableSessionId = session?.id
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          tableId,
          tableSessionId,
          customerId,
          orderType,
          notes,
          subtotal,
          taxAmount,
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
        include: { items: { include: { menuItem: { select: { id: true, name: true } } } } },
      })

      // Auto-generate KOT
      const kot = await tx.kOT.create({
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

      // Update table status to OCCUPIED if table provided
      if (tableId) {
        await tx.restaurantTable.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        })
      }

      return { ...newOrder, kotId: kot.id }
    })

    return created(order)
  } catch (e) {
    console.error('[POST /api/orders]', e)
    return serverError()
  }
}
