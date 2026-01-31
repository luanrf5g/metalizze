import { Material } from "@/domain/enterprise/entities/material";

export abstract class MaterialsRepository {
  abstract create(material: Material): Promise<void>
  abstract findByName(name: string): Promise<Material | null>
}