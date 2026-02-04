import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { Material } from "@/domain/enterprise/entities/material";

export class InMemoryMaterialsRepository implements MaterialsRepository {
  public items: Material[] = []

  async create(material: Material) {
    this.items.push(material)
  }

  async findByName(name: string) {
    const material = this.items.find((item) => item.name === name)

    if (!material) return null

    return material
  }

  async findById(id: string) {
    const material = this.items.find((item) => item.id.toString() === id)

    if (!material) return null

    return material
  }
}