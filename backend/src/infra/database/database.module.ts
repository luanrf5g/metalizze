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
import { UsersRepository } from "@/domain/application/repositories/users-repository";
import { PrismaUsersRepository } from "./prisma/repositories/prisma-users-repository";
import { ProfilesRepository } from "@/domain/application/repositories/profiles-repository";
import { PrismaProfilesRepository } from "./prisma/repositories/prisma-profiles-repository";
import { CuttingGasRepository } from "@/domain/application/repositories/cutting-gas-repository";
import { PrismaCuttingGasRepository } from "./prisma/repositories/prisma-cutting-gas-repository";
import { AdditionalServicesRepository } from "@/domain/application/repositories/additional-services-repository";
import { PrismaAdditionalServicesRepository } from "./prisma/repositories/prisma-additional-services-repository";
import { SetupRatesRepository } from "@/domain/application/repositories/setup-rates-repository";
import { PrismaSetupRatesRepository } from "./prisma/repositories/prisma-setup-rates-repository";
import { QuotesRepository } from "@/domain/application/repositories/quotes-repository";
import { PrismaQuotesRepository } from "./prisma/repositories/prisma-quotes-repository";

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
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository
    },
    {
      provide: ProfilesRepository,
      useClass: PrismaProfilesRepository
    },
    {
      provide: CuttingGasRepository,
      useClass: PrismaCuttingGasRepository
    },
    {
      provide: AdditionalServicesRepository,
      useClass: PrismaAdditionalServicesRepository
    },
    {
      provide: SetupRatesRepository,
      useClass: PrismaSetupRatesRepository
    },
    {
      provide: QuotesRepository,
      useClass: PrismaQuotesRepository
    }
  ],
  exports: [
    PrismaService,
    MaterialsRepository,
    SheetsRepository,
    ClientsRepository,
    InventoryMovementsRepository,
    MetricsRepository,
    UsersRepository,
    ProfilesRepository,
    CuttingGasRepository,
    AdditionalServicesRepository,
    SetupRatesRepository,
    QuotesRepository
  ]
})
export class DatabaseModule { }