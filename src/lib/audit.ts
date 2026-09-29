import { prisma } from '@/lib/db'

interface AuditLogInput {
  restaurantId: string
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, unknown>
}

/**
 * Records an audit log entry. Deliberately fire-and-forget with error
 * swallowing — a logging failure should never block or fail the actual
 * business operation it's recording.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await (prisma as any).auditLog?.create({
      data: {
        restaurantId: input.restaurantId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        details: input.details ?? undefined,
      },
    })
  } catch (e) {
    console.error('[audit log failed]', e)
  }
}