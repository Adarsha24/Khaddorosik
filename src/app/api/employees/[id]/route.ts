import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, notFound, badRequest, validationError, conflict, serverError } from '@/lib/response'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

type Ctx = { params: Promise<{ id: string }> }

const UpdateEmployeeSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['MANAGER', 'HEAD_WAITER', 'WAITER', 'CASHIER', 'KITCHEN_STAFF', 'CHEF']).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    salary: z.number().positive().optional(),
    active: z.boolean().optional(),
    password: z.string().min(6).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' })

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth
    const { id } = await params

    const employee = await prisma.employee.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      include: { user: { select: { id: true, email: true, role: true } } },
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

    const parsed = UpdateEmployeeSchema.safeParse(await req.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const existing = await prisma.employee.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      select: { id: true },
    })
    if (!existing) return notFound('Employee')

    const { name, role, phone, email, salary, active, password } = parsed.data

    if (email) {
      const emailTaken = await prisma.user.findFirst({
        where: { restaurantId: auth.restaurantId, email, employeeId: { not: id } },
      })
      if (emailTaken) return conflict('Another employee already uses this email')
    }

    const employee = await prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(salary !== undefined && { salary }),
          ...(active !== undefined && { active }),
        },
      })

      // Keep the login account in sync: a deactivated employee's user
      // account is disabled too (see auth/login checking employee.active),
      // and an optional password reset is applied here in the same transaction.
      if (password) {
        await tx.user.updateMany({
          where: { employeeId: id },
          data: { passwordHash: await hashPassword(password) },
        })
      }

      return updated
    })

    return ok(employee)
  } catch (e) {
    console.error('[PATCH /api/employees/[id]]', e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth
    const { id } = await params

    const existing = await prisma.employee.findFirst({
      where: { id, restaurantId: auth.restaurantId },
      select: { id: true },
    })
    if (!existing) return notFound('Employee')

    // Soft-delete: deactivate rather than hard-delete, so payroll history
    // and past orders that reference this employee aren't orphaned.
    const employee = await prisma.employee.update({ where: { id }, data: { active: false } })
    return ok(employee, 'Employee deactivated')
  } catch (e) {
    console.error('[DELETE /api/employees/[id]]', e)
    return serverError()
  }
}