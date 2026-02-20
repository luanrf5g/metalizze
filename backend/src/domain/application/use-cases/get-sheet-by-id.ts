import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Sheet } from "@/domain/enterprise/entities/sheet";

interface GetSheetByIdUseCaseRequest {
  id: string
}

type GetSheetByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    sheet: Sheet
  }
>

@Injectable()
export class GetSheetByIdUseCase {
  constructor(private sheetsRepository: SheetsRepository) { }

  async execute({
    id
  }: GetSheetByIdUseCaseRequest): Promise<GetSheetByIdUseCaseResponse> {
    const sheet = await this.sheetsRepository.findById(id)

    if (!sheet) {
      return left(new ResourceNotFoundError())
    }

    return right({
      sheet
    })
  }
}