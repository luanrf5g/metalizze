import { Either, left, right } from "@/core/logic/Either"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { CuttingGasRepository } from "../repositories/cutting-gas-repository"
import { Injectable } from "@nestjs/common"

interface ToggleCuttingGasActiveUseCaseRequest {
  gasId: string
}

type ToggleCuttingGasActiveUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>

@Injectable()
export class ToggleCuttingGasActiveUseCase {
  constructor(
    private cuttingGasRepository: CuttingGasRepository
  ) { }

  async execute({
    gasId
  }: ToggleCuttingGasActiveUseCaseRequest): Promise<ToggleCuttingGasActiveUseCaseResponse> {
    const cuttingGas = await this.cuttingGasRepository.findById(gasId)

    if (!cuttingGas) {
      return left(new ResourceNotFoundError())
    }

    cuttingGas.isActive = !cuttingGas.isActive

    await this.cuttingGasRepository.toggleActive(cuttingGas.id.toString(), cuttingGas.isActive)

    return right({})
  }
}