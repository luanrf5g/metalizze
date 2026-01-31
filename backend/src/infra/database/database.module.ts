import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { PrismaMaterialsRepository } from "./prisma/repositories/prisma-materials-repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: MaterialsRepository,
      useClass: PrismaMaterialsRepository
    }
  ],
  exports: [
    PrismaService,
    MaterialsRepository
  ]
})
export class DatabaseModule { }