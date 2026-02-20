import { Sheet } from "@/domain/enterprise/entities/sheet";

export class SheetDetailsPresenter {
  static toHTTP(sheet: Sheet) {
    return {
      id: sheet.id.toString(),
      sku: sheet.sku,
      clientId: sheet.clientId ? sheet.clientId.toString() : null,
      materialId: sheet.materialId.toString(),
      thickness: sheet.thickness,
      width: sheet.width,
      height: sheet.height,
      quantity: sheet.quantity,
      type: sheet.type,
      created: sheet.createdAt
    }
  }
}