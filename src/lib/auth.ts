import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function requiredSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(`${name} must be configured with at least 32 characters`)
  }
  return value
}

const ACCESS_SECRET = requiredSecret('JWT_ACCESS_SECRET')
const REFRESH_SECRET = requiredSecret('JWT_REFRESH_SECRET')

export interface JwtPayload {
  userId: string
  role: string
  email: string
  restaurantId: string
  iat?: number
  exp?: number
}

export const signAccess = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })

export const signRefresh = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })

export const verifyAccess = (token: string): JwtPayload =>
  jwt.verify(token, ACCESS_SECRET) as JwtPayload

export const verifyRefresh = (token: string): JwtPayload =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, 12)

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash)

export const extractBearer = (header: string | null): string | null => {
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7)
}

export const refreshExpiresAt = (): Date => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d
}

export const generateOtp = async (): Promise<string> => {
  const { randomInt } = await import('node:crypto')
  return randomInt(100000, 1_000_000).toString()
}

export const otpExpiresAt = (): Date => {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10)
  return d
}
