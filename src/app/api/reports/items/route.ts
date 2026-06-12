import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const rid = auth.restaurantId
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'month'
    const topN = Math.min(50, Number(searchParams.get('limit') ?? 10))

    const now = new Date()
    const from =
      period === 'today' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) :
      period === 'week' ? new Date(now.getTime() - 7 * 86400000) :
      new Date(now.getFullYear(), now.getMonth(), 1)

    const itemSales = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: { order: { restaurantId: rid, status: 'PAID', createdAt: { gte: from } } },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: topN,
    })

    const menuItemIds = itemSales.map((s) => s.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: { category: { select: { name: true } } },
    })
    const itemMap = new Map(menuItems.map((m) => [m.id, m]))

    const enriched = itemSales.map((s) => {
      const item = itemMap.get(s.menuItemId)
      return {
        menuItemId: s.menuItemId,
        name: item?.name,
        category: item?.category?.name,
        price: item?.price,
        veg: item?.veg,
        totalQty: s._sum.quantity ?? 0,
        orderCount: s._count.id,
        revenue: parseFloat(((s._sum.quantity ?? 0) * Number(item?.price ?? 0)).toFixed(2)),
      }
    })

    const categoryBreakdown = enriched.reduce<Record<string, { qty: number; revenue: number }>>((acc, i) => {
      const cat = i.category ?? 'Other'
      if (!acc[cat]) acc[cat] = { qty: 0, revenue: 0 }
      acc[cat].qty += i.totalQty
      acc[cat].revenue += i.revenue
      return acc
    }, {})

    return ok({ period: { from, to: now }, topItems: enriched, categoryBreakdown })
  } catch (e) {
    console.error('[GET /api/reports/items]', e)
    return serverError()
  }
}
