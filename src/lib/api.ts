'use client'

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const data = await res.json()
    if (data.success && data.data?.accessToken) {
      localStorage.setItem('access_token', data.data.accessToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

// ─── Base fetcher ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) return apiFetch(path, options)
    clearTokens()
    window.location.reload()
    throw new Error('Session expired')
  }

  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'API error')
  return data.data as T
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error ?? 'Login failed')
    setTokens(data.data.accessToken, data.data.refreshToken)
    return data.data as { accessToken: string; refreshToken: string; user: { id: string; email: string; role: string; name: string } }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try { await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }) } catch {}
    clearTokens()
  },

  me: () => apiFetch<{ id: string; email: string; role: string; employee?: { name: string } }>('/auth/me'),

  isLoggedIn: () => !!getToken(),
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menu = {
  categories: () => apiFetch<ApiCategory[]>('/menu/categories'),
  items: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiMenuItem[]; meta: ApiMeta }>(`/menu/items${qs}`)
  },
  toggleAvailability: (id: string, available?: boolean) =>
    apiFetch(`/menu/items/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ available }) }),
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export const tables = {
  list: () => apiFetch<ApiTable[]>('/tables'),
  updateStatus: (id: string, status: string, waiterId?: string) =>
    apiFetch(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, waiterId }) }),
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiOrder[]; meta: ApiMeta }>(`/orders${qs}`)
  },
  create: (data: {
    tableId?: string
    customerId?: string
    orderType?: string
    notes?: string
    items: { menuItemId: string; quantity: number; notes?: string }[]
  }) => apiFetch<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// ─── KOT ──────────────────────────────────────────────────────────────────────

export const kot = {
  list: (statuses = 'PENDING,PREPARING,READY') =>
    apiFetch<ApiKOT[]>(`/kot?status=${statuses}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/kot/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  markItemDone: (kotId: string, itemId: string, done = true) =>
    apiFetch(`/kot/${kotId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ done }) }),
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = {
  create: (data: { orderId: string; method: string; splits?: { method: string; amount: number }[] }) =>
    apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export const reservations = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiReservation[]; meta: ApiMeta }>(`/reservations${qs}`)
  },
  create: (data: unknown) =>
    apiFetch<ApiReservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiFetch<ApiReservation>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventory = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiInventoryItem[]; meta: ApiMeta }>(`/inventory${qs}`)
  },
  adjust: (id: string, quantity: number, type: string, notes?: string) =>
    apiFetch(`/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ quantity: Math.abs(quantity), type, notes }),
    }),
}

// ─── Employees ────────────────────────────────────────────────────────────────

export const employees = {
  list: () => apiFetch<ApiEmployee[]>('/employees'),
  toggleActive: (id: string, active: boolean) =>
    apiFetch(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }),
}

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = {
  list: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiFetch<{ data: ApiCustomer[]; meta: ApiMeta }>(`/customers${qs}`)
  },
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reports = {
  sales: (period: string) => apiFetch<ApiSalesReport>(`/reports/sales?period=${period}`),
  items: (period: string) => apiFetch<ApiItemsReport>(`/reports/items?period=${period}`),
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiMeta { total: number; page: number; limit: number; totalPages: number }

export interface ApiCategory {
  id: string; name: string; displayOrder: number; active: boolean
  _count?: { menuItems: number }
}

export interface ApiMenuItem {
  id: string; name: string; price: string; veg: boolean
  available: boolean; bestSeller: boolean; imageUrl?: string
  description?: string; categoryId: string
  category?: { id: string; name: string }
}

export interface ApiTable {
  id: string; number: number; capacity: number; section?: string; status: string
  tableSessions?: { id: string; status: string; orders: ApiOrder[] }[]
}

export interface ApiOrder {
  id: string; status: string; total: string; subtotal: string
  taxAmount: string; tableId?: string; orderType: string; createdAt: string
  items?: ApiOrderItem[]
  kotId?: string
}

export interface ApiOrderItem {
  id: string; menuItemId: string; quantity: number; unitPrice: string; status: string
  menuItem?: { id: string; name: string; price: string }
}

export interface ApiKOT {
  id: string; status: string; tableId?: string; createdAt: string
  order?: { id: string; orderType: string; tableId?: string }
  kotItems: {
    id: string; done: boolean; quantity: number
    orderItem?: { id: string; menuItem?: { id: string; name: string; veg: boolean } }
  }[]
}

export interface ApiReservation {
  id: string; guestName: string; guestPhone?: string
  date: string; time: string; partySize: number; status: string; notes?: string
  table?: { id: string; number: number }
  customer?: { id: string; name: string; phone: string }
}

export interface ApiInventoryItem {
  id: string; name: string; category: string; unit: string
  currentStock: string; reorderLevel: string; isLowStock: boolean; updatedAt: string
}

export interface ApiEmployee {
  id: string; name: string; role: string; phone?: string
  email?: string; active: boolean
  user?: { id: string; email: string; role: string }
}

export interface ApiCustomer {
  id: string; name: string; phone?: string; email?: string
  loyaltyPoints: number; totalVisits: number; totalSpent: string; createdAt: string
}

export interface ApiSalesReport {
  summary: { totalOrders: number; revenue: number; tax: number; avgOrderValue: number }
  byPaymentMethod: Record<string, number>
  byOrderType: Record<string, { count: number; revenue: number }>
  hourlyDistribution: { hour: number; orders: number; revenue: number }[]
}

export interface ApiItemsReport {
  topItems: { menuItemId: string; name: string; category: string; totalQty: number; revenue: number; veg: boolean }[]
  categoryBreakdown: Record<string, { qty: number; revenue: number }>
}
