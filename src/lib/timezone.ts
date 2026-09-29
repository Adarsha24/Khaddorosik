// All restaurants on this platform are in India, so report date boundaries
// ("today", "this month", etc.) must be computed in IST — not the server's
// local timezone. A server running in UTC (most cloud hosts) would otherwise
// compute "today" up to 5.5 hours off from what an Indian restaurant means
// by "today", causing orders near midnight to land in the wrong day's report.
//
// These helpers use only UTC-based Date methods internally, so the result is
// correct regardless of what timezone the Node process itself is running in.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** The Date (as a UTC instant) corresponding to today's midnight in IST. */
export function istTodayStart(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS)
  const istMidnightAsUTC = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
  return new Date(istMidnightAsUTC - IST_OFFSET_MS)
}

/** The Date (as a UTC instant) corresponding to the 1st of this month, midnight IST. */
export function istMonthStart(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS)
  const istMonthStartAsUTC = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1)
  return new Date(istMonthStartAsUTC - IST_OFFSET_MS)
}

/** The Date (as a UTC instant) corresponding to the 1st of the previous month, midnight IST. */
export function istPrevMonthStart(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS)
  const istPrevMonthStartAsUTC = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() - 1, 1)
  return new Date(istPrevMonthStartAsUTC - IST_OFFSET_MS)
}