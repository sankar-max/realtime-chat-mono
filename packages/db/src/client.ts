import { env } from '@chat/config'
import * as schema from '@chat/schema'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const createDb = () => {
  // Use Neon HTTP driver in production
  if (env.NODE_ENV === 'production') {
    const sql = neon(env.DATABASE_URL)
    return drizzleNeon(sql, { schema })
  }

  // Use standard TCP driver for local development (Docker)
  const client = postgres(env.DATABASE_URL)
  return drizzlePostgres(client, { schema })
}

export const db = createDb()
