import { SetupRatesRepository } from "@/domain/application/repositories/setup-rates-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { SetupRate } from "@/domain/enterprise/entities/setup-rate";
import { PrismaSetupRateMapper } from "../mappers/prisma-setup-rate-mapper";

@Injectable()
export class PrismaSetupRatesRepository implements SetupRatesRepository {
  constructor(private prisma: PrismaService) { }

  async create(setupRate: SetupRate) {
    const data = PrismaSetupRateMapper.toPrisma(setupRate)

    await this.prisma.setupRate.create({
      data
    })
  }

  async findById(id: string) {
    const setupRate = await this.prisma.setupRate.findUnique({
      where: { id }
    })

    if (!setupRate) return null

    return PrismaSetupRateMapper.toDomain(setupRate)
  }

  async findAll({ includeInactive = false }: { includeInactive?: boolean } = {}) {
    const setupRates = await this.prisma.setupRate.findMany({
      where: {
        isActive: includeInactive ? undefined : true
      }
    })

    return setupRates.map(PrismaSetupRateMapper.toDomain)
  }

  async save(setupRate: SetupRate) {
    const data = PrismaSetupRateMapper.toPrisma(setupRate)

    await this.prisma.setupRate.update({
      where: { id: data.id },
      data
    })
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.prisma.setupRate.update({
      where: { id },
      data: { isActive }
    })
  }
}
