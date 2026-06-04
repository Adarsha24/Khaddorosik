export type MenuCategory = {
  id: string;
  label: string;
  icon: string;
};

export type MenuItem = {
  id: number;
  name: string;
  cat: string;
  price: number;
  veg: boolean;
  emoji: string;
  best?: boolean;
  avail: boolean;
};

export type CartItem = MenuItem & { qty: number };

export const MENU_CATS: MenuCategory[] = [
  { id: 'all', label: 'All Items', icon: '' },
  { id: 'starters', label: 'Starters', icon: '🍢' },
  { id: 'mains', label: 'Main Course', icon: '🍛' },
  { id: 'biryani', label: 'Biryani', icon: '🍚' },
  { id: 'breads', label: 'Breads', icon: '🫓' },
  { id: 'desserts', label: 'Desserts', icon: '🍮' },
  { id: 'beverages', label: 'Beverages', icon: '🥤' },
  { id: 'soups', label: 'Soups', icon: '🍵' },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 1,  name: 'Paneer Tikka',       cat: 'starters',  price: 220, veg: true,  emoji: '🍢', best: true,  avail: true },
  { id: 2,  name: 'Chicken Tikka',      cat: 'starters',  price: 280, veg: false, emoji: '🍗', best: true,  avail: true },
  { id: 3,  name: 'Veg Spring Roll',    cat: 'starters',  price: 160, veg: true,  emoji: '🥢',              avail: true },
  { id: 4,  name: 'Seekh Kebab',        cat: 'starters',  price: 260, veg: false, emoji: '🍖',              avail: true },
  { id: 5,  name: 'Crispy Corn',        cat: 'starters',  price: 180, veg: true,  emoji: '🌽', best: true,  avail: true },
  { id: 6,  name: 'Fish Amritsari',     cat: 'starters',  price: 340, veg: false, emoji: '🐟',              avail: false },
  { id: 7,  name: 'Dal Makhani',        cat: 'mains',     price: 200, veg: true,  emoji: '🍲', best: true,  avail: true },
  { id: 8,  name: 'Butter Chicken',     cat: 'mains',     price: 320, veg: false, emoji: '🍛', best: true,  avail: true },
  { id: 9,  name: 'Palak Paneer',       cat: 'mains',     price: 230, veg: true,  emoji: '🥘',              avail: true },
  { id: 10, name: 'Mutton Rogan Josh',  cat: 'mains',     price: 380, veg: false, emoji: '🥩',              avail: true },
  { id: 11, name: 'Veg Biryani',        cat: 'biryani',   price: 240, veg: true,  emoji: '🍚',              avail: true },
  { id: 12, name: 'Chicken Biryani',    cat: 'biryani',   price: 290, veg: false, emoji: '🍚', best: true,  avail: true },
  { id: 13, name: 'Mutton Biryani',     cat: 'biryani',   price: 360, veg: false, emoji: '🍚',              avail: true },
  { id: 14, name: 'Garlic Naan',        cat: 'breads',    price: 60,  veg: true,  emoji: '🫓',              avail: true },
  { id: 15, name: 'Butter Roti',        cat: 'breads',    price: 35,  veg: true,  emoji: '🫓',              avail: true },
  { id: 16, name: 'Laccha Paratha',     cat: 'breads',    price: 70,  veg: true,  emoji: '🫓',              avail: true },
  { id: 17, name: 'Gulab Jamun',        cat: 'desserts',  price: 90,  veg: true,  emoji: '🍮', best: true,  avail: true },
  { id: 18, name: 'Kulfi Falooda',      cat: 'desserts',  price: 130, veg: true,  emoji: '🍧',              avail: true },
  { id: 19, name: 'Lassi',             cat: 'beverages', price: 80,  veg: true,  emoji: '🥛',              avail: true },
  { id: 20, name: 'Masala Chai',        cat: 'beverages', price: 40,  veg: true,  emoji: '☕',              avail: true },
  { id: 21, name: 'Cold Coffee',        cat: 'beverages', price: 100, veg: true,  emoji: '☕',              avail: true },
  { id: 22, name: 'Fresh Lime Soda',    cat: 'beverages', price: 60,  veg: true,  emoji: '🍋',              avail: true },
  { id: 23, name: 'Tomato Soup',        cat: 'soups',     price: 120, veg: true,  emoji: '🍵',              avail: true },
  { id: 24, name: 'Manchow Soup',       cat: 'soups',     price: 130, veg: false, emoji: '🍜',              avail: true },
];
