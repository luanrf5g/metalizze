import { Either, right } from "@/core/logic/Either";
import { Material } from "@/domain/enterprise/entities/material";
import { Injectable } from "@nestjs/common";
import { MaterialsRepository } from "../repositories/materials-repository";

interface FetchMaterialsUseCaseRequest {
  page: number,
}

type FetchMaterialsUseCaseResponse = Either<
  null,
  {
    materials: Material[]
  }
>

@Injectable()
export class FetchMaterialsUseCase {
  constructor(private materialsRepository: MaterialsRepository) { }

  async execute({
    page
  }: FetchMaterialsUseCaseRequest): Promise<FetchMaterialsUseCaseResponse> {
    const materials = await this.materialsRepository.findMany({ page })

    return right({
      materials
    })
  }
}