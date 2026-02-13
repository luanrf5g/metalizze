import { Material } from "@/domain/enterprise/entities/material";

export class MaterialDetailsPresenter {
  static toHTTP(material: Material) {
    return {
      id: material.id.toString(),
      name: material.name,
      slug: material.slug.value,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    }
  }
}