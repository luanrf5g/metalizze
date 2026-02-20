import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Either, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Sheet } from "@/domain/enterprise/entities/sheet";

interface FetchSheetsUseCaseRequest {
  page: number,
  materialId?: string | null,
  clientId?: string | null,
  type?: 'STANDARD' | 'SCRAP' | null
}

type FetchSheetsUseCaseResponse = Either<
  null,
  {
    sheets: Sheet[]
  }
>

@Injectable()
export class FetchSheetsUseCase {
  constructor(private sheetsRepository: SheetsRepository) { }

  async execute({
    page,
    materialId,
    clientId,
    type
  }: FetchSheetsUseCaseRequest): Promise<FetchSheetsUseCaseResponse> {
    const sheets = await this.sheetsRepository.findMany({
      page,
      materialId,
      clientId,
      type
    })

    return right({
      sheets
    })
  }
}