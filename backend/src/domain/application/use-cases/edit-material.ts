import { Injectable } from "@nestjs/common";
import { MaterialsRepository } from "../repositories/materials-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Material } from "@/domain/enterprise/entities/material";

interface EditMaterialUseCaseRequest {
  materialId: string,
  name?: string,
}

type EditMaterialUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    material: Material
  }
>

@Injectable()
export class EditMaterialUseCase {
  constructor(private materialsRepository: MaterialsRepository) { }

  async execute({
    materialId,
    name
  }: EditMaterialUseCaseRequest): Promise<EditMaterialUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId)

    if (!material) {
      return left(new ResourceNotFoundError())
    }

    if (name) material.name = name

    await this.materialsRepository.save(material)

    return right({
      material
    })
  }
}