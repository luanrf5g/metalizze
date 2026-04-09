import { Either, right } from "@/core/logic/Either";
import { AdditionalService } from "@/domain/enterprise/entities/additional-service";
import { AdditionalServicesRepository } from "../repositories/additional-services-repository";
import { Injectable } from "@nestjs/common";

interface FetchAdditionalServicesUseCaseRequest {
  includeInactive?: boolean
}

type FetchAdditionalServicesUseCaseResponse = Either<
  null,
  {
    additionalServices: AdditionalService[]
  }
>

@Injectable()
export class FetchAdditionalServicesUseCase {
  constructor(
    private additionalServicesRepository: AdditionalServicesRepository
  ) { }

  async execute({
    includeInactive = false
  }: FetchAdditionalServicesUseCaseRequest): Promise<FetchAdditionalServicesUseCaseResponse> {
    const additionalServices = await this.additionalServicesRepository.findAll({ includeInactive })

    return right({ additionalServices })
  }
}
