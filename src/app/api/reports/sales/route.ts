import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER', 'CASHIER')
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'today'

    const now = new Date()
    let from: Date
    let to: Date = now

    if (period === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      from = new Date(now)
      from.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'custom') {
      from = new Date(searchParams.get('from') ?? now.toISOString())
      to = new Date(searchParams.get('to') ?? now.toISOString())
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    const paidOrders = await prisma.order.findMany({
      where: { status: 'PAID', createdAt: { gte: from, lte: to } },
      select: {
        id: true,
        total: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        orderType: true,
        createdAt: true,
        payments: { select: { method: true, amount: true } },
      },
    })

    const revenue = paidOrders.reduce((s, o) => s + Number(o.total), 0)
    const tax = paidOrders.reduce((s, o) => s + Number(o.taxAmount), 0)
    const discount = paidOrders.reduce((s, o) => s + Number(o.discountAmount), 0)
    const avgOrderValue = paidOrders.length ? revenue / paidOrders.length : 0

    // Group by payment method
    const byMethod = paidOrders
      .flatMap((o) => o.payments)
      .reduce<Record<string, number>>((acc, p) => {
        acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount)
        return acc
      }, {})

    // Group by order type
    const byType = paidOrders.reduce<Record<string, { count: number; revenue: number }>>((acc, o) => {
      if (!acc[o.orderType]) acc[o.orderType] = { count: 0, revenue: 0 }
      acc[o.orderType].count++
      acc[o.orderType].revenue += Number(o.total)
      return acc
    }, {})

    // Hourly distribution (today only)
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const orders = paidOrders.filter((o) => new Date(o.createdAt).getHours() === h)
      return { hour: h, orders: orders.length, revenue: orders.reduce((s, o) => s + Number(o.total), 0) }
    })

    return ok({
      period: { from, to },
      summary: {
        totalOrders: paidOrders.length,
        revenue: parseFloat(revenue.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      },
      byPaymentMethod: byMethod,
      byOrderType: byType,
      hourlyDistribution: hourly,
    })
  } catch (e) {
    console.error('[GET /api/reports/sales]', e)
    return serverError()
  }
}
