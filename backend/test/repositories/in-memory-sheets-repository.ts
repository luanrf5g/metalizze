import { SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { Sheet } from "@/domain/enterprise/entities/sheet";

export class InMemorySheetsRepository implements SheetsRepository {
  public items: Sheet[] = []

  async create(sheet: Sheet) {
    this.items.push(sheet)
  }

  async save(sheet: Sheet) {
    const itemIndex = this.items.findIndex((item) => item.id === sheet.id)

    this.items[itemIndex] = sheet
  }

  async findByDetails(
    materialId: string,
    width: number,
    height: number,
    thickness: number,
    owner: string | null
  ) {
    const sheet = this.items.find((item) => {
      return (
        item.materialId.toString() === materialId &&
        item.width === width &&
        item.height === height &&
        item.thickness === thickness &&
        item.owner === owner
      )
    })

    if (!sheet) return null

    return sheet
  }
}