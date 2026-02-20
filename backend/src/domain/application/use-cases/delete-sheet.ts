import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

interface DeleteSheetUseCaseRequest {
  sheetId: string
}

type DeleteSheetUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>

@Injectable()
export class DeleteSheetUseCase {
  constructor(private sheetsRepository: SheetsRepository) { }

  async execute({
    sheetId
  }: DeleteSheetUseCaseRequest): Promise<DeleteSheetUseCaseResponse> {
    const sheet = await this.sheetsRepository.findById(sheetId)

    if (!sheet) {
      return left(new ResourceNotFoundError())
    }

    sheet.delete()

    await this.sheetsRepository.save(sheet)

    return right({})
  }
}