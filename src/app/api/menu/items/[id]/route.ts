import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { MenuItemSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params
    const item = await prisma.menuItem.findUnique({
      where: { id },
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

    const item = await prisma.menuItem.update({
      where: { id },
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
    await prisma.menuItem.update({ where: { id }, data: { available: false } })
    return ok(null, 'Item deactivated')
  } catch (e) {
    console.error('[DELETE /api/menu/items/[id]]', e)
    return serverError()
  }
}
