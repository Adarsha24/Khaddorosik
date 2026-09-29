import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, badRequest, notFound, serverError } from '@/lib/response'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'

const UpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { id } = await params

    const parsed = UpdateStatusSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest('Invalid status')

    const existing = await prisma.payroll.findFirst({
      where: { id, employee: { restaurantId: auth.restaurantId } },
    })
    if (!existing) return notFound('Payroll record')

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        status: parsed.data.status,
        paidAt: parsed.data.status === 'PAID' ? new Date() : null,
      },
      include: { employee: { select: { id: true, name: true, role: true } } },
    })

    logAudit({
      restaurantId: auth.restaurantId,
      userId: auth.userId,
      action: 'PAYROLL_STATUS_UPDATED',
      entityType: 'Payroll',
      entityId: payroll.id,
      details: { status: payroll.status },
    })

    return ok(payroll)
  } catch (error) {
    console.error('[PATCH /api/payroll/[id]]', error)
    return serverError()
  }
}