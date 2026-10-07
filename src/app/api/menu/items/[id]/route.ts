import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { MenuItemSchema } from '@/lib/validators'
import { ok, notFound, conflict, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params
    const item = await prisma.menuItem.findFirst({
      where: { id, category: { restaurantId: auth.restaurantId } },
      include: { category: true },
    })
    if (!item) return notFound('Menu item')
    return ok(item)
  } catch (e) {
    console.error('[GET /api/menu/items/[id]]', e)
    return serverError()
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = MenuItemSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const existing = await prisma.menuItem.findFirst({ where: { id, category: { restaurantId: auth.restaurantId } }, select: { id: true } })
    if (!existing) return notFound('Menu item')

    // The target category must belong to this restaurant
    const cat = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, restaurantId: auth.restaurantId },
      select: { id: true },
    })
    if (!cat) return validationError({ fieldErrors: { categoryId: ['Category not found'] }, formErrors: [] })

    // (categoryId, name) is unique in the database
    const clash = await prisma.menuItem.findFirst({
      where: { categoryId: parsed.data.categoryId, name: parsed.data.name, NOT: { id: existing.id } },
      select: { id: true },
    })
    if (clash) return conflict('An item with this name already exists in that category')

    const item = await prisma.menuItem.update({
      where: { id: existing.id },
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } },
    })
    return ok(item)
  } catch (e) {
    console.error('[PUT /api/menu/items/[id]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const existing = await prisma.menuItem.findFirst({ where: { id, category: { restaurantId: auth.restaurantId } }, select: { id: true } })
    if (!existing) return notFound('Menu item')

    await prisma.menuItem.update({ where: { id: existing.id }, data: { available: false } })
    return ok(null, 'Item deactivated')
  } catch (e) {
    console.error('[DELETE /api/menu/items/[id]]', e)
    return serverError()
  }
}