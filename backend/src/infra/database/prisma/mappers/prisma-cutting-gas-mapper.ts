import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";
import { Prisma, CuttingGas as PrismaCuttingGas } from "@prisma/client";

export class PrismaCuttingGasMapper {
  static toDomain(raw: PrismaCuttingGas): CuttingGas {
    return CuttingGas.create(
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

  static toPrisma(cuttingGas: CuttingGas): Prisma.CuttingGasUncheckedCreateInput {
    return {
      id: cuttingGas.id.toString(),
      name: cuttingGas.name,
      pricePerHour: cuttingGas.pricePerHour,
      isActive: cuttingGas.isActive,
      createdAt: cuttingGas.createdAt,
      updatedAt: cuttingGas.updatedAt
    }
  }
}