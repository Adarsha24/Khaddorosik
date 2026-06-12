import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params
    const body = await req.json()
    const available = typeof body.available === 'boolean' ? body.available : undefined

    // Verify item belongs to this restaurant's category
    const current = await prisma.menuItem.findFirst({
      where: { id, category: { restaurantId: auth.restaurantId } },
      select: { available: true },
    })
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
