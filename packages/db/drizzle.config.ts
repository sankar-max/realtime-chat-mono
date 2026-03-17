import path from 'node:path'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const root = process.cwd()

config({ path: path.resolve(root, '.env') })
config({ path: path.resolve(root, '.env.local'), override: true })

console.log('🔗 Connecting to:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'Unknown')

export default defineConfig({
  schema: 'packages/schema/src',
  out: 'packages/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
