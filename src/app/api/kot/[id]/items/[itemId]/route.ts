import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id, itemId } = await params
    const body = await req.json()
    const done = typeof body.done === 'boolean' ? body.done : true

    // Verify KOT belongs to this restaurant
    const kotItem = await prisma.kOTItem.findFirst({
      where: { id: itemId, kotId: id, kot: { order: { restaurantId: auth.restaurantId } } },
    })
    if (!kotItem) return notFound('KOT item')

    const updated = await prisma.kOTItem.update({ where: { id: itemId }, data: { done } })

    // Auto-advance KOT when all items done
    const remaining = await prisma.kOTItem.count({ where: { kotId: id, done: false } })
    if (remaining === 0) {
      await prisma.kOT.update({ where: { id }, data: { status: 'READY' } })
    }

    return ok(updated)
  } catch (e) {
    console.error('[PATCH /api/kot/[id]/items/[itemId]]', e)
    return serverError()
  }
}
