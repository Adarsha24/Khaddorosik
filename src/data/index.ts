// Central re-export for all data
export * from './menuData';
export * from './tablesData';
export * from './kitchenData';

import type { Employee, Customer, InvItem, Reservation } from '@/types';

export const EMPLOYEES: Employee[] = [
  { init: 'AK', name: 'Anjali Khanna', role: 'Head Waiter', online: true,  cls: 'ea-a' },
  { init: 'RS', name: 'Rohan Sharma',  role: 'Waiter',      online: true,  cls: 'ea-b' },
  { init: 'PD', name: 'Priya Dubey',   role: 'Waiter',      online: false, cls: 'ea-c' },
  { init: 'MR', name: 'Mohan Rathod',  role: 'Cashier',     online: true,  cls: 'ea-d' },
  { init: 'SK', name: 'Suresh Kumar',  role: 'Manager',     online: true,  cls: 'ea-e' },
];

export const CUSTOMERS: Customer[] = [
  { name: 'Rahul Khanna',   phone: '+91 98765 43210', visits: 24, spent: '₹38,400', last: 'Today',        pts: 1240, rating: '4.8', tag: 'loyal'    },
  { name: 'Sneha Mehta',    phone: '+91 90001 12345', visits: 8,  spent: '₹11,200', last: '2 days ago',   pts: 560,  rating: '5.0', tag: 'vip'      },
  { name: 'Arjun Nair',     phone: '+91 87654 32109', visits: 2,  spent: '₹2,800',  last: '1 week ago',   pts: 140,  rating: '4.0', tag: 'new'      },
  { name: 'Kavya Reddy',    phone: '+91 76543 21098', visits: 18, spent: '₹26,600', last: 'Yesterday',    pts: 1330, rating: '4.7', tag: 'loyal'    },
  { name: 'Amit Patel',     phone: '+91 65432 10987', visits: 1,  spent: '₹980',    last: '2 weeks ago',  pts: 49,   rating: '3.5', tag: 'new'      },
  { name: 'Deepika Singh',  phone: '+91 55432 10876', visits: 35, spent: '₹58,200', last: 'Today',        pts: 2910, rating: '5.0', tag: 'vip'      },
  { name: 'Vikram Joshi',   phone: '+91 44321 09876', visits: 0,  spent: '₹0',      last: 'Never',        pts: 0,    rating: '—',   tag: 'inactive' },
];

export const INV_ITEMS: InvItem[] = [
  { name: 'Chicken Breast', cat: 'Meat',       stock: 12.5, unit: 'kg', reorder: 5,  updated: '2h ago', pct: 62 },
  { name: 'Paneer',         cat: 'Dairy',      stock: 3.2,  unit: 'kg', reorder: 4,  updated: '4h ago', pct: 22 },
  { name: 'Basmati Rice',   cat: 'Grains',     stock: 28,   unit: 'kg', reorder: 10, updated: '1d ago', pct: 70 },
  { name: 'Tomatoes',       cat: 'Vegetables', stock: 1.5,  unit: 'kg', reorder: 3,  updated: '3h ago', pct: 15 },
  { name: 'Onions',         cat: 'Vegetables', stock: 18,   unit: 'kg', reorder: 5,  updated: '1d ago', pct: 72 },
  { name: 'Butter',         cat: 'Dairy',      stock: 0.8,  unit: 'kg', reorder: 2,  updated: '5h ago', pct: 8  },
  { name: 'Cream',          cat: 'Dairy',      stock: 4.2,  unit: 'L',  reorder: 2,  updated: '3h ago', pct: 84 },
  { name: 'Mutton',         cat: 'Meat',       stock: 6,    unit: 'kg', reorder: 4,  updated: '6h ago', pct: 50 },
];

export const RESERVATIONS: Reservation[] = [
  { time: '7:00 PM', date: 'Today',    name: 'Sharma Family',   detail: '4 guests • Table 6',         status: 'conf' },
  { time: '7:30 PM', date: 'Today',    name: 'Mehta Birthday',  detail: '8 guests • Table 9 & 15',    status: 'conf' },
  { time: '8:00 PM', date: 'Today',    name: 'Rajesh Nair',     detail: '2 guests • Table 1',         status: 'pend' },
  { time: '8:30 PM', date: 'Today',    name: 'Corporate Dinner',detail: '12 guests • Private Room',   status: 'conf' },
  { time: '9:00 PM', date: 'Today',    name: 'Priya & Ankit',   detail: '2 guests • Table 4',         status: 'pend' },
  { time: '7:00 PM', date: 'Tomorrow', name: 'Gupta Anniversary',detail: '2 guests • Table 3',        status: 'conf' },
  { time: '8:00 PM', date: 'Tomorrow', name: 'Office Party',    detail: '20 guests • Full Hall',      status: 'pend' },
  { time: '7:30 PM', date: '28 May',   name: 'Verma Family',    detail: '6 guests • Table 6',         status: 'conf' },
];

export const HOURLY_DATA = [0,0,0,200,800,2400,3200,4100,2800,1900,3800,4200,3600,2200,800,1200,2800,4600,5200,4800,3200,1600,800,200];
export const HOURLY_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
export const TOP_ITEMS = [
  { name: 'Butter Chicken',  qty: 42, rev: '₹13,440', pct: 100 },
  { name: 'Chicken Biryani', qty: 38, rev: '₹11,020', pct: 90  },
  { name: 'Dal Makhani',     qty: 35, rev: '₹7,000',  pct: 83  },
  { name: 'Paneer Tikka',    qty: 29, rev: '₹6,380',  pct: 69  },
  { name: 'Garlic Naan',     qty: 84, rev: '₹5,040',  pct: 67  },
];
