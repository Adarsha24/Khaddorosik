import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { ok, notFound, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employee: { select: { id: true, name: true, role: true, phone: true } },
      },
    })

    if (!user) return notFound('User')

    return ok(user)
  } catch (e) {
    console.error('[GET /api/auth/me]', e)
    return serverError()
  }
}
