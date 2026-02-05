/*
  Warnings:

  - You are about to drop the column `owner` on the `sheets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[material_id,width,height,thickness,client_id]` on the table `sheets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "sheets_material_id_width_height_thickness_owner_key";

-- AlterTable
ALTER TABLE "sheets" DROP COLUMN "owner",
ADD COLUMN     "client_id" TEXT;

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_document_key" ON "clients"("document");

-- CreateIndex
CREATE UNIQUE INDEX "sheets_material_id_width_height_thickness_client_id_key" ON "sheets"("material_id", "width", "height", "thickness", "client_id");

-- AddForeignKey
ALTER TABLE "sheets" ADD CONSTRAINT "sheets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
