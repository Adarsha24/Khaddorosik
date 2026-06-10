export type ScreenId =
  | 'billing'
  | 'tables'
  | 'kitchen'
  | 'reservation'
  | 'reports'
  | 'inventory'
  | 'employees'
  | 'crm';

export type ToastType = 'success' | 'kitchen' | 'info';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  veg: boolean;
  emoji: string;
}

export interface MenuItem {
  id: string;
  name: string;
  cat: string;
  price: number;
  veg: boolean;
  emoji: string;
  img?: string;
  best?: boolean;
  avail: boolean;
}

export interface TableData {
  num: number;
  cap: number;
  status: 'available' | 'occupied' | 'running' | 'reserved';
  waiter?: string;
  amt?: string;
  time?: string;
  items?: number;
  name?: string;
  rtime?: string;
}

export interface KotOrder {
  table: number;
  status: 'pending' | 'ready';
  time: string;
  color: string;
  items: { n: string; q: number; done: boolean }[];
}

export interface Employee {
  init: string;
  name: string;
  role: string;
  online: boolean;
  cls: string;
}

export interface Customer {
  name: string;
  phone: string;
  visits: number;
  spent: string;
  last: string;
  pts: number;
  rating: string;
  tag: string;
}

export interface InvItem {
  name: string;
  cat: string;
  stock: number;
  unit: string;
  reorder: number;
  updated: string;
  pct: number;
}

export interface Reservation {
  time: string;
  date: string;
  name: string;
  detail: string;
  status: 'conf' | 'pend' | 'canc';
}
