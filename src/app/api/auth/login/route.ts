import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signAccess, signRefresh, refreshExpiresAt } from '@/lib/auth'
import { LoginSchema } from '@/lib/validators'
import { ok, badRequest, serverError, tooManyRequests } from '@/lib/response'
import { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')

    const { email, password } = parsed.data

    // Rate limit by email+IP combined — protects against both a single attacker
    // hammering one account, and a single account being brute-forced from many IPs.
    const ip = getClientIp(req)
    const rateLimitKey = `login:${email.toLowerCase()}:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000) // 5 attempts per 15 min

    if (!rateLimit.allowed) {
      return tooManyRequests(rateLimit.retryAfterSeconds)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        restaurantId: true,
        passwordHash: true,
        mustChangePassword: true,
        employee: { select: { name: true, active: true } },
        restaurant: { select: { id: true, name: true, logo: true, taxRate: true, cgstRate: true, sgstRate: true, gstNumber: true, currency: true } },
      },
    })

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return badRequest('Invalid email or password')
    }

    // A deactivated employee's account must not be able to log in, even with
    // the correct password. Users without a linked employee record (e.g. a
    // pure SUPER_ADMIN account) are unaffected.
    if (user.employee && user.employee.active === false) {
      return badRequest('This account has been deactivated. Contact your manager.')
    }

    // Successful login — clear the rate limit counter for this key
    clearRateLimit(rateLimitKey)

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
    mustChangePassword: user.mustChangePassword,
  },
})
  } catch (e) {
    console.error('[POST /api/auth/login]', e)
    return serverError()
  }
}