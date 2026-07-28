import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const Schema = z.object({
  quantity: z.number().positive(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'WASTE']),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return badRequest('Invalid adjustment data')

    const { quantity, type, notes } = parsed.data

    const item = await prisma.inventoryItem.findFirst({ where: { id, restaurantId: auth.restaurantId } })
    if (!item) return notFound('Inventory item')

    const delta = type === 'IN' ? quantity : -Math.abs(quantity)
    const newStock = Number(item.currentStock) + delta

    if (newStock < 0) return badRequest('Adjustment would result in negative stock')

    const [updated] = await prisma.$transaction([
      prisma.inventoryItem.update({ where: { id }, data: { currentStock: newStock } }),
      prisma.inventoryTransaction.create({
        data: { itemId: id, quantity, type, notes, createdBy: auth.userId },
      }),
    ])

    return ok({ ...updated, isLowStock: Number(updated.currentStock) <= Number(updated.reorderLevel) })
  } catch (e) {
    console.error('[POST /api/inventory/[id]/adjust]', e)
    return serverError()
  }
}
