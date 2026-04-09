import { Either, right } from "@/core/logic/Either";
import { SetupRate } from "@/domain/enterprise/entities/setup-rate";
import { SetupRatesRepository } from "../repositories/setup-rates-repository";
import { Injectable } from "@nestjs/common";

interface CreateSetupRateUseCaseRequest {
  name: string
  pricePerHour: number
  isActive?: boolean
}

type CreateSetupRateUseCaseResponse = Either<
  null,
  {
    setupRate: SetupRate
  }
>

@Injectable()
export class CreateSetupRateUseCase {
  constructor(
    private setupRatesRepository: SetupRatesRepository
  ) { }

  async execute({
    name, pricePerHour, isActive = true
  }: CreateSetupRateUseCaseRequest): Promise<CreateSetupRateUseCaseResponse> {
    const setupRate = SetupRate.create({
      name: this.normalizeName(name),
      pricePerHour,
      isActive
    })

    await this.setupRatesRepository.create(setupRate)

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
