import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticate } from '@/lib/middleware'
import { comparePassword, hashPassword } from '@/lib/auth'
import { ok, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req)
    if (auth instanceof Response) return auth

    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) return badRequest('User not found')

    const isCorrect = await comparePassword(currentPassword, user.passwordHash)
    if (!isCorrect) return badRequest('Current password is incorrect')

    if (currentPassword === newPassword) {
      return badRequest('New password must be different from the current password')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(newPassword),
        mustChangePassword: false,
      },
    })

    return ok({ message: 'Password updated successfully' })
  } catch (e) {
    console.error('[POST /api/auth/change-password]', e)
    return serverError()
  }
}