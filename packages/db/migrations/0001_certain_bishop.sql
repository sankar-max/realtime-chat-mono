ALTER TABLE "attachments" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "message_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "call_participants" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "call_participants" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "call_participants" ALTER COLUMN "call_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "call_participants" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "room_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "caller_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "device_tokens" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "device_tokens" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "device_tokens" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "message_deletions" ALTER COLUMN "message_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "message_deletions" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "message_receipts" ALTER COLUMN "message_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "message_receipts" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "room_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "reply_to_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "room_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "last_read_message_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "last_delivered_message_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "dm_key" varchar(255);--> statement-breakpoint
CREATE INDEX "call_participants_user_idx" ON "call_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calls_caller_idx" ON "calls" USING btree ("caller_id");--> statement-breakpoint
CREATE UNIQUE INDEX "device_tokens_token_unique" ON "device_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_reply_to_idx" ON "messages" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX "room_members_room_idx" ON "room_members" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "room_members_user_idx" ON "room_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_members_unique" ON "room_members" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_dm_key_unique" ON "rooms" USING btree ("dm_key");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");