import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signAccess, signRefresh, refreshExpiresAt } from '@/lib/auth'
import { LoginSchema } from '@/lib/validators'
import { ok, badRequest, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: { select: { name: true } } },
    })

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return badRequest('Invalid email or password')
    }

    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = signAccess(payload)
    const refreshToken = signRefresh(payload)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt() },
    })

    return ok({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.employee?.name ?? email,
      },
    })
  } catch (e) {
    console.error('[POST /api/auth/login]', e)
    return serverError()
  }
}
