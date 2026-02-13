import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";

export abstract class SheetsRepository {
  abstract create(sheet: Sheet): Promise<void>
  abstract save(sheet: Sheet): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract countByClientId(clientId: string): Promise<number>
  abstract countByMaterialId(materialId: string): Promise<number>
  abstract findById(id: string): Promise<Sheet | null>
  abstract findByDetails(
    materialId: string,
    width: number,
    height: number,
    thickness: number,
    clientId: string | null,
    type: SheetType
  ): Promise<Sheet | null>
}