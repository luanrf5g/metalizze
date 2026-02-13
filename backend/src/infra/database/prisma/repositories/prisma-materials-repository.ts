import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { PrismaService } from "../prisma.service";
import { Material } from "@/domain/enterprise/entities/material";
import { PrismaMaterialMapper } from "../mappers/prisma-material-mapper";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationParams } from "@/core/repositories/pagination-params";

@Injectable()
export class PrismaMaterialsRepository implements MaterialsRepository {
  constructor(private prisma: PrismaService) { }

  async create(material: Material) {
    const data = PrismaMaterialMapper.toPrisma(material)

    await this.prisma.material.create({
      data
    })
  }

  async save(material: Material) {
    const data = PrismaMaterialMapper.toPrisma(material)

    await this.prisma.material.update({
      where: {
        id: data.id
      },
      data
    })
  }

  async delete(id: string) {
    await this.prisma.material.delete({
      where: {
        id
      }
    })
  }

  async findByName(name: string) {
    const material = await this.prisma.material.findUnique({
      where: { name }
    })

    if (!material) return null

    return PrismaMaterialMapper.toDomain(material)
  }

  async findById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id }
    })

    if (!material) return null

    return PrismaMaterialMapper.toDomain(material)
  }

  async findMany({ page }: PaginationParams) {
    const materials = await this.prisma.material.findMany({
      take: 10,
      skip: (page - 1) * 10
    })

    return materials.map(PrismaMaterialMapper.toDomain)
  }
}