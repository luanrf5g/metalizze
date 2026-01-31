import { Either, left, right } from "@/core/logic/Either"
import { MaterialAlreadyExistsError } from "./errors/material-already-exists-error"
import { Material } from "@/domain/enterprise/entities/material"
import { MaterialsRepository } from "../repositories/materials-repository"
import { Injectable } from "@nestjs/common"

interface RegisterMaterialUseCaseRequest {
  name: string
}

type RegisterMaterialUseCaseResponse = Either<
  MaterialAlreadyExistsError,
  {
    material: Material
  }
>

@Injectable()
export class RegisterMaterialUseCase {
  constructor(private materialsRepository: MaterialsRepository) { }

  async execute({
    name
  }: RegisterMaterialUseCaseRequest): Promise<RegisterMaterialUseCaseResponse> {
    const normalizedName = this.normalizeName(name)

    const materialWithSameName = await this.materialsRepository.findByName(
      normalizedName,
    )

    if (materialWithSameName) {
      return left(new MaterialAlreadyExistsError(normalizedName))
    }

    const material = Material.create({
      name: normalizedName
    })

    await this.materialsRepository.create(material)

    return right({
      material
    })
  }

  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}