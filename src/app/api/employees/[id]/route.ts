import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate, authenticateRoles } from '@/lib/middleware'
import { EmployeeSchema } from '@/lib/validators'
import { ok, notFound, validationError, serverError } from '@/lib/response'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticate(req)
    const { id } = await params

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true, createdAt: true } } },
    })
    if (!employee) return notFound('Employee')
    return ok(employee)
  } catch (e) {
    console.error('[GET /api/employees/[id]]', e)
    return serverError()
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const parsed = EmployeeSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const employee = await prisma.employee.update({ where: { id }, data: parsed.data })
    return ok(employee)
  } catch (e) {
    console.error('[PUT /api/employees/[id]]', e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params
    const { active } = await req.json()

    const employee = await prisma.employee.update({
      where: { id },
      data: { active: Boolean(active) },
    })
    return ok(employee)
  } catch (e) {
    console.error('[PATCH /api/employees/[id]]', e)
    return serverError()
  }
}
