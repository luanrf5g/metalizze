import { Material } from "@/domain/enterprise/entities/material";

export class MaterialPresenter {
  static toHTTP(material: Material) {
    return {
      name: material.name,
      slug: material.slug.value
    }
  }
}