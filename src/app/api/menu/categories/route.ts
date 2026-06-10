import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { CategorySchema } from '@/lib/validators'
import { ok, created, validationError, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)
    const categories = await prisma.category.findMany({
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

    const category = await prisma.category.create({ data: parsed.data })
    return created(category)
  } catch (e) {
    console.error('[POST /api/menu/categories]', e)
    return serverError()
  }
}
