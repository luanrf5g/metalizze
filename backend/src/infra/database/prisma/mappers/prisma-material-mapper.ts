import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Material } from "@/domain/enterprise/entities/material";
import { Slug } from "@/domain/enterprise/value-objects/slug";
import { Prisma, Material as PrismaMaterial } from "@prisma/client";

export class PrismaMaterialMapper {
  static toDomain(raw: PrismaMaterial): Material {
    return Material.create(
      {
        name: raw.name,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(material: Material): Prisma.MaterialUncheckedCreateInput {
    return {
      id: material.id.toString(),
      name: material.name,
      slug: material.slug.value,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }
  }
}