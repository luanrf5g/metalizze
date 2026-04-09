import { AdditionalServicesRepository } from "@/domain/application/repositories/additional-services-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AdditionalService, AdditionalServiceType } from "@/domain/enterprise/entities/additional-service";
import { PrismaAdditionalServiceMapper } from "../mappers/prisma-additional-service-mapper";

@Injectable()
export class PrismaAdditionalServicesRepository implements AdditionalServicesRepository {
  constructor(private prisma: PrismaService) { }

  async create(service: AdditionalService) {
    const data = PrismaAdditionalServiceMapper.toPrisma(service)

    await this.prisma.additionalService.create({
      data
    })
  }

  async findById(id: string) {
    const service = await this.prisma.additionalService.findUnique({
      where: { id }
    })

    if (!service) return null

    return PrismaAdditionalServiceMapper.toDomain(service)
  }

  async findByTypeAndName(type: AdditionalServiceType, name: string) {
    const service = await this.prisma.additionalService.findFirst({
      where: {
        type,
        name
      }
    })

    if (!service) return null

    return PrismaAdditionalServiceMapper.toDomain(service)
  }

  async findAll({ includeInactive = false }: { includeInactive?: boolean } = {}) {
    const services = await this.prisma.additionalService.findMany({
      where: {
        isActive: includeInactive ? undefined : true
      }
    })

    return services.map(PrismaAdditionalServiceMapper.toDomain)
  }

  async save(service: AdditionalService) {
    const data = PrismaAdditionalServiceMapper.toPrisma(service)

    await this.prisma.additionalService.update({
      where: { id: data.id },
      data
    })
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.prisma.additionalService.update({
      where: { id },
      data: { isActive }
    })
  }
}
