import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { Material } from "@/domain/enterprise/entities/material";

export class InMemoryMaterialsRepository implements MaterialsRepository {
  public items: Material[] = []

  async create(material: Material): Promise<void> {
    this.items.push(material)
  }

  async findByName(name: string): Promise<Material | null> {
    const material = this.items.find((item) => item.name === name)

    if (!material) {
      return null
    }

    return material
  }
}