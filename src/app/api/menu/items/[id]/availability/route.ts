import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER', 'CASHIER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const body = await req.json()
    const available = typeof body.available === 'boolean' ? body.available : undefined

    const current = await prisma.menuItem.findUnique({ where: { id }, select: { available: true } })
    if (!current) return notFound('Menu item')

    const item = await prisma.menuItem.update({
      where: { id },
      data: { available: available ?? !current.available },
      select: { id: true, name: true, available: true },
    })
    return ok(item)
  } catch (e) {
    console.error('[PATCH /api/menu/items/[id]/availability]', e)
    return serverError()
  }
}
