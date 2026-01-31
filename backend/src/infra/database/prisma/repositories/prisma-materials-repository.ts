import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { PrismaService } from "../prisma.service";
import { Material } from "@/domain/enterprise/entities/material";
import { PrismaMaterialMapper } from "../mappers/prisma-material-mapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaMaterialsRepository implements MaterialsRepository {
  constructor(private prisma: PrismaService) { }

  async create(material: Material): Promise<void> {
    const data = PrismaMaterialMapper.toPrisma(material)

    await this.prisma.material.create({
      data
    })
  }

  async findByName(name: string): Promise<Material | null> {
    const material = await this.prisma.material.findUnique({
      where: {
        name
      }
    })

    if(!material) {
      return null
    }

    return PrismaMaterialMapper.toDomain(material)
  }
}