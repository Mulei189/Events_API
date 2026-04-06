ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_event_id_unique";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "tickets_left_check";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "tickets_booked" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text NOT NULL;