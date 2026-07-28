import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, serverError } from '@/lib/response'
import { z } from 'zod'

const Schema = z.object({ refreshToken: z.string().optional() })

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const body = await req.json().catch(() => ({}))
    const { refreshToken } = Schema.parse(body)

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId: auth.userId },
      })
    } else {
      // Revoke all tokens for this user
      await prisma.refreshToken.deleteMany({ where: { userId: auth.userId } })
    }

    return ok(null, 'Logged out successfully')
  } catch (e) {
    console.error('[POST /api/auth/logout]', e)
    return serverError()
  }
}
