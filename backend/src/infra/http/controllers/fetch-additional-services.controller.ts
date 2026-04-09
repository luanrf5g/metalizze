import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchAdditionalServicesUseCase } from "@/domain/application/use-cases/fetch-additional-services";
import { AdditionalServicePresenter } from "../presenters/additional-service-presenter";

const fetchAdditionalServicesQuerySchema = z.object({
  includeInactive: z.string().transform((value) => value === 'true').optional()
})

type FetchAdditionalServicesQuerySchema = z.infer<typeof fetchAdditionalServicesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchAdditionalServicesQuerySchema)

@Controller('/additional-services')
export class FetchAdditionalServicesController {
  constructor(private fetchAdditionalServices: FetchAdditionalServicesUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchAdditionalServicesQuerySchema) {
    const { includeInactive } = query

    const result = await this.fetchAdditionalServices.execute({
      includeInactive
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    const { additionalServices } = result.value

    return {
      additionalServices: additionalServices.map(AdditionalServicePresenter.toHTTP)
    }
  }
}
