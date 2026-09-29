import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'PENDING,PREPARING'
    const statuses = status.split(',')

    const kots = await prisma.kOT.findMany({
      where: {
        status: { in: statuses as never[] },
        order: { restaurantId: auth.restaurantId },
      },
      include: {
        kotItems: {
          include: { orderItem: { include: { menuItem: { select: { id: true, name: true, veg: true } } } } },
        },
        order: { select: { id: true, orderType: true, tableId: true, billNo: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Resolve real table numbers separately, since Order has no direct relation to RestaurantTable
    const tableIds = [...new Set(kots.map((k) => k.order?.tableId).filter((id): id is string => !!id))]
    const tables = tableIds.length
      ? await prisma.restaurantTable.findMany({
          where: { id: { in: tableIds } },
          select: { id: true, number: true },
        })
      : []
    const tableNumberMap = new Map(tables.map((t) => [t.id, t.number]))

    const hydrated = kots.map((k) => ({
      ...k,
      order: k.order
        ? { ...k.order, table: k.order.tableId ? { number: tableNumberMap.get(k.order.tableId) } : undefined }
        : undefined,
    }))

    return ok(hydrated)
  } catch (e) {
    console.error('[GET /api/kot]', e)
    return serverError()
  }
}