/*
  Warnings:

  - A unique constraint covering the columns `[material_id,width,height,thickness,client_id,type]` on the table `sheets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SheetType" AS ENUM ('STANDARD', 'SCRAP');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRY', 'EXIT');

-- DropIndex
DROP INDEX "sheets_material_id_width_height_thickness_client_id_key";

-- AlterTable
ALTER TABLE "sheets" ADD COLUMN     "type" "SheetType" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sheet_id" TEXT NOT NULL,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sheets_material_id_width_height_thickness_client_id_type_key" ON "sheets"("material_id", "width", "height", "thickness", "client_id", "type");

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
