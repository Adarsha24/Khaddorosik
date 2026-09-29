import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY
if (!UNSPLASH_KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY in .env')
  process.exit(1)
}

async function fetchPhotoUrl(dishName: string): Promise<string | null> {
  const query = encodeURIComponent(`${dishName} indian food`)
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
  )

  if (!res.ok) {
    console.error(`  Unsplash API error for "${dishName}": ${res.status}`)
    return null
  }

  const data = await res.json()
  const photo = data.results?.[0]
  return photo?.urls?.small ?? null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const items = await prisma.menuItem.findMany()
  const uniqueNames = [...new Set(items.map((i) => i.name))]

  console.log(`Found ${items.length} menu items across ${uniqueNames.length} unique dishes.`)

  for (const name of uniqueNames) {
    process.stdout.write(`Fetching photo for "${name}"... `)
    const url = await fetchPhotoUrl(name)

    if (!url) {
      console.log('no result, skipping.')
      continue
    }

    const result = await prisma.menuItem.updateMany({
      where: { name },
      data: { imageUrl: url },
    })

    console.log(`updated ${result.count} row(s).`)

    await sleep(300)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error('Fetch failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
