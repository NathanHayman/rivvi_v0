CREATE TYPE "public"."call_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('pending', 'calling', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."row_status" AS ENUM('pending', 'calling', 'completed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('draft', 'processing', 'ready', 'scheduled', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'superadmin');--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "direction" SET DATA TYPE call_direction;--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "status" SET DATA TYPE call_status;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "direction" SET DATA TYPE call_direction;--> statement-breakpoint
ALTER TABLE "rows" ALTER COLUMN "status" SET DATA TYPE row_status;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "run_status" SET DATA TYPE run_status;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE user_role;--> statement-breakpoint
DROP TYPE "public"."direction";--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
DROP TYPE "public"."role";