ALTER TABLE "bookings" ALTER COLUMN "tickets_booked" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" DROP DEFAULT;