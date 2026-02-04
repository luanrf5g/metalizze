import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Material, MaterialProps } from "@/domain/enterprise/entities/material";
import { Slug } from "@/domain/enterprise/value-objects/slug";
import { PrismaMaterialMapper } from "@/infra/database/prisma/mappers/prisma-material-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from '@faker-js/faker'
import { Injectable } from "@nestjs/common";

export function makeMaterial(
  override: Partial<MaterialProps> = {},
  id?: UniqueEntityId
) {
  const name = override.name ?? faker.commerce.productMaterial()

  const slug = override.slug ?? Slug.createFromText(name)

  const material = Material.create(
    {
      name,
      slug,
      ...override
    },
    id
  )

  return material
}

@Injectable()
export class MaterialFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaMaterial(data: Partial<MaterialProps> = {}): Promise<Material> {
    const material = makeMaterial(data)

    await this.prisma.material.create({
      data: PrismaMaterialMapper.toPrisma(material)
    })

    return material
  }
}