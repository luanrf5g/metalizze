import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { PrismaMaterialsRepository } from "./prisma/repositories/prisma-materials-repository";
import { SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { PrismaSheetsRepository } from "./prisma/repositories/prisma-sheets-repository";
import { ClientsRepository } from "@/domain/application/repositories/clients-repository";
import { PrismaClientsRepository } from "./prisma/repositories/prisma-clients-repository";

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
    }
  ],
  exports: [
    PrismaService,
    MaterialsRepository,
    SheetsRepository,
    ClientsRepository
  ]
})
export class DatabaseModule { }