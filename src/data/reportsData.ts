export const HOURLY_DATA = [0,0,0,200,800,2400,3200,4100,2800,1900,3800,4200,3600,2200,800,1200,2800,4600,5200,4800,3200,1600,800,200];
export const HOURLY_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];

export const TOP_ITEMS = [
  { name: 'Butter Chicken',  qty: 42, rev: '₹13,440', pct: 100 },
  { name: 'Chicken Biryani', qty: 38, rev: '₹11,020', pct: 90  },
  { name: 'Dal Makhani',     qty: 35, rev: '₹7,000',  pct: 83  },
  { name: 'Paneer Tikka',    qty: 29, rev: '₹6,380',  pct: 69  },
  { name: 'Garlic Naan',     qty: 84, rev: '₹5,040',  pct: 67  },
];

export const CATEGORY_PIE = [
  { name: 'Main Course', pct: 35, amt: '₹15,000', color: '#e85c26' },
  { name: 'Biryani',     pct: 20, amt: '₹8,568',  color: '#2d6be4' },
  { name: 'Starters',    pct: 15, amt: '₹6,426',  color: '#27ae60' },
  { name: 'Beverages',   pct: 15, amt: '₹6,426',  color: '#f59e0b' },
  { name: 'Desserts',    pct: 15, amt: '₹6,420',  color: '#7c3aed' },
];

export const STAT_CARDS = [
  { label: "Today's Revenue",  value: '₹42,840', delta: '+18.4% vs yesterday', up: true,  icon: '💰', iconColor: 'bg-[#fff3ee] text-[#e85c26]' },
  { label: 'Total Orders',     value: '127',      delta: '+23 from yesterday',  up: true,  icon: '🧾', iconColor: 'bg-[#eafaf1] text-[#27ae60]' },
  { label: 'Avg. Ticket Size', value: '₹1,340',   delta: '−₹82 vs yesterday',  up: false, icon: '👥', iconColor: 'bg-[#eef3fd] text-[#2d6be4]' },
  { label: 'Table Turnover',   value: '3.2x',     delta: '+0.4 vs avg',        up: true,  icon: '🔄', iconColor: 'bg-[#f5f3ff] text-[#7c3aed]' },
];

export const TAX_ROWS = [
  { type: 'CGST 2.5%', cls: 'bg-[#f5f3ff] text-[#7c3aed]', taxable: '₹42,840', tax: '₹1,071' },
  { type: 'SGST 2.5%', cls: 'bg-[#eafaf1] text-[#27ae60]',  taxable: '₹42,840', tax: '₹1,071' },
  { type: 'GST 5%',    cls: 'bg-[#eef3fd] text-[#2d6be4]',  taxable: '₹42,840', tax: '₹2,142' },
];

export const DAILY_SALES = [
  { day: 'Mon', revenue: 32400, orders: 96  },
  { day: 'Tue', revenue: 38600, orders: 110 },
  { day: 'Wed', revenue: 29800, orders: 88  },
  { day: 'Thu', revenue: 41200, orders: 122 },
  { day: 'Fri', revenue: 52100, orders: 148 },
  { day: 'Sat', revenue: 61800, orders: 174 },
  { day: 'Sun', revenue: 42840, orders: 127 },
];

export const ITEM_WISE = [
  { name: 'Butter Chicken',  cat: 'Main Course', qty: 42, rev: 13440, avg: 320 },
  { name: 'Chicken Biryani', cat: 'Biryani',     qty: 38, rev: 11020, avg: 290 },
  { name: 'Dal Makhani',     cat: 'Main Course', qty: 35, rev:  7000, avg: 200 },
  { name: 'Garlic Naan',     cat: 'Breads',      qty: 84, rev:  5040, avg:  60 },
  { name: 'Paneer Tikka',    cat: 'Starters',    qty: 29, rev:  6380, avg: 220 },
  { name: 'Lassi',           cat: 'Beverages',   qty: 56, rev:  4480, avg:  80 },
  { name: 'Gulab Jamun',     cat: 'Desserts',    qty: 44, rev:  3960, avg:  90 },
  { name: 'Mutton Biryani',  cat: 'Biryani',     qty: 18, rev:  6480, avg: 360 },
  { name: 'Crispy Corn',     cat: 'Starters',    qty: 27, rev:  4860, avg: 180 },
  { name: 'Cold Coffee',     cat: 'Beverages',   qty: 33, rev:  3300, avg: 100 },
];

export const STAFF_SALES = [
  { name: 'Anjali', role: 'Waiter',  orders: 48, revenue: '₹18,240', tables: 6, rating: 4.8 },
  { name: 'Rohan',  role: 'Waiter',  orders: 42, revenue: '₹15,960', tables: 5, rating: 4.6 },
  { name: 'Priya',  role: 'Waiter',  orders: 37, revenue: '₹12,640', tables: 5, rating: 4.5 },
  { name: 'Vikram', role: 'Captain', orders: 22, revenue: '₹9,240',  tables: 3, rating: 4.9 },
  { name: 'Sunita', role: 'Waiter',  orders: 18, revenue: '₹7,020',  tables: 2, rating: 4.3 },
];