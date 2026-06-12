import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, serverError } from '@/lib/response'
import { z } from 'zod'

const SupplierSchema = z.object({
  name: z.string().min(1).max(100),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const suppliers = await prisma.supplier.findMany({
      where: { restaurantId: auth.restaurantId, active: true },
      include: { _count: { select: { inventory: true } } },
      orderBy: { name: 'asc' },
    })
    return ok(suppliers)
  } catch (e) {
    console.error('[GET /api/suppliers]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = SupplierSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const supplier = await prisma.supplier.create({
      data: { ...parsed.data, restaurantId: auth.restaurantId },
    })
    return created(supplier)
  } catch (e) {
    console.error('[POST /api/suppliers]', e)
    return serverError()
  }
}
