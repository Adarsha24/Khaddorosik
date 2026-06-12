export type ScreenId =
  | 'dashboard'
  | 'billing'
  | 'tables'
  | 'kitchen'
  | 'reservation'
  | 'reports'
  | 'inventory'
  | 'employees'
  | 'crm'

export type ToastType = 'success' | 'kitchen' | 'info'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  veg: boolean
  notes?: string
}

export interface ToastOptions {
  msg: string
  type: ToastType
}

// Legacy mock-data types used by existing UI components
export interface Employee {
  init:   string
  name:   string
  role:   string
  online: boolean
  cls:    string
}

export interface Customer {
  name:   string
  phone:  string
  visits: number
  spent:  string
  last:   string
  pts:    number
  rating: string
  tag:    string
}

export interface InvItem {
  name:    string
  cat:     string
  stock:   number
  unit:    string
  reorder: number
  updated: string
  pct:     number
}

export interface Reservation {
  time:   string
  date:   string
  name:   string
  detail: string
  status: 'conf' | 'pend'
}

export interface KotOrder {
  id:      string
  tableNo: string
  items:   { name: string; qty: number; notes?: string }[]
  time:    string
  status:  'pending' | 'preparing' | 'ready'
}

export interface MenuItem {
  id:       string
  name:     string
  price:    number
  category: string
  veg:      boolean
  available: boolean
}
