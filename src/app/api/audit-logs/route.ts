import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateRoles } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'

interface AuthResult {
  restaurantId?: string | null
  [key: string]: any
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const auth: AuthResult | Response = await authenticateRoles(req, 'SUPER_ADMIN', 'MANAGER')
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(req.url)
    const limit = Math.min(200, Number(searchParams.get('limit') ?? 50))
    const entityType = searchParams.get('entityType')

    interface AuditLog {
      id: string
      userId?: string | null
      restaurantId?: string | null
      entityType?: string | null
      createdAt: Date | string
      [key: string]: any
    }

    const logs: AuditLog[] = await (prisma as any).auditLog.findMany({
      where: {
        restaurantId: (auth as AuthResult).restaurantId,
        ...(entityType && { entityType }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Hydrate user names separately since AuditLog.userId has no FK relation
    // (deliberately, so logs survive user deletion)
    const userIds: string[] = Array.from(
      new Set(
        logs
          .map((l: AuditLog) => l.userId)
          .filter((id): id is string => typeof id === 'string' && id !== '')
      )
    )
    interface UserRecord {
      id: string
      email: string
      employee?: { name?: string | null } | null
    }

    const users: UserRecord[] = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, employee: { select: { name: true } } },
        })
      : []
    // users may not have proper typings for the employee relation here, coerce to any
    const userMap = new Map<string, string>(users.map((u) => [u.id, u.employee?.name ?? u.email]))

    interface HydratedLog extends AuditLog {
      userName: string
    }

    const hydrated: HydratedLog[] = logs.map((l: AuditLog) => ({
      ...l,
      userName: l.userId ? (userMap.get(l.userId) ?? 'Unknown user') : 'System',
    }))

    return ok(hydrated)
  } catch (e) {
    console.error('[GET /api/audit-logs]', e)
    return serverError()
  }
}