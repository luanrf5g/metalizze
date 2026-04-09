-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuoteItemKind" AS ENUM ('SHEET', 'PROFILE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'AMOUNT');

-- CreateEnum
CREATE TYPE "AdditionalServiceType" AS ENUM ('BENDING', 'THREADING', 'WELDING');

-- CreateTable
CREATE TABLE "cutting_gases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_per_hour" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "cutting_gases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_services" (
    "id" TEXT NOT NULL,
    "type" "AdditionalServiceType" NOT NULL,
    "name" TEXT NOT NULL,
    "unit_label" TEXT NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setup_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_per_hour" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "setup_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "client_id" TEXT,
    "notes" TEXT,
    "valid_until" TIMESTAMP(3),
    "total_material" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cutting" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_setup" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_services" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal_quote" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_type" "DiscountType",
    "discount_value" DOUBLE PRECISION,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_quote" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "part_number" INTEGER NOT NULL,
    "item_kind" "QuoteItemKind" NOT NULL DEFAULT 'SHEET',
    "sheet_id" TEXT,
    "profile_id" TEXT,
    "material_name" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "sheet_width" DOUBLE PRECISION,
    "sheet_height" DOUBLE PRECISION,
    "profile_type" "ProfileType",
    "profile_length" DOUBLE PRECISION,
    "profile_dimensions" TEXT,
    "base_material_price" DOUBLE PRECISION NOT NULL,
    "is_manual_price" BOOLEAN NOT NULL DEFAULT false,
    "is_full_material" BOOLEAN NOT NULL DEFAULT false,
    "cutting_gas_id" TEXT NOT NULL,
    "cutting_time_minutes" DOUBLE PRECISION NOT NULL,
    "cut_width" DOUBLE PRECISION,
    "cut_height" DOUBLE PRECISION,
    "cut_length" DOUBLE PRECISION,
    "usage_percentage" DOUBLE PRECISION,
    "setup_rate_id" TEXT,
    "setup_time_minutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "setup_price_per_hour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finishing_description" TEXT,
    "finishing_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "material_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cutting_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "setup_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "services_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal_item_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_type" "DiscountType",
    "discount_value" DOUBLE PRECISION,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_item_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_item_services" (
    "id" TEXT NOT NULL,
    "quote_item_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "quote_item_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cutting_gases_name_key" ON "cutting_gases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "additional_services_type_key" ON "additional_services"("type");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_code_key" ON "quotes"("code");

-- CreateIndex
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items"("quote_id");

-- CreateIndex
CREATE INDEX "quote_items_sheet_id_idx" ON "quote_items"("sheet_id");

-- CreateIndex
CREATE INDEX "quote_items_profile_id_idx" ON "quote_items"("profile_id");

-- CreateIndex
CREATE INDEX "quote_items_cutting_gas_id_idx" ON "quote_items"("cutting_gas_id");

-- CreateIndex
CREATE INDEX "quote_item_services_quote_item_id_idx" ON "quote_item_services"("quote_item_id");

-- CreateIndex
CREATE INDEX "quote_item_services_service_id_idx" ON "quote_item_services"("service_id");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_cutting_gas_id_fkey" FOREIGN KEY ("cutting_gas_id") REFERENCES "cutting_gases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_setup_rate_id_fkey" FOREIGN KEY ("setup_rate_id") REFERENCES "setup_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_item_services" ADD CONSTRAINT "quote_item_services_quote_item_id_fkey" FOREIGN KEY ("quote_item_id") REFERENCES "quote_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_item_services" ADD CONSTRAINT "quote_item_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "additional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
