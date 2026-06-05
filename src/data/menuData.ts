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
  img: string;
  best?: boolean;
  avail: boolean;
};

export type CartItem = MenuItem & { qty: number };

export const MENU_CATS: MenuCategory[] = [
  { id: 'all',       label: 'All Items',   icon: ''  },
  { id: 'starters',  label: 'Starters',    icon: '🍢' },
  { id: 'mains',     label: 'Main Course', icon: '🍛' },
  { id: 'biryani',   label: 'Biryani',     icon: '🍚' },
  { id: 'breads',    label: 'Breads',      icon: '🫓' },
  { id: 'desserts',  label: 'Desserts',    icon: '🍮' },
  { id: 'beverages', label: 'Beverages',   icon: '🥤' },
  { id: 'soups',     label: 'Soups',       icon: '🍵' },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 1,  name: 'Paneer Tikka',      cat: 'starters',  price: 220, veg: true,  emoji: '🍢', img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', best: true,  avail: true  },
  { id: 2,  name: 'Chicken Tikka',     cat: 'starters',  price: 280, veg: false, emoji: '🍗', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80', best: true,  avail: true  },
  { id: 3,  name: 'Veg Spring Roll',   cat: 'starters',  price: 160, veg: true,  emoji: '🥢', img: 'https://images.unsplash.com/photo-1606525437388-a9f86a7f8ca5?w=300&q=80',              avail: true  },
  { id: 4,  name: 'Seekh Kebab',       cat: 'starters',  price: 260, veg: false, emoji: '🍖', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80',              avail: true  },
  { id: 5,  name: 'Crispy Corn',       cat: 'starters',  price: 180, veg: true,  emoji: '🌽', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&q=80', best: true,  avail: true  },
  { id: 6,  name: 'Fish Amritsari',    cat: 'starters',  price: 340, veg: false, emoji: '🐟', img: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=300&q=80',              avail: false },
  { id: 7,  name: 'Dal Makhani',       cat: 'mains',     price: 200, veg: true,  emoji: '🍲', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80', best: true,  avail: true  },
  { id: 8,  name: 'Butter Chicken',    cat: 'mains',     price: 320, veg: false, emoji: '🍛', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80', best: true,  avail: true  },
  { id: 9,  name: 'Palak Paneer',      cat: 'mains',     price: 230, veg: true,  emoji: '🥘', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80',              avail: true  },
  { id: 10, name: 'Mutton Rogan Josh', cat: 'mains',     price: 380, veg: false, emoji: '🥩', img: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=300&q=80',              avail: true  },
  { id: 11, name: 'Veg Biryani',       cat: 'biryani',   price: 240, veg: true,  emoji: '🍚', img: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&q=80',              avail: true  },
  { id: 12, name: 'Chicken Biryani',   cat: 'biryani',   price: 290, veg: false, emoji: '🍚', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', best: true,  avail: true  },
  { id: 13, name: 'Mutton Biryani',    cat: 'biryani',   price: 360, veg: false, emoji: '🍚', img: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&q=80',              avail: true  },
  { id: 14, name: 'Garlic Naan',       cat: 'breads',    price: 60,  veg: true,  emoji: '🫓', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&q=80',              avail: true  },
  { id: 15, name: 'Butter Roti',       cat: 'breads',    price: 35,  veg: true,  emoji: '🫓', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80',              avail: true  },
  { id: 16, name: 'Laccha Paratha',    cat: 'breads',    price: 70,  veg: true,  emoji: '🫓', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80',              avail: true  },
  { id: 17, name: 'Gulab Jamun',       cat: 'desserts',  price: 90,  veg: true,  emoji: '🍮', img: 'https://images.unsplash.com/photo-1601303516534-bf5757e9a915?w=300&q=80', best: true,  avail: true  },
  { id: 18, name: 'Kulfi Falooda',     cat: 'desserts',  price: 130, veg: true,  emoji: '🍧', img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&q=80',              avail: true  },
  { id: 19, name: 'Lassi',             cat: 'beverages', price: 80,  veg: true,  emoji: '🥛', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&q=80',              avail: true  },
  { id: 20, name: 'Masala Chai',       cat: 'beverages', price: 40,  veg: true,  emoji: '☕', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80',              avail: true  },
  { id: 21, name: 'Cold Coffee',       cat: 'beverages', price: 100, veg: true,  emoji: '☕', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80',              avail: true  },
  { id: 22, name: 'Fresh Lime Soda',   cat: 'beverages', price: 60,  veg: true,  emoji: '🍋', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80',              avail: true  },
  { id: 23, name: 'Tomato Soup',       cat: 'soups',     price: 120, veg: true,  emoji: '🍵', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80',              avail: true  },
  { id: 24, name: 'Manchow Soup',      cat: 'soups',     price: 130, veg: false, emoji: '🍜', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80',              avail: true  },
];