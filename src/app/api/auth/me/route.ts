import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        employee: { select: { name: true, role: true, phone: true } },
        restaurant: { select: { id: true, name: true, logo: true, taxRate: true, cgstRate: true, sgstRate: true, gstNumber: true, currency: true, address: true, phone: true } },
      },
    })

    if (!user) return notFound('User')

    return ok({
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      name: user.employee?.name ?? user.email,
      employee: user.employee,
      restaurant: user.restaurant,
    })
  } catch (e) {
    console.error('[GET /api/auth/me]', e)
    return serverError()
  }
}
