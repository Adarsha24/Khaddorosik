import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const rid = auth.restaurantId
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    const weekStart = new Date(todayStart.getTime() - 6 * 86400000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      todayOrders, todayPaid, weekPaid, monthPaid, prevMonthPaid,
      pendingOrders, activeKOTs, openTables, totalTables,
      topItems, hourlyOrders, paymentMethods, orderTypes, lowStockCount,
    ] = await Promise.all([
      prisma.order.count({ where: { restaurantId: rid, createdAt: { gte: todayStart, lt: todayEnd } } }),
      prisma.order.aggregate({ where: { restaurantId: rid, status: 'PAID', createdAt: { gte: todayStart, lt: todayEnd } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { restaurantId: rid, status: 'PAID', createdAt: { gte: weekStart, lt: todayEnd } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { restaurantId: rid, status: 'PAID', createdAt: { gte: monthStart } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { restaurantId: rid, status: 'PAID', createdAt: { gte: prevMonthStart, lt: monthStart } }, _sum: { total: true }, _count: true }),
      prisma.order.count({ where: { restaurantId: rid, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.kOT.count({ where: { order: { restaurantId: rid }, status: { in: ['PENDING', 'PREPARING'] } } }),
      prisma.restaurantTable.count({ where: { restaurantId: rid, status: 'OCCUPIED' } }),
      prisma.restaurantTable.count({ where: { restaurantId: rid } }),
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: { order: { restaurantId: rid, status: 'PAID', createdAt: { gte: monthStart } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { restaurantId: rid, status: 'PAID', createdAt: { gte: todayStart, lt: todayEnd } },
        select: { createdAt: true, total: true },
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where: { order: { restaurantId: rid }, createdAt: { gte: monthStart }, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['orderType'],
        where: { restaurantId: rid, status: 'PAID', createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.inventoryItem.count({
        where: { restaurantId: rid },
      }),
    ])

    // Hydrate top items with names
    const itemIds = topItems.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, price: true, veg: true },
    })
    const itemMap = new Map(menuItems.map((m) => [m.id, m]))
    const topItemsHydrated = topItems.map((i) => ({
      ...itemMap.get(i.menuItemId),
      qty: i._sum.quantity ?? 0,
      revenue: ((i._sum.quantity ?? 0) * Number(itemMap.get(i.menuItemId)?.price ?? 0)),
    }))

    // Hourly breakdown (0–23 hours)
    const hourlyMap = new Array(24).fill(0).map((_, h) => ({ hour: h, orders: 0, revenue: 0 }))
    for (const o of hourlyOrders) {
      const h = new Date(o.createdAt).getHours()
      hourlyMap[h].orders++
      hourlyMap[h].revenue += Number(o.total)
    }

    // Low stock count (JS comparison)
    const allInventory = await prisma.inventoryItem.findMany({ where: { restaurantId: rid }, select: { currentStock: true, reorderLevel: true } })
    const lowStockItems = allInventory.filter((i) => Number(i.currentStock) <= Number(i.reorderLevel)).length

    const todayRevenue = Number(todayPaid._sum.total ?? 0)
    const weekRevenue = Number(weekPaid._sum.total ?? 0)
    const monthRevenue = Number(monthPaid._sum.total ?? 0)
    const prevMonthRevenue = Number(prevMonthPaid._sum.total ?? 0)
    const revenueGrowth = prevMonthRevenue > 0
      ? parseFloat((((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1))
      : 0

    return ok({
      today: {
        orders: todayOrders,
        revenue: todayRevenue,
        paid: todayPaid._count,
      },
      week: { revenue: weekRevenue, orders: weekPaid._count },
      month: { revenue: monthRevenue, orders: monthPaid._count, growth: revenueGrowth },
      live: {
        pendingOrders,
        activeKOTs,
        occupiedTables: openTables,
        totalTables,
        lowStockItems,
      },
      topItems: topItemsHydrated,
      hourly: hourlyMap,
      paymentMethods: paymentMethods.map((p) => ({ method: p.method, amount: Number(p._sum.amount ?? 0), count: p._count })),
      orderTypes: orderTypes.map((o) => ({ type: o.orderType, revenue: Number(o._sum.total ?? 0), count: o._count })),
    })
  } catch (e) {
    console.error('[GET /api/reports/dashboard]', e)
    return serverError()
  }
}
