import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Material } from "@/domain/enterprise/entities/material";
import { Prisma, Material as PrismaMaterial } from "@prisma/client";

export class PrismaMaterialMapper {
  static toPrisma(material: Material): Prisma.MaterialUncheckedCreateInput {
    return {
      id: material.id.toString(),
      name: material.name,
      createdAt: material.createdAt
    }
  }

  static toDomain(raw: PrismaMaterial): Material {
    return Material.create(
      {
        name: raw.name,
        createdAt: raw.createdAt
      },
      new UniqueEntityId(raw.id)
    )
  }
}