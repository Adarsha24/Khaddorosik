import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { CustomerSchema } from '@/lib/validators'
import { ok, notFound, conflict, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const customer = await prisma.customer.findFirst({
      where: { id, restaurantId: auth.restaurantId },
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

    const existing = await prisma.customer.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { id: true } })
    if (!existing) return notFound('Customer')

    if (parsed.data.phone) {
      const clash = await prisma.customer.findFirst({
        where: { restaurantId: auth.restaurantId, phone: parsed.data.phone, NOT: { id: existing.id } },
        select: { id: true },
      })
      if (clash) return conflict('Another customer already uses this phone number')
    }

    const customer = await prisma.customer.update({ where: { id: existing.id }, data: parsed.data })
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

    const existing = await prisma.customer.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { id: true } })
    if (!existing) return notFound('Customer')

    const customer = await prisma.customer.update({
      where: { id: existing.id },
      data: { loyaltyPoints: { increment: points } },
    })
    return ok(customer)
  } catch (e) {
    console.error('[PATCH /api/customers/[id]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const existing = await prisma.customer.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      select: { id: true, _count: { select: { orders: true, reservations: true } } },
    })
    if (!existing) return notFound('Customer')

    // Orders / reservations reference the customer, so deleting would orphan
    // billing history (and the database blocks it anyway).
    if (existing._count.orders > 0 || existing._count.reservations > 0) {
      return conflict(
        `Cannot delete: this customer has ${existing._count.orders} order(s) and ${existing._count.reservations} reservation(s)`,
      )
    }

    await prisma.customer.delete({ where: { id: existing.id } })
    return ok({ id: existing.id }, 'Customer deleted')
  } catch (e) {
    console.error('[DELETE /api/customers/[id]]', e)
    return serverError()
  }
}