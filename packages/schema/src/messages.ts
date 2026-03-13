import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { users } from "./users";

export const messageTypeEnum = pgEnum("message_type", [
	"text",
	"image",
	"video",
	"file",
	"system",
]);

export const messages = pgTable(
	"messages",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		roomId: uuid("room_id")
			.notNull()
			.references(() => rooms.id, { onDelete: "cascade" }),

		senderId: uuid("sender_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		type: messageTypeEnum("type").default("text").notNull(),

		content: text("content"),

		replyToId: uuid("reply_to_id").references((): any => messages.id, {
			onDelete: "set null",
		}),

		isDeletedForEveryone: boolean("is_deleted_for_everyone")
			.default(false)
			.notNull(),

		editedAt: timestamp("edited_at"),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		roomMessagesIndex: index("messages_room_created_idx").on(
			table.roomId,
			table.createdAt,
		),
	}),
);
