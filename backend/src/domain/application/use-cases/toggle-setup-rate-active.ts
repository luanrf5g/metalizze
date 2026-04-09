import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { SetupRatesRepository } from "../repositories/setup-rates-repository";
import { Injectable } from "@nestjs/common";

interface ToggleSetupRateActiveUseCaseRequest {
  setupRateId: string
}

type ToggleSetupRateActiveUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>

@Injectable()
export class ToggleSetupRateActiveUseCase {
  constructor(
    private setupRatesRepository: SetupRatesRepository
  ) { }

  async execute({
    setupRateId
  }: ToggleSetupRateActiveUseCaseRequest): Promise<ToggleSetupRateActiveUseCaseResponse> {
    const setupRate = await this.setupRatesRepository.findById(setupRateId)

    if (!setupRate) {
      return left(new ResourceNotFoundError())
    }

    await this.setupRatesRepository.toggleActive(setupRateId, !setupRate.isActive)

    return right({})
  }
}
