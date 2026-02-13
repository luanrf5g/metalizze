import { PaginationParams } from "@/core/repositories/pagination-params";
import { Material } from "@/domain/enterprise/entities/material";

export abstract class MaterialsRepository {
  abstract create(material: Material): Promise<void>
  abstract save(material: Material): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findByName(name: string): Promise<Material | null>
  abstract findById(id: string): Promise<Material | null>
  abstract findMany(params: PaginationParams): Promise<Material[]>
}