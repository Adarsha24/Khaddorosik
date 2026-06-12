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
    const period = searchParams.get('period') ?? 'today'

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const from =
      period === 'today' ? todayStart :
      period === 'week' ? new Date(todayStart.getTime() - 6 * 86400000) :
      period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) :
      new Date(searchParams.get('from') ?? todayStart)

    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

    const [summary, byMethod, byType, orders] = await Promise.all([
      prisma.order.aggregate({
        where: { restaurantId: rid, status: 'PAID', createdAt: { gte: from, lte: to } },
        _sum: { subtotal: true, taxAmount: true, discountAmount: true, total: true, cgstAmount: true, sgstAmount: true },
        _count: true,
        _avg: { total: true },
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where: { order: { restaurantId: rid }, status: 'COMPLETED', createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['orderType'],
        where: { restaurantId: rid, status: 'PAID', createdAt: { gte: from, lte: to } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.findMany({
        where: { restaurantId: rid, status: 'PAID', createdAt: { gte: from, lte: to } },
        select: { id: true, billNo: true, total: true, subtotal: true, taxAmount: true, discountAmount: true, cgstAmount: true, sgstAmount: true, orderType: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    // Hourly distribution
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const hrs = orders.filter((o) => new Date(o.createdAt).getHours() === h)
      return { hour: h, orders: hrs.length, revenue: hrs.reduce((s, o) => s + Number(o.total), 0) }
    })

    return ok({
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        totalOrders: summary._count,
        subtotal: Number(summary._sum.subtotal ?? 0),
        taxAmount: Number(summary._sum.taxAmount ?? 0),
        cgstAmount: Number(summary._sum.cgstAmount ?? 0),
        sgstAmount: Number(summary._sum.sgstAmount ?? 0),
        discountAmount: Number(summary._sum.discountAmount ?? 0),
        totalRevenue: Number(summary._sum.total ?? 0),
        avgOrderValue: Number(summary._avg.total ?? 0),
      },
      byMethod: byMethod.map((p) => ({ method: p.method, amount: Number(p._sum.amount ?? 0), count: p._count })),
      byType: byType.map((o) => ({ type: o.orderType, revenue: Number(o._sum.total ?? 0), count: o._count })),
      hourly,
      orders,
    })
  } catch (e) {
    console.error('[GET /api/reports/sales]', e)
    return serverError()
  }
}
