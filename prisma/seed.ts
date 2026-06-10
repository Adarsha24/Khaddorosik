import { PrismaClient, Role, EmployeeRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Starters' }, update: {}, create: { name: 'Starters', displayOrder: 1 } }),
    prisma.category.upsert({ where: { name: 'Mains' }, update: {}, create: { name: 'Mains', displayOrder: 2 } }),
    prisma.category.upsert({ where: { name: 'Biryani' }, update: {}, create: { name: 'Biryani', displayOrder: 3 } }),
    prisma.category.upsert({ where: { name: 'Breads' }, update: {}, create: { name: 'Breads', displayOrder: 4 } }),
    prisma.category.upsert({ where: { name: 'Desserts' }, update: {}, create: { name: 'Desserts', displayOrder: 5 } }),
    prisma.category.upsert({ where: { name: 'Beverages' }, update: {}, create: { name: 'Beverages', displayOrder: 6 } }),
  ])

  const [starters, mains, biryani, breads, desserts, beverages] = categories

  // ── Menu Items ──────────────────────────────────────────────────────────────
  const menuItems = [
    { categoryId: starters.id, name: 'Paneer Tikka', price: 280, veg: true, bestSeller: true },
    { categoryId: starters.id, name: 'Chicken 65', price: 320, veg: false, bestSeller: true },
    { categoryId: starters.id, name: 'Veg Spring Rolls', price: 180, veg: true },
    { categoryId: starters.id, name: 'Seekh Kebab', price: 350, veg: false },
    { categoryId: mains.id, name: 'Butter Chicken', price: 380, veg: false, bestSeller: true },
    { categoryId: mains.id, name: 'Dal Makhani', price: 280, veg: true, bestSeller: true },
    { categoryId: mains.id, name: 'Palak Paneer', price: 300, veg: true },
    { categoryId: mains.id, name: 'Mutton Rogan Josh', price: 480, veg: false },
    { categoryId: mains.id, name: 'Kadai Vegetables', price: 260, veg: true },
    { categoryId: biryani.id, name: 'Chicken Dum Biryani', price: 420, veg: false, bestSeller: true },
    { categoryId: biryani.id, name: 'Veg Biryani', price: 320, veg: true },
    { categoryId: biryani.id, name: 'Mutton Biryani', price: 520, veg: false },
    { categoryId: breads.id, name: 'Butter Naan', price: 50, veg: true },
    { categoryId: breads.id, name: 'Garlic Naan', price: 60, veg: true },
    { categoryId: breads.id, name: 'Tandoori Roti', price: 40, veg: true },
    { categoryId: breads.id, name: 'Paratha', price: 70, veg: true },
    { categoryId: desserts.id, name: 'Gulab Jamun', price: 120, veg: true },
    { categoryId: desserts.id, name: 'Kheer', price: 130, veg: true },
    { categoryId: desserts.id, name: 'Gajar Halwa', price: 150, veg: true },
    { categoryId: beverages.id, name: 'Mango Lassi', price: 120, veg: true, bestSeller: true },
    { categoryId: beverages.id, name: 'Sweet Lassi', price: 100, veg: true },
    { categoryId: beverages.id, name: 'Masala Chai', price: 60, veg: true },
    { categoryId: beverages.id, name: 'Cold Coffee', price: 140, veg: true },
    { categoryId: beverages.id, name: 'Fresh Lime Soda', price: 80, veg: true },
  ]

  await prisma.menuItem.createMany({ data: menuItems, skipDuplicates: true })

  // ── Tables ──────────────────────────────────────────────────────────────────
  for (let i = 1; i <= 15; i++) {
    const capacity = i <= 5 ? 2 : i <= 10 ? 4 : 6
    await prisma.restaurantTable.upsert({
      where: { number: i },
      update: {},
      create: { number: i, capacity, section: i <= 5 ? 'Ground Floor' : i <= 10 ? 'First Floor' : 'Terrace' },
    })
  }

  // ── Super Admin ──────────────────────────────────────────────────────────────
  const adminEmployee = await prisma.employee.upsert({
    where: { email: 'admin@khaddorosik.com' },
    update: {},
    create: { name: 'Admin', role: EmployeeRole.MANAGER, email: 'admin@khaddorosik.com', phone: '9999999999' },
  })

  await prisma.user.upsert({
    where: { email: 'admin@khaddorosik.com' },
    update: {},
    create: {
      email: 'admin@khaddorosik.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: Role.SUPER_ADMIN,
      employeeId: adminEmployee.id,
    },
  })

  // ── Inventory ────────────────────────────────────────────────────────────────
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
    await prisma.inventoryItem.create({ data: item }).catch(() => {}) // skip if exists
  }

  // ── Sample Customer ──────────────────────────────────────────────────────────
  await prisma.customer.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com' },
  })

  console.log('✅ Seed complete!')
  console.log('   Login: admin@khaddorosik.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
