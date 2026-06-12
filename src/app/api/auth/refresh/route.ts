import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyRefresh, signAccess, signRefresh, refreshExpiresAt } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/response'
import { z } from 'zod'

const Schema = z.object({ refreshToken: z.string() })

export async function POST(req: NextRequest) {
  try {
    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return unauthorized()

    const { refreshToken } = parsed.data
    let payload
    try {
      payload = verifyRefresh(refreshToken)
    } catch {
      return unauthorized('Invalid refresh token')
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) return unauthorized('Refresh token expired')

    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const newPayload = { userId: payload.userId, role: payload.role, email: payload.email, restaurantId: payload.restaurantId }
    const newAccess = signAccess(newPayload)
    const newRefresh = signRefresh(newPayload)

    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: payload.userId, expiresAt: refreshExpiresAt() },
    })

    return ok({ accessToken: newAccess, refreshToken: newRefresh })
  } catch (e) {
    console.error('[POST /api/auth/refresh]', e)
    return serverError()
  }
}
