import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CuttingGas, CuttingGasProps } from "@/domain/enterprise/entities/cutting-gas";
import { PrismaCuttingGasMapper } from "@/infra/database/prisma/mappers/prisma-cutting-gas-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";

export function makeCuttingGas(
  override: Partial<CuttingGasProps> = {},
  id?: UniqueEntityId
) {
  const name = override.name ?? faker.commerce.productName()
  const pricePerHour = override.pricePerHour ?? faker.commerce.price()
  const isActive = override.isActive ?? true

  const cuttingGas = CuttingGas.create(
    {
      name,
      pricePerHour: Number(pricePerHour),
      isActive,
      ...override
    },
    id
  )

  return cuttingGas
}

@Injectable()
export class CuttingGasFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaCuttingGas(data: Partial<CuttingGasProps> = {}): Promise<CuttingGas> {
    const cuttingGas = makeCuttingGas(data)

    await this.prisma.cuttingGas.create({
      data: PrismaCuttingGasMapper.toPrisma(cuttingGas)
    })

    return cuttingGas
  }
}