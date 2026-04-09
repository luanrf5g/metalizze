import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { AdditionalService, AdditionalServiceType } from "@/domain/enterprise/entities/additional-service";
import { Prisma, AdditionalService as PrismaAdditionalService } from "@prisma/client";

export class PrismaAdditionalServiceMapper {
  static toDomain(raw: PrismaAdditionalService): AdditionalService {
    return AdditionalService.create(
      {
        type: raw.type as AdditionalServiceType,
        name: raw.name,
        unitLabel: raw.unitLabel,
        pricePerUnit: raw.pricePerUnit,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(service: AdditionalService): Prisma.AdditionalServiceUncheckedCreateInput {
    return {
      id: service.id.toString(),
      type: service.type,
      name: service.name,
      unitLabel: service.unitLabel,
      pricePerUnit: service.pricePerUnit,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
  }
}
