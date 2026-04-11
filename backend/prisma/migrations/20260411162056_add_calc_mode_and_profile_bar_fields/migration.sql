-- CreateEnum
CREATE TYPE "MaterialCalcMode" AS ENUM ('SIMPLE_CUT', 'NEST_UNITS');

-- AlterTable
ALTER TABLE "quote_items" ADD COLUMN     "charge_full_last_profile_bar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "computed_profile_bar_units" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "has_partial_last_profile_bar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "material_calc_mode" "MaterialCalcMode" NOT NULL DEFAULT 'NEST_UNITS',
ADD COLUMN     "partial_profile_length" DOUBLE PRECISION,
ADD COLUMN     "profile_bar_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "scrap_notes" TEXT;
