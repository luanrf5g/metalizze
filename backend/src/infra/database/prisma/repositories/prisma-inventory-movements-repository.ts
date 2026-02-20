import { FindManyInventoryMovements, InventoryMovementsRepository } from "@/domain/application/repositories/inventory-movements-repository";
import { PrismaInventoryMovementMapper } from "../mappers/prisma-inventory-movement-mapper";
import { PrismaService } from "../prisma.service";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaInventoryMovementsRepository implements InventoryMovementsRepository {
  constructor(private prisma: PrismaService) { }

  async create(inventoryMovement: InventoryMovement) {
    const data = PrismaInventoryMovementMapper.toPrisma(inventoryMovement)

    await this.prisma.inventoryMovement.create({
      data
    })
  }

  async findMany({ page, sheetId }: FindManyInventoryMovements) {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        sheetId: sheetId ?? undefined
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return movements.map(PrismaInventoryMovementMapper.toDomain)
  }
}