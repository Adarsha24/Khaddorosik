import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

// Used by Prisma CLI (migrate, db push, studio, seed)
export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
