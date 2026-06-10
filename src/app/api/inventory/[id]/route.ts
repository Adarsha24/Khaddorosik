import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { InventoryItemSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!item) return notFound('Inventory item')
    return ok(item)
  } catch (e) {
    console.error('[GET /api/inventory/[id]]', e)
    return serverError()
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = InventoryItemSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const item = await prisma.inventoryItem.update({ where: { id }, data: parsed.data })
    return ok(item)
  } catch (e) {
    console.error('[PUT /api/inventory/[id]]', e)
    return serverError()
  }
}
