import { z } from "zod";
import "dotenv/config";
const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),

	DATABASE_URL: z.string(),

	JWT_SECRET: z.string(),

	PORT: z.coerce.number().default(3001),
});

export const env = envSchema.parse(process.env);
