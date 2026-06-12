import { PrismaClient, Role, EmployeeRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const RESTAURANTS = [
  { id: 'rest-001', name: 'Spice Garden', email: 'admin@spicegarden.com',       phone: '9800000001', city: 'Mumbai',    address: '12 Marine Drive, Nariman Point' },
  { id: 'rest-002', name: 'The Royal Feast', email: 'admin@royalfeast.com',    phone: '9800000002', city: 'Delhi',     address: '45 Connaught Place, New Delhi' },
  { id: 'rest-003', name: 'Curry House',   email: 'admin@curryhouse.com',       phone: '9800000003', city: 'Bengaluru', address: '8 Brigade Road, Bangalore' },
  { id: 'rest-004', name: 'Tandoor Trail', email: 'admin@tandoortrail.com',     phone: '9800000004', city: 'Hyderabad', address: '22 Banjara Hills Road' },
  { id: 'rest-005', name: 'Biryani Palace', email: 'admin@biryanipalace.com',  phone: '9800000005', city: 'Chennai',   address: '67 Anna Salai, T.Nagar' },
  { id: 'rest-006', name: 'Masala Grill',  email: 'admin@masalagrill.com',      phone: '9800000006', city: 'Pune',      address: '3 FC Road, Shivajinagar' },
  { id: 'rest-007', name: 'The Desi Bowl', email: 'admin@desibowl.com',         phone: '9800000007', city: 'Kolkata',   address: '15 Park Street, Kolkata' },
  { id: 'rest-008', name: 'Nawabi Kitchen', email: 'admin@nawabikitchen.com',  phone: '9800000008', city: 'Lucknow',   address: '9 Hazratganj Road' },
  { id: 'rest-009', name: 'Zaika Corner',  email: 'admin@zaikacorner.com',      phone: '9800000009', city: 'Ahmedabad', address: '55 CG Road, Navrangpura' },
  { id: 'rest-010', name: 'Khaddorosik Demo', email: 'admin@khaddorosik.com',  phone: '9800000010', city: 'Jaipur',    address: '7 MI Road, Jaipur' },
]

const MENU_ITEMS = [
  { name: 'Paneer Tikka',         price: 280, costPrice: 120, veg: true,  bestSeller: true  },
  { name: 'Chicken 65',           price: 320, costPrice: 140, veg: false, bestSeller: true  },
  { name: 'Veg Spring Rolls',     price: 180, costPrice:  60, veg: true,  bestSeller: false },
  { name: 'Seekh Kebab',          price: 350, costPrice: 160, veg: false, bestSeller: false },
  { name: 'Butter Chicken',       price: 380, costPrice: 170, veg: false, bestSeller: true  },
  { name: 'Dal Makhani',          price: 280, costPrice:  80, veg: true,  bestSeller: true  },
  { name: 'Palak Paneer',         price: 300, costPrice:  90, veg: true,  bestSeller: false },
  { name: 'Mutton Rogan Josh',    price: 480, costPrice: 220, veg: false, bestSeller: false },
  { name: 'Kadai Vegetables',     price: 260, costPrice:  70, veg: true,  bestSeller: false },
  { name: 'Chicken Dum Biryani',  price: 420, costPrice: 180, veg: false, bestSeller: true  },
  { name: 'Veg Biryani',          price: 320, costPrice: 100, veg: true,  bestSeller: false },
  { name: 'Mutton Biryani',       price: 520, costPrice: 240, veg: false, bestSeller: false },
  { name: 'Butter Naan',          price:  50, costPrice:  12, veg: true,  bestSeller: false },
  { name: 'Garlic Naan',          price:  60, costPrice:  14, veg: true,  bestSeller: false },
  { name: 'Tandoori Roti',        price:  40, costPrice:   8, veg: true,  bestSeller: false },
  { name: 'Paratha',              price:  70, costPrice:  18, veg: true,  bestSeller: false },
  { name: 'Gulab Jamun',          price: 120, costPrice:  35, veg: true,  bestSeller: false },
  { name: 'Kheer',                price: 130, costPrice:  40, veg: true,  bestSeller: false },
  { name: 'Gajar Halwa',          price: 150, costPrice:  50, veg: true,  bestSeller: false },
  { name: 'Mango Lassi',          price: 120, costPrice:  30, veg: true,  bestSeller: true  },
  { name: 'Sweet Lassi',          price: 100, costPrice:  25, veg: true,  bestSeller: false },
  { name: 'Masala Chai',          price:  60, costPrice:  10, veg: true,  bestSeller: false },
  { name: 'Cold Coffee',          price: 140, costPrice:  40, veg: true,  bestSeller: false },
  { name: 'Fresh Lime Soda',      price:  80, costPrice:  15, veg: true,  bestSeller: false },
]

const CATEGORY_NAMES = ['Starters', 'Mains', 'Biryani', 'Breads', 'Desserts', 'Beverages']
const ITEM_CATEGORY_MAP: Record<string, string> = {
  'Paneer Tikka': 'Starters', 'Chicken 65': 'Starters', 'Veg Spring Rolls': 'Starters', 'Seekh Kebab': 'Starters',
  'Butter Chicken': 'Mains', 'Dal Makhani': 'Mains', 'Palak Paneer': 'Mains', 'Mutton Rogan Josh': 'Mains', 'Kadai Vegetables': 'Mains',
  'Chicken Dum Biryani': 'Biryani', 'Veg Biryani': 'Biryani', 'Mutton Biryani': 'Biryani',
  'Butter Naan': 'Breads', 'Garlic Naan': 'Breads', 'Tandoori Roti': 'Breads', 'Paratha': 'Breads',
  'Gulab Jamun': 'Desserts', 'Kheer': 'Desserts', 'Gajar Halwa': 'Desserts',
  'Mango Lassi': 'Beverages', 'Sweet Lassi': 'Beverages', 'Masala Chai': 'Beverages', 'Cold Coffee': 'Beverages', 'Fresh Lime Soda': 'Beverages',
}

async function seedRestaurant(rest: typeof RESTAURANTS[0]) {
  const restaurant = await prisma.restaurant.upsert({
    where: { email: rest.email },
    update: {},
    create: { 



      id: rest.id, name: rest.name, email: rest.email,
      phone: rest.phone, city: rest.city, address: rest.address,
      gstNumber: `GST${rest.id.replace('rest-', '').padStart(10, '0')}IN`,
      taxRate: 0.05, cgstRate: 0.025, sgstRate: 0.025,
    },
  })

  // Categories
  const catMap: Record<string, string> = {}
  for (let i = 0; i < CATEGORY_NAMES.length; i++) {
    const cat = await prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: CATEGORY_NAMES[i] } },
      update: {},
      create: { restaurantId: restaurant.id, name: CATEGORY_NAMES[i], displayOrder: i + 1 },
    })
    catMap[CATEGORY_NAMES[i]] = cat.id
  }

  // Menu Items
  for (const item of MENU_ITEMS) {
    const catId = catMap[ITEM_CATEGORY_MAP[item.name]]
    if (!catId) continue
    await prisma.menuItem.create({
      data: { categoryId: catId, name: item.name, price: item.price, costPrice: item.costPrice, veg: item.veg, bestSeller: item.bestSeller },
    }).catch(() => {})
  }

  // Tables
  for (let i = 1; i <= 15; i++) {
    const capacity = i <= 5 ? 2 : i <= 10 ? 4 : 6
    await prisma.restaurantTable.upsert({
      where: { restaurantId_number: { restaurantId: restaurant.id, number: i } },
      update: {},
      create: {
        restaurantId: restaurant.id, number: i, capacity,
        section: i <= 5 ? 'Ground Floor' : i <= 10 ? 'First Floor' : 'Terrace',
      },
    })
  }

  // Admin employee + user
  const adminEmp = await prisma.employee.upsert({
    where: { id: `emp-admin-${rest.id}` },
    update: {},
    create: {
      id: `emp-admin-${rest.id}`,
      restaurantId: restaurant.id,
      name: `Manager — ${rest.name}`,
      role: EmployeeRole.MANAGER,
      email: rest.email,
      phone: rest.phone ?? '',
    },
  })

  await prisma.user.upsert({
    where: { restaurantId_email: { restaurantId: restaurant.id, email: rest.email } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      email: rest.email,
      passwordHash: await bcrypt.hash('admin123', 12),
      role: Role.SUPER_ADMIN,
      employeeId: adminEmp.id,
    },
  })

  // Waiter + cashier staff
  const waiterEmp = await prisma.employee.upsert({
    where: { id: `emp-waiter-${rest.id}` },
    update: {},
    create: {
      id: `emp-waiter-${rest.id}`,
      restaurantId: restaurant.id,
      name: 'Head Waiter',
      role: EmployeeRole.HEAD_WAITER,
    },
  })

  const waiterEmail = `waiter@${rest.email.split('@')[1]}`
  await prisma.user.upsert({
    where: { restaurantId_email: { restaurantId: restaurant.id, email: waiterEmail } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      email: waiterEmail,
      passwordHash: await bcrypt.hash('waiter123', 12),
      role: Role.WAITER,
      employeeId: waiterEmp.id,
    },
  })

  // Inventory
  const inventoryItems = [
    { name: 'Chicken', category: 'Meat', unit: 'kg', currentStock: 25, reorderLevel: 5 },
    { name: 'Mutton', category: 'Meat', unit: 'kg', currentStock: 10, reorderLevel: 3 },
    { name: 'Paneer', category: 'Dairy', unit: 'kg', currentStock: 8, reorderLevel: 2 },
    { name: 'Basmati Rice', category: 'Grains', unit: 'kg', currentStock: 50, reorderLevel: 10 },
    { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', currentStock: 15, reorderLevel: 3 },
    { name: 'Onions', category: 'Vegetables', unit: 'kg', currentStock: 20, reorderLevel: 5 },
    { name: 'Milk', category: 'Dairy', unit: 'litre', currentStock: 10, reorderLevel: 3 },
    { name: 'Cooking Oil', category: 'Pantry', unit: 'litre', currentStock: 12, reorderLevel: 3 },
  ]
  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: { restaurantId: restaurant.id, ...item },
    }).catch(() => {})
  }

  // Sample customers
  await prisma.customer.upsert({
    where: { restaurantId_phone: { restaurantId: restaurant.id, phone: '9876543210' } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Adrsha Das', phone: '9876543210', email: `Anu@${rest.email.split('@')[1]}`,
    },
  })

  // Discount codes
  await prisma.discount.upsert({
    where: { restaurantId_code: { restaurantId: restaurant.id, code: 'WELCOME10' } },
    update: {},
    create: {
      restaurantId: restaurant.id, code: 'WELCOME10', description: '10% off on first order',
      type: 'PERCENTAGE', value: 10, minOrder: 200,
    },
  })
  await prisma.discount.upsert({
    where: { restaurantId_code: { restaurantId: restaurant.id, code: 'FLAT50' } },
    update: {},
    create: {
      restaurantId: restaurant.id, code: 'FLAT50', description: '₹50 flat discount',
      type: 'FLAT', value: 50, minOrder: 300,
    },
  })

  console.log(`  ✓ ${rest.name} (${rest.email} / admin123)`)
}

async function main() {
  console.log('🌱 Seeding 10 restaurants...\n')

  for (const rest of RESTAURANTS) {
    await seedRestaurant(rest)
  }

  console.log('\n✅ All restaurants seeded!')
  console.log('─────────────────────────────────────────────')
  console.log('Login credentials (password: admin123):')
  RESTAURANTS.forEach(r => console.log(`  ${r.email}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
