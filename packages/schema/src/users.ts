import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),

	email: varchar("email", { length: 255 }).notNull().unique(),

	displayName: varchar("display_name", { length: 100 }).notNull(),

	passwordHash: varchar("password_hash", { length: 255 }).notNull(),

	avatarUrl: text("avatar_url"),

	bio: text("bio"),

	isVerified: boolean("is_verified").default(false).notNull(),

	lastSeenAt: timestamp("last_seen_at"),

	deletedAt: timestamp("deleted_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
