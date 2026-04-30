import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Either, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Sheet } from "@/domain/enterprise/entities/sheet";
import { SheetWithDetails } from "@/domain/enterprise/value-objects/sheet-with-details";

interface FetchSheetsUseCaseRequest {
  page: number,
  perPage?: number | null,
  materialId?: string | null,
  clientId?: string | null,
  type?: 'STANDARD' | 'SCRAP' | null,
  search?: string | null,
  materials?: string[] | null,
  thicknesses?: number[] | null,
  sortBy?: 'createdAt' | 'updatedAt' | 'quantity' | 'thickness' | null,
  sortOrder?: 'asc' | 'desc' | null,
}

type FetchSheetsUseCaseResponse = Either<
  null,
  {
    sheets: SheetWithDetails[],
    totalCount: number,
    perPage: number,
  }
>

@Injectable()
export class FetchSheetsUseCase {
  constructor(private sheetsRepository: SheetsRepository) { }

  async execute({
    page,
    perPage,
    materialId,
    clientId,
    type,
    search,
    materials,
    thicknesses,
    sortBy,
    sortOrder,
  }: FetchSheetsUseCaseRequest): Promise<FetchSheetsUseCaseResponse> {
    const resolvedPerPage = Math.min(perPage ?? 20, 100)

    const params = {
      page,
      perPage: resolvedPerPage,
      materialId,
      clientId,
      type,
      search,
      materials,
      thicknesses,
      sortBy,
      sortOrder,
    }

    const sheets = await this.sheetsRepository.findMany(params)

    const totalCount = await this.sheetsRepository.count({
      materialId,
      clientId,
      type,
      search,
      materials,
      thicknesses,
    })

    return right({
      sheets,
      totalCount,
      perPage: resolvedPerPage,
    })
  }
}