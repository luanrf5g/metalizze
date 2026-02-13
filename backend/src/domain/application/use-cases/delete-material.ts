import { Injectable } from "@nestjs/common";
import { MaterialsRepository } from "../repositories/materials-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { MaterialHasSheetsError } from "./errors/material-has-sheets-error";
import { SheetsRepository } from "../repositories/sheets-repository";

interface DeleteMaterialUseCaseRequest {
  id: string
}

type DeleteMaterialUseCaseResponse = Either<
  ResourceNotFoundError | MaterialHasSheetsError,
  object
>

@Injectable()
export class DeleteMaterialUseCase {
  constructor(
    private materialsRepository: MaterialsRepository,
    private sheetsRepository: SheetsRepository
  ) { }

  async execute({
    id
  }: DeleteMaterialUseCaseRequest): Promise<DeleteMaterialUseCaseResponse> {
    const material = await this.materialsRepository.findById(id)

    if (!material) {
      return left(new ResourceNotFoundError())
    }

    const countSheets = await this.sheetsRepository.countByMaterialId(material.id.toString())

    if (countSheets > 0) {
      return left(new MaterialHasSheetsError())
    }

    await this.materialsRepository.delete(id)

    return right({})
  }
}