import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

const DiscountSchema = z.object({
  code: z.string().min(3).max(20).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  type: z.enum(['FLAT', 'PERCENTAGE']),
  value: z.number().positive(),
  minOrder: z.number().min(0).default(0),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
})

const ApplySchema = z.object({ code: z.string(), subtotal: z.number().positive() })

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const discounts = await prisma.discount.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: { createdAt: 'desc' },
    })
    return ok(discounts)
  } catch (e) {
    console.error('[GET /api/discounts]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.action === 'apply') {
      const auth = await authenticate(req)
      if (auth instanceof Response) return auth

      const parsed = ApplySchema.safeParse(body)
      if (!parsed.success) return validationError(parsed.error.flatten())

      const { code, subtotal } = parsed.data
      const discount = await prisma.discount.findFirst({
        where: {
          restaurantId: auth.restaurantId,
          code: code.toUpperCase(),
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      })

      if (!discount) return badRequest('Invalid or expired discount code')
      if (discount.maxUses && discount.usedCount >= discount.maxUses) return badRequest('Discount code limit reached')
      if (Number(discount.minOrder) > subtotal) return badRequest(`Minimum order ₹${discount.minOrder} required`)

      const discountAmount = discount.type === 'FLAT'
        ? Math.min(Number(discount.value), subtotal)
        : parseFloat(((subtotal * Number(discount.value)) / 100).toFixed(2))

      return ok({ code: discount.code, type: discount.type, value: Number(discount.value), discountAmount, description: discount.description })
    }

    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = DiscountSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error.flatten())

    const discount = await prisma.discount.create({
      data: {
        ...parsed.data,
        restaurantId: auth.restaurantId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      },
    })
    return created(discount)
  } catch (e) {
    console.error('[POST /api/discounts]', e)
    return serverError()
  }
}
