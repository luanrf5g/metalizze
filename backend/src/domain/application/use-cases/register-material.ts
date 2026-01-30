import { Either, left, right } from "@/core/logic/Either"
import { MaterialAlreadyExistsError } from "./errors/material-already-exists-error"
import { Material } from "@/domain/enterprise/entities/material"
import { MaterialsRepository } from "../repositories/materials-repository"

interface RegisterMaterialUseCaseRequest {
  name: string
}

type RegisterMaterialUseCaseResponse = Either<
  MaterialAlreadyExistsError,
  {
    material: Material
  }
>

export class RegisterMaterialUseCase {
  constructor(private materialsRepository: MaterialsRepository) { }

  async execute({
    name
  }: RegisterMaterialUseCaseRequest): Promise<RegisterMaterialUseCaseResponse> {
    const materialWithSameName = await this.materialsRepository.findByName(name)

    if (materialWithSameName) {
      return left(new MaterialAlreadyExistsError(name))
    }

    const material = Material.create({
      name
    })

    await this.materialsRepository.create(material)

    return right({
      material
    })
  }
}