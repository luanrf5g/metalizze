import { Sheet } from "@/domain/enterprise/entities/sheet";

export class SheetPresenter {
  static toHTTP(sheet: Sheet) {
    return {
      id: sheet.id.toString(),
      sku: sheet.sku,
      materialId: sheet.materialId.toString(),
      clientId: sheet.clientId ? sheet.clientId.toString() : null,
      quantity: sheet.quantity,
      type: sheet.type
    }
  }
}