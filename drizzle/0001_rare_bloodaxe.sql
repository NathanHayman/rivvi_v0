CREATE TYPE "public"."direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'processing', 'ready', 'scheduled', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'superadmin');--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "direction" SET DATA TYPE direction;--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "direction" SET DATA TYPE direction;--> statement-breakpoint
ALTER TABLE "rows" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "run_status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE role;--> statement-breakpoint
DROP TYPE "public"."call_direction";--> statement-breakpoint
DROP TYPE "public"."call_status";--> statement-breakpoint
DROP TYPE "public"."row_status";--> statement-breakpoint
DROP TYPE "public"."run_status";--> statement-breakpoint
DROP TYPE "public"."user_role";