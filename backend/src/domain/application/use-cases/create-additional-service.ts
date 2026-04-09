import { Either, left, right } from "@/core/logic/Either";
import { AdditionalServiceAlreadyExistsError } from "./errors/additional-service-already-exists-error";
import { AdditionalService, AdditionalServiceType } from "@/domain/enterprise/entities/additional-service";
import { Injectable } from "@nestjs/common";
import { AdditionalServicesRepository } from "../repositories/additional-services-repository";

interface CreateAdditionalServiceUseCaseRequest {
  type: AdditionalServiceType
  name: string
  unitLabel: string
  pricePerUnit: number
  isActive?: boolean
}

type CreateAdditionalServiceUseCaseResponse = Either<
  AdditionalServiceAlreadyExistsError,
  {
    additionalService: AdditionalService
  }
>

@Injectable()
export class CreateAdditionalServiceUseCase {
  constructor(
    private additionalServicesRepository: AdditionalServicesRepository
  ) { }

  async execute({
    type, name, unitLabel, pricePerUnit, isActive = true
  }: CreateAdditionalServiceUseCaseRequest): Promise<CreateAdditionalServiceUseCaseResponse> {
    const normalizedName = this.normalizeName(name)

    const existingService = await this.additionalServicesRepository.findByTypeAndName(type, normalizedName)

    if (existingService) {
      return left(new AdditionalServiceAlreadyExistsError(existingService.name))
    }

    const additionalService = AdditionalService.create({
      type,
      name: normalizedName,
      unitLabel: unitLabel.trim().toLowerCase(),
      pricePerUnit,
      isActive
    })

    await this.additionalServicesRepository.create(additionalService)

    return right({ additionalService })
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
