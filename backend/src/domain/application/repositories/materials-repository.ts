import { Material } from "@/domain/enterprise/entities/material";

export interface MaterialsRepository {
  create(material: Material): Promise<void>
  findByName(name: string): Promise<Material | null>
}