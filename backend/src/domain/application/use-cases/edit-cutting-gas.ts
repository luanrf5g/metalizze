import { Either, left, right } from "@/core/logic/Either"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas"
import { CuttingGasAlreadyExistsError } from "./errors/cutting-gas-already-exists-error"
import { CuttingGasRepository } from "../repositories/cutting-gas-repository"
import { Injectable } from "@nestjs/common"

interface EditCuttingGasUseCaseRequest {
  gasId: string,
  name?: string,
  pricePerHour?: number,
  isActive?: boolean
}

type EditCuttingGasUseCaseResponse = Either<
  ResourceNotFoundError | CuttingGasAlreadyExistsError,
  {
    cuttingGas: CuttingGas
  }
>

@Injectable()
export class EditCuttingGasUseCase {
  constructor(
    private cuttingGasRepository: CuttingGasRepository
  ) { }

  async execute({
    gasId, name, pricePerHour, isActive
  }: EditCuttingGasUseCaseRequest): Promise<EditCuttingGasUseCaseResponse> {
    const cuttingGas = await this.cuttingGasRepository.findById(gasId)

    if (!cuttingGas) {
      return left(new ResourceNotFoundError())
    }

    if (name) {
      const normalizedName = this.normalizeName(name)

      const gasWithSameName = await this.cuttingGasRepository.findByName(normalizedName)

      if (gasWithSameName && gasWithSameName.id.toString() !== gasId) {
        return left(new CuttingGasAlreadyExistsError(normalizedName))
      }

      cuttingGas.name = normalizedName
    }

    if (pricePerHour !== undefined) cuttingGas.pricePerHour = pricePerHour
    if (isActive !== undefined) cuttingGas.isActive = isActive

    await this.cuttingGasRepository.save(cuttingGas)

    return right({
      cuttingGas
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