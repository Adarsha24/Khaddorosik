import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CATEGORY_COLORS: Record<string, string> = {
  Starters: 'f97316/ffffff',
  Mains: 'dc2626/ffffff',
  Biryani: 'b45309/ffffff',
  Breads: 'ca8a04/ffffff',
  Desserts: 'db2777/ffffff',
  Beverages: '0891b2/ffffff',
}

function placeholderUrl(name: string, category: string | null): string {
  const colors = (category && CATEGORY_COLORS[category]) || '64748b/ffffff'
  const text = encodeURIComponent(name)
  return `https://placehold.co/400x300/${colors}?text=${text}&font=roboto`
}

async function main() {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
  })

  console.log(`Found ${items.length} menu items.`)

  let updated = 0
  for (const item of items) {
    const isBrokenLocalPath =
      !item.imageUrl || !/^https?:\/\//i.test(item.imageUrl)

    if (!isBrokenLocalPath) continue

    const category = (item as any).category?.name ?? null
    const newUrl = placeholderUrl(item.name, category)

    await prisma.menuItem.update({
      where: { id: item.id },
      data: { imageUrl: newUrl },
    })
    updated++
  }

  console.log(`Updated ${updated} menu items with placeholder images.`)
}

main()
  .catch((e) => {
    console.error('Fix failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
