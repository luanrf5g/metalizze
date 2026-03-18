import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Either, right } from "@/core/logic/Either";
import { SheetWithDetails } from "@/domain/enterprise/value-objects/sheet-with-details";

interface FetchAllSheetsUseCaseRequest {
  materialId?: string | null,
  clientId?: string | null,
  type?: 'STANDARD' | 'SCRAP' | null
}

type FetchAllSheetsUseCaseResponse = Either<
  null,
  {
    sheets: SheetWithDetails[]
  }
>

@Injectable()
export class FetchAllSheetsUseCase {
  constructor(private sheetsRepository: SheetsRepository) { }

  async execute({
    materialId,
    clientId,
    type
  }: FetchAllSheetsUseCaseRequest): Promise<FetchAllSheetsUseCaseResponse> {
    const sheets = await this.sheetsRepository.findAll({
      materialId,
      clientId,
      type
    })

    return right({
      sheets
    })
  }
}
