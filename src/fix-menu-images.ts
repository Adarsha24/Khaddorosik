/**
 * One-off fix: replaces missing local image filenames (e.g. "butter-chicken.jpg")
 * on menu_items with generated placeholder image URLs from placehold.co.
 *
 * Run with:
 *   npx ts-node --project tsconfig.seed.json scripts/fix-menu-images.ts
 *
 * Requires "placehold.co" to be added to next.config.ts images.remotePatterns.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// One colour per category, just for a bit of visual variety
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
    // Only fix items whose image_url looks like a bare local filename
    // (no http/https scheme), or is missing entirely.
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

  console.log(`✅ Updated ${updated} menu items with placeholder images.`)
}

main()
  .catch((e) => {
    console.error('Fix failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())