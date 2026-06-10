import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JwtPayload {
  userId: string
  role: string
  email: string
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
