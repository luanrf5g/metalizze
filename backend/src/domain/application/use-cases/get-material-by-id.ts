import { Injectable } from "@nestjs/common";
import { MaterialsRepository } from "../repositories/materials-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Material } from "@/domain/enterprise/entities/material";

interface GetMaterialByIdUseCaseRequest {
  id: string
}

type GetMaterialByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    material: Material
  }
>

@Injectable()
export class GetMaterialByIdUseCase {
  constructor(private materialsRepository: MaterialsRepository) { }

  async execute({
    id
  }: GetMaterialByIdUseCaseRequest): Promise<GetMaterialByIdUseCaseResponse> {
    const material = await this.materialsRepository.findById(id)

    if (!material) {
      return left(new ResourceNotFoundError())
    }

    return right({
      material
    })
  }
}