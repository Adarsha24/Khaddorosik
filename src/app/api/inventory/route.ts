import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { InventoryItemSchema } from '@/lib/validators'
import { ok, created, validationError, serverError, paginated } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const lowStock = searchParams.get('lowStock') === 'true'
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const baseWhere = {
      ...(category && { category }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    }

    // Prisma can't compare two columns natively; fetch all matching and filter in JS for low-stock
    const all = await prisma.inventoryItem.findMany({
      where: baseWhere,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    const enriched = all.map((item) => ({
      ...item,
      isLowStock: Number(item.currentStock) <= Number(item.reorderLevel),
    }))

    const filtered = lowStock ? enriched.filter((i) => i.isLowStock) : enriched
    const total = filtered.length
    const page_items = filtered.slice((page - 1) * limit, page * limit)

    return paginated(page_items, total, page, limit)
  } catch (e) {
    console.error('[GET /api/inventory]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = InventoryItemSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const item = await prisma.inventoryItem.create({ data: parsed.data })
    return created(item)
  } catch (e) {
    console.error('[POST /api/inventory]', e)
    return serverError()
  }
}
