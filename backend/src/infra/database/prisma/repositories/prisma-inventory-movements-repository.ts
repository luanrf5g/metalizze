import { InventoryMovementsRepository } from "@/domain/application/repositories/inventoryMovementsRepository";
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
}