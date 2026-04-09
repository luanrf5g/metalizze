import { Either, right } from "@/core/logic/Either";
import { SetupRate } from "@/domain/enterprise/entities/setup-rate";
import { SetupRatesRepository } from "../repositories/setup-rates-repository";
import { Injectable } from "@nestjs/common";

interface FetchSetupRatesUseCaseRequest {
  includeInactive?: boolean
}

type FetchSetupRatesUseCaseResponse = Either<
  null,
  {
    setupRates: SetupRate[]
  }
>

@Injectable()
export class FetchSetupRatesUseCase {
  constructor(
    private setupRatesRepository: SetupRatesRepository
  ) { }

  async execute({
    includeInactive = false
  }: FetchSetupRatesUseCaseRequest): Promise<FetchSetupRatesUseCaseResponse> {
    const setupRates = await this.setupRatesRepository.findAll({ includeInactive })

    return right({ setupRates })
  }
}
