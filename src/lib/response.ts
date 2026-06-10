import { NextResponse } from 'next/server'

export const ok = <T>(data: T, message?: string, status = 200) =>
  NextResponse.json({ success: true, data, ...(message && { message }) }, { status })

export const created = <T>(data: T, message = 'Created successfully') =>
  NextResponse.json({ success: true, data, message }, { status: 201 })

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) =>
  NextResponse.json({
    success: true,
    data: {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  })

export const err = (message: string, status: number, code?: string) =>
  NextResponse.json({ success: false, error: message, ...(code && { code }) }, { status })

export const unauthorized = (message = 'Unauthorized') =>
  err(message, 401, 'UNAUTHORIZED')

export const forbidden = (message = 'Forbidden') =>
  err(message, 403, 'FORBIDDEN')

export const notFound = (resource = 'Resource') =>
  err(`${resource} not found`, 404, 'NOT_FOUND')

export const badRequest = (message: string) =>
  err(message, 400, 'BAD_REQUEST')

export const serverError = (message = 'Internal server error') =>
  err(message, 500, 'INTERNAL_ERROR')

export const validationError = (errors: unknown) =>
  NextResponse.json({ success: false, error: 'Validation failed', errors }, { status: 422 })

export const conflict = (message: string) =>
  err(message, 409, 'CONFLICT')
