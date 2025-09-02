ALTER TABLE "fx_rates" ALTER COLUMN "rates" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "base_currency" varchar(10) DEFAULT 'INR';