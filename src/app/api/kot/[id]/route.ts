import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, badRequest, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED']
    if (!validStatuses.includes(status)) return badRequest('Invalid KOT status')

    // Verify KOT belongs to this restaurant via order
    const kot = await prisma.kOT.findFirst({
      where: { id, order: { restaurantId: auth.restaurantId } },
    })
    if (!kot) return notFound('KOT')

    const updated = await prisma.kOT.update({
      where: { id },
      data: { status, ...(status === 'COMPLETED' && { completedAt: new Date() }) },
    })

    if (status === 'READY' || status === 'COMPLETED') {
      const pending = await prisma.kOT.count({
        where: { orderId: kot.orderId, status: { in: ['PENDING', 'PREPARING'] } },
      })
      if (pending === 0) {
        await prisma.order.update({
          where: { id: kot.orderId },
          data: { status: status === 'COMPLETED' ? 'SERVED' : 'READY' },
        })
      }
    }

    return ok(updated)
  } catch (e) {
    console.error('[PATCH /api/kot/[id]]', e)
    return serverError()
  }
}
