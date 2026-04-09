import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { SetupRate } from "@/domain/enterprise/entities/setup-rate";
import { SetupRatesRepository } from "../repositories/setup-rates-repository";
import { Injectable } from "@nestjs/common";

interface EditSetupRateUseCaseRequest {
  setupRateId: string
  name?: string
  pricePerHour?: number
  isActive?: boolean
}

type EditSetupRateUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    setupRate: SetupRate
  }
>

@Injectable()
export class EditSetupRateUseCase {
  constructor(
    private setupRatesRepository: SetupRatesRepository
  ) { }

  async execute({
    setupRateId, name, pricePerHour, isActive
  }: EditSetupRateUseCaseRequest): Promise<EditSetupRateUseCaseResponse> {
    const setupRate = await this.setupRatesRepository.findById(setupRateId)

    if (!setupRate) {
      return left(new ResourceNotFoundError())
    }

    if (name !== undefined) setupRate.name = this.normalizeName(name)
    if (pricePerHour !== undefined) setupRate.pricePerHour = pricePerHour
    if (isActive !== undefined) setupRate.isActive = isActive

    await this.setupRatesRepository.save(setupRate)

    return right({ setupRate })
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
