import { SheetWithDetails } from "@/domain/enterprise/value-objects/sheet-with-details";

export class SheetWithDetailsPresenter {
  static toHTTP(sheet: SheetWithDetails) {
    return {
      id: sheet.id.toString(),
      sku: sheet.sku,
      materialId: sheet.materialId.toString(),
      quantity: sheet.quantity,
      type: sheet.type,
      createdAt: sheet.createdAt,
      client: sheet.client ? {
        id: sheet.client.id.toString(),
        name: sheet.client.name,
        document: sheet.client.document
      } : null
    }
  }
}