import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { MenuItemSchema } from '@/lib/validators'
import { ok, created, validationError, serverError, paginated } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const veg = searchParams.get('veg')
    const available = searchParams.get('available')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 50))

    const where = {
      ...(category && { categoryId: category }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      ...(veg !== null && veg !== '' && { veg: veg === 'true' }),
      ...(available !== null && available !== '' && { available: available === 'true' }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.menuItem.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ bestSeller: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.menuItem.count({ where }),
    ])

    return paginated(items, total, page, limit)
  } catch (e) {
    console.error('[GET /api/menu/items]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = MenuItemSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const item = await prisma.menuItem.create({
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } },
    })
    return created(item)
  } catch (e) {
    console.error('[POST /api/menu/items]', e)
    return serverError()
  }
}
