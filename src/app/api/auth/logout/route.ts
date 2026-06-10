import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { RefreshSchema } from '@/lib/validators'
import { ok, badRequest, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const body = await req.json()
    const parsed = RefreshSchema.safeParse(body)
    if (!parsed.success) return badRequest('refreshToken is required')

    await prisma.refreshToken.deleteMany({
      where: { token: parsed.data.refreshToken, userId: auth.userId },
    })

    return ok(null, 'Logged out successfully')
  } catch (e) {
    console.error('[POST /api/auth/logout]', e)
    return serverError()
  }
}
