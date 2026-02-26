import { PaginationParams } from "@/core/repositories/pagination-params";
import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";
import { SheetWithDetails } from "@/domain/enterprise/value-objects/sheet-with-details";

export interface FindManySheetsParams extends PaginationParams {
  materialId?: string | null,
  clientId?: string | null,
  type?: 'STANDARD' | 'SCRAP' | null
}

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
  abstract findMany(params: FindManySheetsParams): Promise<SheetWithDetails[]>
}