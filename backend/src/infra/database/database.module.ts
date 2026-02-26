import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { PrismaMaterialsRepository } from "./prisma/repositories/prisma-materials-repository";
import { SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { PrismaSheetsRepository } from "./prisma/repositories/prisma-sheets-repository";
import { ClientsRepository } from "@/domain/application/repositories/clients-repository";
import { PrismaClientsRepository } from "./prisma/repositories/prisma-clients-repository";
import { InventoryMovementsRepository } from "@/domain/application/repositories/inventory-movements-repository";
import { PrismaInventoryMovementsRepository } from "./prisma/repositories/prisma-inventory-movements-repository";
import { MetricsRepository } from "@/domain/application/repositories/metrics-repository";
import { PrismaMetricsRepository } from "./prisma/repositories/prisma-metrics-repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: MaterialsRepository,
      useClass: PrismaMaterialsRepository
    },
    {
      provide: SheetsRepository,
      useClass: PrismaSheetsRepository
    },
    {
      provide: ClientsRepository,
      useClass: PrismaClientsRepository
    },
    {
      provide: InventoryMovementsRepository,
      useClass: PrismaInventoryMovementsRepository
    },
    {
      provide: MetricsRepository,
      useClass: PrismaMetricsRepository
    }
  ],
  exports: [
    PrismaService,
    MaterialsRepository,
    SheetsRepository,
    ClientsRepository,
    InventoryMovementsRepository,
    MetricsRepository
  ]
})
export class DatabaseModule { }