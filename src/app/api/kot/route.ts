import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'PENDING,PREPARING'
    const statuses = status.split(',')

    const kots = await prisma.kOT.findMany({
      where: { status: { in: statuses as never[] } },
      include: {
        kotItems: {
          include: { orderItem: { include: { menuItem: { select: { id: true, name: true, veg: true } } } } },
        },
        order: { select: { id: true, orderType: true, tableId: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return ok(kots)
  } catch (e) {
    console.error('[GET /api/kot]', e)
    return serverError()
  }
}
