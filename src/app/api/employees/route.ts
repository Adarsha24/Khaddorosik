import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { EmployeeUserSchema } from '@/lib/validators'
import { ok, created, validationError, conflict, serverError } from '@/lib/response'
import { hashPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await authenticate(req)

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')

    const employees = await prisma.employee.findMany({
      where: { ...(active !== null && active !== '' && { active: active === 'true' }) },
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

    const parsed = EmployeeUserSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const { name, role, phone, email, password, userRole } = parsed.data

    if (email) {
      const existing = await prisma.employee.findUnique({ where: { email } })
      if (existing) return conflict('Employee with this email already exists')
    }

    const employee = await prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({ data: { name, role, phone, email } })

      // Optionally create a login account
      if (email && password) {
        await tx.user.create({
          data: {
            email,
            passwordHash: await hashPassword(password),
            role: userRole ?? 'WAITER',
            employeeId: emp.id,
          },
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
