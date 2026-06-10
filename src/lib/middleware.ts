import { NextRequest } from 'next/server'
import { extractBearer, verifyAccess, JwtPayload } from './auth'
import { unauthorized, forbidden } from './response'

// Returns JwtPayload on success, or a Response on failure.
// Usage: const auth = await authenticate(req); if (auth instanceof Response) return auth;
export async function authenticate(req: NextRequest): Promise<JwtPayload | Response> {
  const token = extractBearer(req.headers.get('authorization'))
  if (!token) return unauthorized()
  try {
    return verifyAccess(token)
  } catch {
    return unauthorized('Invalid or expired token')
  }
}

export async function authenticateRoles(
  req: NextRequest,
  ...roles: string[]
): Promise<JwtPayload | Response> {
  const result = await authenticate(req)
  if (result instanceof Response) return result
  if (!roles.includes(result.role)) return forbidden()
  return result
}
