-- CreateEnum
CREATE TYPE "QuoteType" AS ENUM ('CUTTING', 'SALE');

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "quote_type" "QuoteType" NOT NULL DEFAULT 'CUTTING',
ADD COLUMN     "sale_markup_type" "DiscountType",
ADD COLUMN     "sale_markup_value" DOUBLE PRECISION;
