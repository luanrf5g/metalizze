-- AlterTable
ALTER TABLE "quote_items" ADD COLUMN     "charge_full_last_sheet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "computed_sheet_units" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "has_partial_last_sheet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_material_provided_by_client" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partial_sheet_height" DOUBLE PRECISION,
ADD COLUMN     "partial_sheet_width" DOUBLE PRECISION,
ADD COLUMN     "sheet_count" INTEGER NOT NULL DEFAULT 1;
