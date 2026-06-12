import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, serverError } from '@/lib/response'
import { z } from 'zod'

const CategorySchema = z.object({
  name: z.string().min(1).max(60),
  displayOrder: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const categories = await prisma.category.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { menuItems: { where: { available: true } } } } },
    })
    return ok(categories)
  } catch (e) {
    console.error('[GET /api/menu/categories]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = CategorySchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const category = await prisma.category.create({
      data: { ...parsed.data, restaurantId: auth.restaurantId },
    })
    return created(category)
  } catch (e) {
    console.error('[POST /api/menu/categories]', e)
    return serverError()
  }
}
