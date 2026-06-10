import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { CustomerSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: 'PAID' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, total: true, createdAt: true, orderType: true },
        },
        reservations: {
          orderBy: { date: 'desc' },
          take: 5,
          select: { id: true, date: true, partySize: true, status: true },
        },
      },
    })
    if (!customer) return notFound('Customer')
    return ok(customer)
  } catch (e) {
    console.error('[GET /api/customers/[id]]', e)
    return serverError()
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = CustomerSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const customer = await prisma.customer.update({ where: { id }, data: parsed.data })
    return ok(customer)
  } catch (e) {
    console.error('[PUT /api/customers/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { id } = await params
    const { points } = await req.json()
    if (typeof points !== 'number') return ok(null)

    const customer = await prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: { increment: points } },
    })
    return ok(customer)
  } catch (e) {
    console.error('[PATCH /api/customers/[id]]', e)
    return serverError()
  }
}
