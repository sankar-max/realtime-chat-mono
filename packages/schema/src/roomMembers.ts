import {
	boolean,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { users } from "./users";

export const roomRoleEnum = pgEnum("room_role", ["member", "admin"]);

export const roomMembers = pgTable("room_members", {
	id: uuid("id").primaryKey().defaultRandom(),

	roomId: uuid("room_id")
		.notNull()
		.references(() => rooms.id, { onDelete: "cascade" }),

	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	role: roomRoleEnum("role").default("member").notNull(),

	isMuted: boolean("is_muted").default(false).notNull(),

	lastReadMessageId: uuid("last_read_message_id"),

	lastDeliveredMessageId: uuid("last_delivered_message_id"),

	joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
