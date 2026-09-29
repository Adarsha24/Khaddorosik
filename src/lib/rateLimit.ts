// Simple in-memory rate limiter. Tracks failed attempts per key (e.g. email+IP)
// within a rolling time window. Resets automatically after the window passes.
// NOTE: only correct for a single server instance — see caveat in comments above.

type Attempt = { count: number; firstAttemptAt: number }

const attempts = new Map<string, Attempt>()

// Clean up old entries periodically so this Map doesn't grow forever
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of attempts.entries()) {
    if (now - val.firstAttemptAt > 15 * 60 * 1000) attempts.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds?: number
}

/**
 * Checks and records an attempt for the given key.
 * @param key Unique identifier for what's being limited (e.g. `login:${email}:${ip}`)
 * @param maxAttempts Max attempts allowed within the window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): RateLimitResult {
  const now = Date.now()
  const existing = attempts.get(key)

  if (!existing || now - existing.firstAttemptAt > windowMs) {
    attempts.set(key, { count: 1, firstAttemptAt: now })
    return { allowed: true }
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - existing.firstAttemptAt)) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  existing.count += 1
  return { allowed: true }
}

/**
 * Call this after a SUCCESSFUL login to clear the counter for that key,
 * so a legitimate user isn't penalized by earlier failed attempts.
 */
export function clearRateLimit(key: string) {
  attempts.delete(key)
}

/**
 * Extracts a best-effort client IP from the request headers.
 * Works behind most reverse proxies/load balancers (Vercel included).
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}