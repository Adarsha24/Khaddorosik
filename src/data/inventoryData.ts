export type InvCategory = 'All' | 'Meat' | 'Dairy' | 'Grains' | 'Vegetables' | 'Spices' | 'Oils';

export type InvItem = {
  id: number;
  name: string;
  cat: string;
  stock: number;
  unit: string;
  reorder: number;
  updated: string;
  pct: number;
};

export const INV_ITEMS: InvItem[] = [
  { id: 1,  name: 'Chicken Breast',  cat: 'Meat',       stock: 12.5, unit: 'kg', reorder: 5,   updated: '2h ago',  pct: 62 },
  { id: 2,  name: 'Paneer',          cat: 'Dairy',      stock: 3.2,  unit: 'kg', reorder: 4,   updated: '4h ago',  pct: 22 },
  { id: 3,  name: 'Basmati Rice',    cat: 'Grains',     stock: 28,   unit: 'kg', reorder: 10,  updated: '1d ago',  pct: 70 },
  { id: 4,  name: 'Tomatoes',        cat: 'Vegetables', stock: 1.5,  unit: 'kg', reorder: 3,   updated: '3h ago',  pct: 15 },
  { id: 5,  name: 'Onions',          cat: 'Vegetables', stock: 18,   unit: 'kg', reorder: 5,   updated: '1d ago',  pct: 72 },
  { id: 6,  name: 'Butter',          cat: 'Dairy',      stock: 0.8,  unit: 'kg', reorder: 2,   updated: '5h ago',  pct: 8  },
  { id: 7,  name: 'Cream',           cat: 'Dairy',      stock: 4.2,  unit: 'L',  reorder: 2,   updated: '3h ago',  pct: 84 },
  { id: 8,  name: 'Mutton',          cat: 'Meat',       stock: 6,    unit: 'kg', reorder: 4,   updated: '6h ago',  pct: 50 },
  { id: 9,  name: 'Wheat Flour',     cat: 'Grains',     stock: 14,   unit: 'kg', reorder: 8,   updated: '2d ago',  pct: 56 },
  { id: 10, name: 'Mustard Oil',     cat: 'Oils',       stock: 3,    unit: 'L',  reorder: 2,   updated: '1d ago',  pct: 60 },
  { id: 11, name: 'Garam Masala',    cat: 'Spices',     stock: 0.4,  unit: 'kg', reorder: 0.5, updated: '3d ago',  pct: 40 },
  { id: 12, name: 'Cumin Seeds',     cat: 'Spices',     stock: 0.2,  unit: 'kg', reorder: 0.3, updated: '3d ago',  pct: 12 },
  { id: 13, name: 'Turmeric Powder', cat: 'Spices',     stock: 0.6,  unit: 'kg', reorder: 0.3, updated: '5d ago',  pct: 60 },
  { id: 14, name: 'Fish Fillet',     cat: 'Meat',       stock: 2.4,  unit: 'kg', reorder: 3,   updated: '1h ago',  pct: 24 },
  { id: 15, name: 'Milk',            cat: 'Dairy',      stock: 8,    unit: 'L',  reorder: 5,   updated: '6h ago',  pct: 80 },
  { id: 16, name: 'Potatoes',        cat: 'Vegetables', stock: 22,   unit: 'kg', reorder: 8,   updated: '2d ago',  pct: 88 },
];

export const SEMI_FINISHED: InvItem[] = [
  { id: 101, name: 'Makhani Gravy',     cat: 'Gravy',  stock: 4.5, unit: 'L',  reorder: 2,   updated: '2h ago',  pct: 75 },
  { id: 102, name: 'Biryani Masala',    cat: 'Masala', stock: 1.2, unit: 'kg', reorder: 0.5, updated: '4h ago',  pct: 60 },
  { id: 103, name: 'Marinated Chicken', cat: 'Prep',   stock: 3.0, unit: 'kg', reorder: 2,   updated: '1h ago',  pct: 50 },
  { id: 104, name: 'Tandoor Dough',     cat: 'Prep',   stock: 2.5, unit: 'kg', reorder: 2,   updated: '30m ago', pct: 50 },
  { id: 105, name: 'Dal Paste',         cat: 'Prep',   stock: 0.8, unit: 'kg', reorder: 1,   updated: '3h ago',  pct: 16 },
  { id: 106, name: 'Tomato Puree',      cat: 'Gravy',  stock: 5.0, unit: 'L',  reorder: 3,   updated: '6h ago',  pct: 83 },
];

export const PURCHASE_ORDERS = [
  { id: 'PO-001', vendor: 'Fresh Farms',  items: 3, amount: '₹4,200', date: 'Today',     status: 'pend' as const },
  { id: 'PO-002', vendor: 'Dairy Direct', items: 2, amount: '₹1,800', date: 'Yesterday', status: 'conf' as const },
  { id: 'PO-003', vendor: 'Spice World',  items: 5, amount: '₹960',   date: '28 May',    status: 'delv' as const },
  { id: 'PO-004', vendor: 'Meat Masters', items: 4, amount: '₹7,500', date: '27 May',    status: 'delv' as const },
  { id: 'PO-005', vendor: 'Grain Hub',    items: 2, amount: '₹2,100', date: '25 May',    status: 'canc' as const },
];

export type POStatus = 'pend' | 'conf' | 'delv' | 'canc';

export const INV_CATEGORIES = ['All', 'Meat', 'Dairy', 'Grains', 'Vegetables', 'Spices', 'Oils'];