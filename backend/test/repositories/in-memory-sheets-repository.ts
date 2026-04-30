import { FindManySheetsParams, SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";

export class InMemorySheetsRepository implements SheetsRepository {
  public items: Sheet[] = []

  async create(sheet: Sheet) {
    this.items.push(sheet)
  }

  async save(sheet: Sheet) {
    const itemIndex = this.items.findIndex((item) => item.id === sheet.id)

    this.items[itemIndex] = sheet
  }

  async delete(id: string) {
    const filteredItems = this.items.filter((item) => item.id.toString() !== id)

    this.items = filteredItems
  }

  async countByClientId(clientId: string) {
    return this.items.filter((item) => item.clientId?.toString() === clientId).length
  }

  async countByMaterialId(materialId: string) {
    return this.items.filter((item) => item.materialId.toString() === materialId).length
  }

  async findById(id: string) {
    const sheet = this.items.find((item) => item.id.toString() === id)

    if (!sheet) return null

    return sheet
  }

  async findByDetails(
    materialId: string,
    width: number,
    height: number,
    thickness: number,
    clientId: string | null,
    type: SheetType
  ) {
    const sheet = this.items.find((item) => {
      const itemClientId = item.clientId ? item.clientId.toString() : null

      return (
        item.materialId.toString() === materialId &&
        item.width === width &&
        item.height === height &&
        item.thickness === thickness &&
        itemClientId === clientId &&
        item.type === type
      )
    })

    if (!sheet) return null

    return sheet
  }

  private filterItems({ materialId, clientId, type, thicknesses }: Omit<FindManySheetsParams, 'page'>): Sheet[] {
    return this.items.filter((item) => {
      if (materialId && item.materialId.toString() !== materialId) return false
      if (clientId && item.clientId?.toString() !== clientId) return false
      if (type && item.type !== type) return false
      if (thicknesses && thicknesses.length > 0 && !thicknesses.includes(item.thickness)) return false
      if (item.deletedAt) return false
      return true
    })
  }

  async findMany({ page, perPage, materialId, clientId, type, thicknesses }: FindManySheetsParams) {
    const pageSize = Math.min(perPage ?? 20, 100)

    const sheets = this.filterItems({ materialId, clientId, type, thicknesses })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * pageSize, page * pageSize)

    return sheets
  }

  async findAll({ materialId, clientId, type }: Omit<FindManySheetsParams, 'page'>) {
    const sheets = this.filterItems({ materialId, clientId, type })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return sheets
  }

  async count({ materialId, clientId, type, thicknesses }: Omit<FindManySheetsParams, 'page'>) {
    const total = this.filterItems({ materialId, clientId, type, thicknesses }).length
    return total
  }
}