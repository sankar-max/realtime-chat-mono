import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),

	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	refreshToken: text("refresh_token").notNull(),

	deviceName: varchar("device_name", { length: 100 }),

	deviceIp: varchar("device_ip", { length: 45 }),

	userAgent: text("user_agent"),

	expiresAt: timestamp("expires_at").notNull(),

	revokedAt: timestamp("revoked_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
