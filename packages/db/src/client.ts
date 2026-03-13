import { env } from "@chat/config";
import * as schema from "@chat/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
	schema,
});
