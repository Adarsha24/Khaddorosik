import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { OrderStatusSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true, kotItems: { include: { kot: true } } } },
        payments: true,
        kots: { include: { kotItems: true } },
        customer: { select: { id: true, name: true, phone: true } },
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
    const parsed = OrderStatusSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    })
    return ok(order)
  } catch (e) {
    console.error('[PATCH /api/orders/[id]]', e)
    return serverError()
  }
}
