import { Either, left, right } from "@/core/logic/Either"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas"
import { Injectable } from "@nestjs/common"
import { CuttingGasRepository } from "../repositories/cutting-gas-repository"

interface GetCuttingGasByIdUseCaseRequest {
  gasId: string
}

type GetCuttingGasByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cuttingGas: CuttingGas
  }
>

@Injectable()
export class GetCuttingGasByIdUseCase {
  constructor(private cuttingGasRepository: CuttingGasRepository) { }

  async execute({
    gasId
  }: GetCuttingGasByIdUseCaseRequest): Promise<GetCuttingGasByIdUseCaseResponse> {
    const cuttingGas = await this.cuttingGasRepository.findById(gasId)

    if (!cuttingGas) {
      return left(new ResourceNotFoundError())
    }

    return right({ cuttingGas })
  }
}