-- Add weekly and monthly usage counters per API key (UTC periods).
ALTER TABLE "api_key" ADD COLUMN "usage_week_key" TEXT NOT NULL DEFAULT '';
ALTER TABLE "api_key" ADD COLUMN "usage_count_weekly" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "api_key" ADD COLUMN "usage_month_key" TEXT NOT NULL DEFAULT '';
ALTER TABLE "api_key" ADD COLUMN "usage_count_monthly" INTEGER NOT NULL DEFAULT 0;
