import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyRefresh, signAccess } from '@/lib/auth'
import { RefreshSchema } from '@/lib/validators'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RefreshSchema.safeParse(body)
    if (!parsed.success) return badRequest('refreshToken is required')

    const { refreshToken } = parsed.data

    let payload
    try {
      payload = verifyRefresh(refreshToken)
    } catch {
      return unauthorized('Invalid or expired refresh token')
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return unauthorized('Refresh token revoked or expired')
    }

    const accessToken = signAccess({ userId: payload.userId, role: payload.role, email: payload.email })

    return ok({ accessToken })
  } catch (e) {
    console.error('[POST /api/auth/refresh]', e)
    return serverError()
  }
}
