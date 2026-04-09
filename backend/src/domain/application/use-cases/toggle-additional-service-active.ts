import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { AdditionalServicesRepository } from "../repositories/additional-services-repository";
import { Injectable } from "@nestjs/common";

interface ToggleAdditionalServiceActiveUseCaseRequest {
  serviceId: string
}

type ToggleAdditionalServiceActiveUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>

@Injectable()
export class ToggleAdditionalServiceActiveUseCase {
  constructor(
    private additionalServicesRepository: AdditionalServicesRepository
  ) { }

  async execute({
    serviceId
  }: ToggleAdditionalServiceActiveUseCaseRequest): Promise<ToggleAdditionalServiceActiveUseCaseResponse> {
    const additionalService = await this.additionalServicesRepository.findById(serviceId)

    if (!additionalService) {
      return left(new ResourceNotFoundError())
    }

    await this.additionalServicesRepository.toggleActive(
      serviceId,
      !additionalService.isActive
    )

    return right({})
  }
}
