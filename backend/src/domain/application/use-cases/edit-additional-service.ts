import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { AdditionalService } from "@/domain/enterprise/entities/additional-service";
import { AdditionalServicesRepository } from "../repositories/additional-services-repository";
import { Injectable } from "@nestjs/common";
import { AdditionalServiceAlreadyExistsError } from "./errors/additional-service-already-exists-error";

interface EditAdditionalServiceUseCaseRequest {
  serviceId: string
  name?: string
  unitLabel?: string
  pricePerUnit?: number
  isActive?: boolean
}

type EditAdditionalServiceUseCaseResponse = Either<
  ResourceNotFoundError | AdditionalServiceAlreadyExistsError,
  {
    additionalService: AdditionalService
  }
>

@Injectable()
export class EditAdditionalServiceUseCase {
  constructor(
    private additionalServicesRepository: AdditionalServicesRepository
  ) { }

  async execute({
    serviceId, name, unitLabel, pricePerUnit, isActive
  }: EditAdditionalServiceUseCaseRequest): Promise<EditAdditionalServiceUseCaseResponse> {
    const additionalService = await this.additionalServicesRepository.findById(serviceId)

    if (!additionalService) {
      return left(new ResourceNotFoundError())
    }

    if (name !== undefined) {
      const normalizedName = this.normalizeName(name)

      const existingService = await this.additionalServicesRepository.findByTypeAndName(
        additionalService.type,
        normalizedName
      )

      if (existingService && existingService.id.toString() !== serviceId) {
        return left(new AdditionalServiceAlreadyExistsError(existingService.name))
      }

      additionalService.name = normalizedName
    }

    if (unitLabel !== undefined) additionalService.unitLabel = unitLabel.trim()
    if (pricePerUnit !== undefined) additionalService.pricePerUnit = pricePerUnit
    if (isActive !== undefined) additionalService.isActive = isActive

    await this.additionalServicesRepository.save(additionalService)

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
