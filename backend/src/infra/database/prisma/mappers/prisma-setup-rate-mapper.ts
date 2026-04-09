import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { SetupRate } from "@/domain/enterprise/entities/setup-rate";
import { Prisma, SetupRate as PrismaSetupRate } from "@prisma/client";

export class PrismaSetupRateMapper {
  static toDomain(raw: PrismaSetupRate): SetupRate {
    return SetupRate.create(
      {
        name: raw.name,
        pricePerHour: raw.pricePerHour,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(setupRate: SetupRate): Prisma.SetupRateUncheckedCreateInput {
    return {
      id: setupRate.id.toString(),
      name: setupRate.name,
      pricePerHour: setupRate.pricePerHour,
      isActive: setupRate.isActive,
      createdAt: setupRate.createdAt,
      updatedAt: setupRate.updatedAt
    }
  }
}
