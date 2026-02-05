import { Sheet } from "@/domain/enterprise/entities/sheet";

export abstract class SheetsRepository {
  abstract create(sheet: Sheet): Promise<void>
  abstract save(sheet: Sheet): Promise<void>
  abstract findByDetails(
    materialId: string,
    width: number,
    height: number,
    thickness: number,
    clientId: string | null
  ): Promise<Sheet | null>
}