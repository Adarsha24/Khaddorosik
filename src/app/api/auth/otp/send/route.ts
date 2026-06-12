import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOtp, otpExpiresAt } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'
import { ok, badRequest, serverError } from '@/lib/response'
import { z } from 'zod'

const Schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const parsed = Schema.safeParse(await req.json())
    if (!parsed.success) return badRequest('Valid email required')

    const { email } = parsed.data

    const user = await prisma.user.findFirst({
      where: { email },
      include: { restaurant: { select: { name: true } } },
    })
    if (!user) return badRequest('No account found with this email')

    // Rate limit: max 3 OTPs per 10 minutes
    const recentCount = await prisma.otpCode.count({
      where: { email, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    })
    if (recentCount >= 3) return badRequest('Too many OTP requests. Please wait 10 minutes.')

    const code = generateOtp()
    await prisma.otpCode.create({
      data: { email, code, expiresAt: otpExpiresAt() },
    })

    await sendOtpEmail(email, code, user.restaurant.name)

    return ok({ message: 'OTP sent to your email', email })
  } catch (e) {
    console.error('[POST /api/auth/otp/send]', e)
    return serverError('Failed to send OTP. Check SMTP configuration.')
  }
}
