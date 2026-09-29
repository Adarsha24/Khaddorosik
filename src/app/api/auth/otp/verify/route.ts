import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signAccess, signRefresh, refreshExpiresAt } from '@/lib/auth'
import { ok, badRequest, serverError, tooManyRequests } from '@/lib/response'
import { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/rateLimit'
import { z } from 'zod'

const Schema = z.object({ email: z.string().email(), code: z.string().length(6) })

export async function POST(req: NextRequest) {
  try {
    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return badRequest('Email and 6-digit OTP required')

    const { email, code } = parsed.data

    // OTP codes are only 6 digits — far easier to brute-force than a password,
    // so this needs a tighter limit than login: 5 attempts per 10 minutes.
    const ip = getClientIp(req)
    const rateLimitKey = `otp-verify:${email.toLowerCase()}:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000)

    if (!rateLimit.allowed) {
      return tooManyRequests(rateLimit.retryAfterSeconds)
    }

    const otp = await prisma.otpCode.findFirst({
      where: { email, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!otp || !(await comparePassword(code, otp.code))) return badRequest('Invalid or expired OTP')

    // Correct code entered — clear the rate limit and consume the OTP
    clearRateLimit(rateLimitKey)
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: { select: { name: true } },
        restaurant: { select: { id: true, name: true, logo: true, taxRate: true, cgstRate: true, sgstRate: true, gstNumber: true, currency: true } },
      },
    })
    if (!user) return badRequest('User not found')

    const payload = { userId: user.id, role: user.role, email: user.email, restaurantId: user.restaurantId }
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
        restaurantId: user.restaurantId,
        name: user.employee?.name ?? email,
        restaurant: user.restaurant,
      },
    })
  } catch (e) {
    console.error('[POST /api/auth/otp/verify]', e)
    return serverError()
  }
}