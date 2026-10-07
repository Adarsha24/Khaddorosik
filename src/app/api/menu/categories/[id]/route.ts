import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, notFound, conflict, validationError, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(60),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = UpdateCategorySchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const existing = await prisma.category.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      select: { id: true },
    })
    if (!existing) return notFound('Category')

    const dup = await prisma.category.findFirst({
      where: { restaurantId: auth.restaurantId, name: parsed.data.name, NOT: { id: existing.id } },
      select: { id: true },
    })
    if (dup) return conflict('A category with this name already exists')

    const category = await prisma.category.update({ where: { id: existing.id }, data: parsed.data })
    return ok(category)
  } catch (e) {
    console.error('[PUT /api/menu/categories/[id]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const existing = await prisma.category.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      select: { id: true, _count: { select: { menuItems: true } } },
    })
    if (!existing) return notFound('Category')

    // Items (even hidden ones) may be referenced by past orders, so only an empty category can go.
    if (existing._count.menuItems > 0) {
      return conflict(
        `Cannot delete: this category still has ${existing._count.menuItems} item(s). Move or hide them first.`,
      )
    }

    await prisma.category.delete({ where: { id: existing.id } })
    return ok({ id: existing.id }, 'Category deleted')
  } catch (e) {
    console.error('[DELETE /api/menu/categories/[id]]', e)
    return serverError()
  }
}