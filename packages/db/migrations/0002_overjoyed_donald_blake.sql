DROP INDEX "messages_room_created_idx";--> statement-breakpoint
DROP INDEX "messages_sender_idx";--> statement-breakpoint
DROP INDEX "messages_reply_to_idx";--> statement-breakpoint
DROP INDEX "rooms_dm_key_unique";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "created_by" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_messages_room_created_id" ON "messages" USING btree ("room_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_reply_to_id" ON "messages" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX "idx_messages_room_id" ON "messages" USING btree ("room_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_dm_key_unique" ON "rooms" USING btree ("dm_key") WHERE type = 'direct';