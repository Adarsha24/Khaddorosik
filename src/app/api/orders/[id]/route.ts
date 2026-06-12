import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const StatusSchema = z.object({ status: z.enum(['PENDING','CONFIRMED','PREPARING','READY','SERVED','PAID','CANCELLED']) })

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const order = await prisma.order.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true, veg: true } }, kotItems: true } },
        payments: { include: { splits: true } },
        kots: { include: { kotItems: { include: { orderItem: { include: { menuItem: true } } } } } },
        customer: { select: { id: true, name: true, phone: true, loyaltyPoints: true } },
      },
    })

    if (!order) return notFound('Order')
    return ok(order)
  } catch (e) {
    console.error('[GET /api/orders/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = StatusSchema.safeParse(await req.json())
    if (!parsed.success) return notFound('Invalid status')

    const exists = await prisma.order.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { id: true } })
    if (!exists) return notFound('Order')

    const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } })
    return ok(order)
  } catch (e) {
    console.error('[PATCH /api/orders/[id]]', e)
    return serverError()
  }
}
