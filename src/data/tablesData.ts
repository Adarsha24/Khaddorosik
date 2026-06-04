export type TableStatus = 'available' | 'occupied' | 'running' | 'reserved';

export type TableData = {
  num: number;
  cap: number;
  status: TableStatus;
  waiter?: string;
  amt?: string;
  time?: string;
  items?: number;
  name?: string;
  rtime?: string;
};

export type TableOrderItem = {
  name: string;
  qty: number;
  price: string;
};

// Per-table order detail data (for the detail sidebar)
export const TABLE_ORDER_DETAILS: Record<number, TableOrderItem[]> = {
  2:  [{ name: 'Mutton Rogan Josh', qty: 1, price: '₹380' }, { name: 'Butter Roti', qty: 3, price: '₹105' }],
  3:  [{ name: 'Paneer Tikka', qty: 2, price: '₹440' }, { name: 'Veg Spring Roll', qty: 1, price: '₹160' }, { name: 'Dal Makhani', qty: 2, price: '₹400' }, { name: 'Garlic Naan', qty: 4, price: '₹240' }],
  5:  [{ name: 'Butter Chicken', qty: 2, price: '₹640' }, { name: 'Garlic Naan', qty: 4, price: '₹240' }, { name: 'Dal Makhani', qty: 1, price: '₹200' }, { name: 'Lassi', qty: 2, price: '₹160' }],
  7:  [{ name: 'Chicken Biryani', qty: 1, price: '₹290' }, { name: 'Crispy Corn', qty: 2, price: '₹360' }, { name: 'Masala Chai', qty: 3, price: '₹120' }],
  9:  [{ name: 'Mutton Biryani', qty: 2, price: '₹720' }, { name: 'Gulab Jamun', qty: 3, price: '₹270' }, { name: 'Lassi', qty: 2, price: '₹160' }],
  11: [{ name: 'Masala Chai', qty: 2, price: '₹80' }, { name: 'Veg Spring Roll', qty: 2, price: '₹320' }],
  15: [{ name: 'Fish Amritsari', qty: 2, price: '₹680' }, { name: 'Manchow Soup', qty: 4, price: '₹520' }, { name: 'Laccha Paratha', qty: 6, price: '₹420' }, { name: 'Gulab Jamun', qty: 4, price: '₹360' }],
};

export const TABLES: TableData[] = [
  { num: 1,  cap: 2, status: 'available' },
  { num: 2,  cap: 4, status: 'occupied', waiter: 'Anjali', amt: '₹860',   time: '01:12' },
  { num: 3,  cap: 6, status: 'running',  waiter: 'Rohan',  amt: '₹2,340', time: '00:38', items: 4 },
  { num: 4,  cap: 2, status: 'available' },
  { num: 5,  cap: 4, status: 'running',  waiter: 'Priya',  amt: '₹1,240', time: '00:42', items: 6 },
  { num: 6,  cap: 8, status: 'reserved', name: 'Sharma Party',  rtime: '8:00 PM' },
  { num: 7,  cap: 4, status: 'running',  waiter: 'Anjali', amt: '₹980',   time: '00:18', items: 3 },
  { num: 8,  cap: 2, status: 'available' },
  { num: 9,  cap: 6, status: 'occupied', waiter: 'Rohan',  amt: '₹1,560', time: '00:55' },
  { num: 10, cap: 4, status: 'available' },
  { num: 11, cap: 2, status: 'occupied', waiter: 'Priya',  amt: '₹420',   time: '00:22' },
  { num: 12, cap: 4, status: 'available' },
  { num: 13, cap: 6, status: 'reserved', name: 'Birthday Grp', rtime: '8:30 PM' },
  { num: 14, cap: 2, status: 'available' },
  { num: 15, cap: 8, status: 'occupied', waiter: 'Rohan',  amt: '₹3,100', time: '01:05' },
  { num: 16, cap: 4, status: 'available' },
];
