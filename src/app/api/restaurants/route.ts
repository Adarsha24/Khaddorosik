import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError, validationError } from '@/lib/response'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  fssaiNumber: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  cgstRate: z.number().min(0).max(1).optional(),
  sgstRate: z.number().min(0).max(1).optional(),
  logo: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
    })
    return ok(restaurant)
  } catch (e) {
    console.error('[GET /api/restaurants]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = UpdateSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const restaurant = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: parsed.data,
    })
    return ok(restaurant)
  } catch (e) {
    console.error('[PATCH /api/restaurants]', e)
    return serverError()
  }
}
