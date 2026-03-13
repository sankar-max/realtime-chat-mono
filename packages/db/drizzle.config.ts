import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: 'packages/schema/src',
  out: 'packages/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
