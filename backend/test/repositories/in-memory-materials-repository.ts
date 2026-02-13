import { PaginationParams } from "@/core/repositories/pagination-params";
import { MaterialsRepository } from "@/domain/application/repositories/materials-repository";
import { Material } from "@/domain/enterprise/entities/material";

export class InMemoryMaterialsRepository implements MaterialsRepository {
  public items: Material[] = []

  async create(material: Material) {
    this.items.push(material)
  }

  async save(material: Material) {
    const itemIndex = this.items.findIndex((item) => item.id === material.id)

    this.items[itemIndex] = material
  }

  async delete(id: string) {
    const filteredItems = this.items.filter((item) => item.id.toString() !== id)

    this.items = filteredItems
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

  async findMany({ page }: PaginationParams) {
    const materials = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 10, page * 10)

    return materials
  }
}