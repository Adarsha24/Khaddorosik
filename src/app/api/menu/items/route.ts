import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, serverError, paginated } from '@/lib/response'
import { z } from 'zod'

const MenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  costPrice: z.number().min(0).default(0),
  veg: z.boolean().default(false),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().default(true),
  bestSeller: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const veg = searchParams.get('veg')
    const available = searchParams.get('available')
    const bestSeller = searchParams.get('bestSeller')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(200, Number(searchParams.get('limit') ?? 100))

    const where = {
      category: { restaurantId: auth.restaurantId },
      ...(category && { categoryId: category }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      ...(veg !== null && veg !== '' && { veg: veg === 'true' }),
      ...(available !== null && available !== '' && { available: available === 'true' }),
      ...(bestSeller === 'true' && { bestSeller: true }),
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

    // Verify category belongs to this restaurant
    const cat = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, restaurantId: auth.restaurantId },
    })
    if (!cat) return validationError({ fieldErrors: { categoryId: ['Category not found'] }, formErrors: [] })

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
