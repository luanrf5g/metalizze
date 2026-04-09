import { Either, right } from "@/core/logic/Either"
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas"
import { CuttingGasRepository } from "../repositories/cutting-gas-repository"
import { Injectable } from "@nestjs/common"

interface FetchCuttingGasesUseCaseRequest {
  includeInactive?: boolean
}

type FetchCuttingGasesUseCaseResponse = Either<
  null,
  {
    cuttingGases: CuttingGas[]
  }
>

@Injectable()
export class FetchCuttingGasesUseCase {
  constructor(
    private cuttingGasRepository: CuttingGasRepository
  ) { }

  async execute({
    includeInactive = false
  }: FetchCuttingGasesUseCaseRequest): Promise<FetchCuttingGasesUseCaseResponse> {
    const cuttingGases = await this.cuttingGasRepository.findAll({ includeInactive })

    return right({ cuttingGases })
  }
}