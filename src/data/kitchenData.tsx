export type KotStatus = 'pending' | 'ready' | 'served';

export type KotItem = {
  n: string;
  q: number;
  done: boolean;
};

export type KotOrder = {
  id: number;
  table: number;
  status: KotStatus;
  time: string;
  color: string;
  items: KotItem[];
};

export const KOT_ORDERS: KotOrder[] = [
  {
    id: 1, table: 3, status: 'pending', time: '8m', color: '#f59e0b',
    items: [
      { n: 'Paneer Tikka',    q: 2, done: false },
      { n: 'Veg Spring Roll', q: 1, done: true  },
      { n: 'Dal Makhani',     q: 1, done: false },
    ],
  },
  {
    id: 2, table: 5, status: 'pending', time: '12m', color: '#e85c26',
    items: [
      { n: 'Butter Chicken', q: 2, done: false },
      { n: 'Garlic Naan',    q: 4, done: true  },
      { n: 'Lassi',          q: 2, done: false },
    ],
  },
  {
    id: 3, table: 7, status: 'ready', time: '5m', color: '#27ae60',
    items: [
      { n: 'Chicken Biryani', q: 1, done: true },
      { n: 'Raita',           q: 1, done: true },
    ],
  },
  {
    id: 4, table: 2, status: 'pending', time: '18m', color: '#e53e3e',
    items: [
      { n: 'Mutton Rogan Josh', q: 1, done: false },
      { n: 'Butter Roti',       q: 3, done: true  },
    ],
  },
  {
    id: 5, table: 9, status: 'ready', time: '3m', color: '#27ae60',
    items: [
      { n: 'Gulab Jamun',   q: 3, done: true },
      { n: 'Kulfi Falooda', q: 2, done: true },
    ],
  },
  {
    id: 6, table: 15, status: 'pending', time: '22m', color: '#7c3aed',
    items: [
      { n: 'Fish Amritsari', q: 2, done: false },
      { n: 'Manchow Soup',   q: 4, done: false },
      { n: 'Laccha Paratha', q: 6, done: true  },
    ],
  },
];

export const SERVED_ORDERS: KotOrder[] = [
  { id: 7,  table: 1,  status: 'served', time: '32m', color: '#27ae60', items: [{ n: 'Masala Chai', q: 2, done: true }, { n: 'Veg Spring Roll', q: 1, done: true }] },
  { id: 8,  table: 4,  status: 'served', time: '28m', color: '#27ae60', items: [{ n: 'Crispy Corn', q: 2, done: true }, { n: 'Cold Coffee', q: 2, done: true }] },
  { id: 9,  table: 6,  status: 'served', time: '45m', color: '#27ae60', items: [{ n: 'Paneer Tikka', q: 3, done: true }, { n: 'Garlic Naan', q: 6, done: true }, { n: 'Lassi', q: 3, done: true }] },
  { id: 10, table: 8,  status: 'served', time: '19m', color: '#27ae60', items: [{ n: 'Tomato Soup', q: 2, done: true }, { n: 'Butter Roti', q: 4, done: true }] },
  { id: 11, table: 10, status: 'served', time: '55m', color: '#27ae60', items: [{ n: 'Dal Makhani', q: 2, done: true }, { n: 'Laccha Paratha', q: 3, done: true }] },
  { id: 12, table: 11, status: 'served', time: '38m', color: '#27ae60', items: [{ n: 'Chicken Tikka', q: 2, done: true }, { n: 'Seekh Kebab', q: 1, done: true }] },
  { id: 13, table: 12, status: 'served', time: '62m', color: '#27ae60', items: [{ n: 'Veg Biryani', q: 2, done: true }, { n: 'Gulab Jamun', q: 2, done: true }] },
  { id: 14, table: 13, status: 'served', time: '41m', color: '#27ae60', items: [{ n: 'Mutton Biryani', q: 3, done: true }, { n: 'Kulfi Falooda', q: 3, done: true }] },
  { id: 15, table: 14, status: 'served', time: '27m', color: '#27ae60', items: [{ n: 'Butter Chicken', q: 1, done: true }, { n: 'Garlic Naan', q: 2, done: true }] },
  { id: 16, table: 16, status: 'served', time: '15m', color: '#27ae60', items: [{ n: 'Fresh Lime Soda', q: 3, done: true }, { n: 'Crispy Corn', q: 1, done: true }] },
  { id: 17, table: 4,  status: 'served', time: '70m', color: '#27ae60', items: [{ n: 'Palak Paneer', q: 2, done: true }, { n: 'Butter Roti', q: 3, done: true }] },
];