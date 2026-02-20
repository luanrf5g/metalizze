import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { InventoryMovement, InventoryMovementProps } from "@/domain/enterprise/entities/inventory-movement";
import { PrismaInventoryMovementMapper } from "@/infra/database/prisma/mappers/prisma-inventory-movement-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";

export function makeInventoryMovement(
  override: Partial<InventoryMovementProps> = {},
  id?: UniqueEntityId
) {
  const movement = InventoryMovement.create(
    {
      sheetId: new UniqueEntityId(),
      type: 'ENTRY',
      quantity: faker.number.int({ min: 1, max: 10 }),
      description: faker.lorem.sentence(),
      ...override
    },
    id
  )

  return movement
}

@Injectable()
export class InventoryMovementFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaInventoryMovement(data: Partial<InventoryMovementProps> = {}) {
    const movement = makeInventoryMovement(data)

    await this.prisma.inventoryMovement.create({
      data: PrismaInventoryMovementMapper.toPrisma(movement)
    })

    return movement
  }
}