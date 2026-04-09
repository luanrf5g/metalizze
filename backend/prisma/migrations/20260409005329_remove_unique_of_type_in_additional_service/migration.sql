/*
  Warnings:

  - A unique constraint covering the columns `[type,name]` on the table `additional_services` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "additional_services_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "additional_services_type_name_key" ON "additional_services"("type", "name");
