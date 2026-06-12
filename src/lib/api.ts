'use client'

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
  localStorage.setItem('__rt', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('__rt')
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const data = await res.json()
    if (data.success && data.data?.accessToken) {
      localStorage.setItem('access_token', data.data.accessToken)
      if (data.data.refreshToken) localStorage.setItem('refresh_token', data.data.refreshToken)
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
  if (!data.success) throw new Error(data.message ?? data.error ?? 'API error')
  return data.data as T
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  me: () => apiFetch<ApiMe>('/auth/me'),
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try { await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }) } catch {}
    clearTokens()
  },
  isLoggedIn: () => !!getToken(),
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menu = {
  categories: () => apiFetch<ApiCategory[]>('/menu/categories'),
  items: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiMenuItem[]; meta: ApiMeta }>(`/menu/items${qs}`)
  },
  createItem: (data: Partial<ApiMenuItem> & { price: number; categoryId: string }) =>
    apiFetch<ApiMenuItem>('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  toggleAvailability: (id: string, available?: boolean) =>
    apiFetch(`/menu/items/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ available }) }),
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export const tables = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<ApiTable[]>(`/tables${qs}`)
  },
  create: (data: { number: number; capacity: number; section?: string }) =>
    apiFetch<ApiTable>('/tables', { method: 'POST', body: JSON.stringify(data) }),
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
    tableId?: string; customerId?: string; orderType?: string
    notes?: string; discountCode?: string
    items: { menuItemId: string; quantity: number; notes?: string }[]
  }) => apiFetch<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => apiFetch<ApiOrder>(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addItems: (id: string, items: { menuItemId: string; quantity: number; notes?: string }[]) =>
    apiFetch(`/orders/${id}/items`, { method: 'POST', body: JSON.stringify({ items }) }),
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
  list: (orderId?: string) => {
    const qs = orderId ? `?orderId=${orderId}` : ''
    return apiFetch<ApiPayment[]>(`/payments${qs}`)
  },
  create: (data: { orderId: string; method: string; reference?: string; splits?: { method: string; amount: number }[] }) =>
    apiFetch<ApiPayment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
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
  create: (data: unknown) =>
    apiFetch<ApiInventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  adjust: (id: string, quantity: number, type: string, notes?: string) =>
    apiFetch(`/inventory/${id}/adjust`, {
      method: 'POST', body: JSON.stringify({ quantity: Math.abs(quantity), type, notes }),
    }),
}

// ─── Employees ────────────────────────────────────────────────────────────────

export const employees = {
  list: (active?: boolean) => {
    const qs = active !== undefined ? `?active=${active}` : ''
    return apiFetch<ApiEmployee[]>(`/employees${qs}`)
  },
  create: (data: unknown) =>
    apiFetch<ApiEmployee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  toggleActive: (id: string, active: boolean) =>
    apiFetch(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }),
}

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params) : ''
    return apiFetch<{ data: ApiCustomer[]; meta: ApiMeta }>(`/customers${qs}`)
  },
  create: (data: unknown) =>
    apiFetch<ApiCustomer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reports = {
  dashboard: () => apiFetch<ApiDashboard>('/reports/dashboard'),
  sales: (period: string, params?: Record<string, string>) => {
    const qs = new URLSearchParams({ period, ...params })
    return apiFetch<ApiSalesReport>(`/reports/sales?${qs}`)
  },
  items: (period: string) => apiFetch<ApiItemsReport>(`/reports/items?period=${period}`),
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export const discounts = {
  list: () => apiFetch<ApiDiscount[]>('/discounts'),
  create: (data: unknown) => apiFetch<ApiDiscount>('/discounts', { method: 'POST', body: JSON.stringify(data) }),
  apply: (code: string, subtotal: number) =>
    apiFetch<ApiDiscountResult>('/discounts', {
      method: 'POST', body: JSON.stringify({ action: 'apply', code, subtotal }),
    }),
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export const shifts = {
  current: () => apiFetch<ApiShift[]>('/shifts?status=OPEN'),
  open: (openingCash: number, notes?: string) =>
    apiFetch<ApiShift>('/shifts', { method: 'POST', body: JSON.stringify({ action: 'open', openingCash, notes }) }),
  close: (closingCash: number, notes?: string) =>
    apiFetch<ApiShift>('/shifts', { method: 'POST', body: JSON.stringify({ action: 'close', closingCash, notes }) }),
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const suppliers = {
  list: () => apiFetch<ApiSupplier[]>('/suppliers'),
  create: (data: unknown) => apiFetch<ApiSupplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const restaurant = {
  get: () => apiFetch<ApiRestaurant>('/restaurants'),
  update: (data: unknown) => apiFetch<ApiRestaurant>('/restaurants', { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiMeta { total: number; page: number; limit: number; totalPages: number }

export interface ApiRestaurant {
  id: string; name: string; email: string; phone?: string; address?: string; city?: string
  logo?: string; gstNumber?: string; fssaiNumber?: string
  taxRate: number; cgstRate: number; sgstRate: number; currency: string
}

export interface ApiMe {
  id: string; email: string; role: string; restaurantId: string; name: string
  employee?: { name: string; role: string; phone?: string }
  restaurant: ApiRestaurant
}

export interface ApiCategory {
  id: string; name: string; displayOrder: number; active: boolean
  _count?: { menuItems: number }
}

export interface ApiMenuItem {
  id: string; name: string; price: string; costPrice?: string; veg: boolean
  available: boolean; bestSeller: boolean; imageUrl?: string
  description?: string; categoryId: string
  category?: { id: string; name: string }
}

export interface ApiTable {
  id: string; number: number; capacity: number; section?: string; status: string
  tableSessions?: { id: string; status: string; openedAt: string; orders: ApiOrder[] }[]
}

export interface ApiOrder {
  id: string; billNo?: number; status: string; total: string; subtotal: string
  taxAmount: string; cgstAmount?: string; sgstAmount?: string
  discountAmount?: string; discountCode?: string
  tableId?: string; orderType: string; createdAt: string; notes?: string
  items?: ApiOrderItem[]
  payments?: ApiPayment[]
  customer?: { id: string; name: string; phone?: string }
}

export interface ApiOrderItem {
  id: string; menuItemId: string; quantity: number; unitPrice: string; status: string; notes?: string
  menuItem?: { id: string; name: string; price: string; veg: boolean }
}

export interface ApiPayment {
  id: string; orderId: string; amount: string; method: string; status: string; reference?: string
  splits?: { id: string; method: string; amount: string }[]
}

export interface ApiKOT {
  id: string; status: string; tableId?: string; createdAt: string
  order?: { id: string; orderType: string; tableId?: string; billNo?: number }
  kotItems: {
    id: string; done: boolean; quantity: number
    orderItem?: { id: string; notes?: string; menuItem?: { id: string; name: string; veg: boolean } }
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
  supplier?: { id: string; name: string }
}

export interface ApiEmployee {
  id: string; name: string; role: string; phone?: string; email?: string; active: boolean
  user?: { id: string; email: string; role: string }
}

export interface ApiCustomer {
  id: string; name: string; phone?: string; email?: string
  loyaltyPoints: number; totalVisits: number; totalSpent: string; createdAt: string
}

export interface ApiDiscount {
  id: string; code: string; description?: string; type: string; value: string
  minOrder: string; maxUses?: number; usedCount: number; active: boolean; expiresAt?: string
}

export interface ApiDiscountResult {
  code: string; type: string; value: number; discountAmount: number; description?: string
}

export interface ApiShift {
  id: string; status: string; openingCash: string; closingCash?: string
  openedAt: string; closedAt?: string; notes?: string
}

export interface ApiSupplier {
  id: string; name: string; contactName?: string; email?: string; phone?: string; address?: string; active: boolean
  _count?: { inventory: number }
}

export interface ApiDashboard {
  today: { orders: number; revenue: number; paid: number }
  week: { revenue: number; orders: number }
  month: { revenue: number; orders: number; growth: number }
  live: { pendingOrders: number; activeKOTs: number; occupiedTables: number; totalTables: number; lowStockItems: number }
  topItems: { id?: string; name?: string; price?: string; veg?: boolean; qty: number; revenue: number }[]
  hourly: { hour: number; orders: number; revenue: number }[]
  paymentMethods: { method: string; amount: number; count: number }[]
  orderTypes: { type: string; revenue: number; count: number }[]
}

export interface ApiSalesReport {
  period: string; from: string; to: string
  summary: { totalOrders: number; subtotal: number; taxAmount: number; cgstAmount: number; sgstAmount: number; discountAmount: number; totalRevenue: number; avgOrderValue: number }
  byMethod: { method: string; amount: number; count: number }[]
  byType: { type: string; revenue: number; count: number }[]
  hourly: { hour: number; orders: number; revenue: number }[]
  orders: { id: string; billNo?: number; total: string; orderType: string; createdAt: string }[]
}

export interface ApiItemsReport {
  topItems: { menuItemId: string; name: string; category: string; totalQty: number; revenue: number; veg: boolean }[]
  categoryBreakdown: Record<string, { qty: number; revenue: number }>
}
