import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { ok, created, validationError, conflict, serverError } from '@/lib/response'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const EmployeeSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(['MANAGER', 'HEAD_WAITER', 'WAITER', 'CASHIER', 'KITCHEN_STAFF', 'CHEF']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  userRole: z.enum(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']).default('WAITER'),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')

    const employees = await prisma.employee.findMany({
      where: {
        restaurantId: auth.restaurantId,
        ...(active !== null && active !== '' && { active: active === 'true' }),
      },
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { name: 'asc' },
    })
    return ok(employees)
  } catch (e) {
    console.error('[GET /api/employees]', e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const parsed = EmployeeSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { name, role, phone, email, password, userRole } = parsed.data

    if (email) {
      const existing = await prisma.user.findFirst({ where: { restaurantId: auth.restaurantId, email } })
      if (existing) return conflict('Employee with this email already exists')
    }

    const employee = await prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({ data: { name, role, phone, email, restaurantId: auth.restaurantId } })

      if (email && password) {
        await tx.user.create({
          data: { email, passwordHash: await hashPassword(password), role: userRole, employeeId: emp.id, restaurantId: auth.restaurantId },
        })
      }

      return emp
    })

    return created(employee)
  } catch (e) {
    console.error('[POST /api/employees]', e)
    return serverError()
  }
}
