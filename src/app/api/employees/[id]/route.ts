import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['MANAGER','HEAD_WAITER','WAITER','CASHIER','KITCHEN_STAFF','CHEF']).optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const employee = await prisma.employee.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: { user: { select: { id: true, email: true, role: true, createdAt: true } } },
    })
    if (!employee) return notFound('Employee')
    return ok(employee)
  } catch (e) {
    console.error('[GET /api/employees/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth
    const { id } = await params

    const parsed = UpdateSchema.safeParse(await req.json())
    if (!parsed.success) return notFound('Invalid data')

    const exists = await prisma.employee.findFirst({ where: { id, restaurantId: auth.restaurantId }, select: { id: true } })
    if (!exists) return notFound('Employee')

    const employee = await prisma.employee.update({ where: { id }, data: parsed.data })
    return ok(employee)
  } catch (e) {
    console.error('[PATCH /api/employees/[id]]', e)
    return serverError()
  }
}
