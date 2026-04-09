import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchSetupRatesUseCase } from "@/domain/application/use-cases/fetch-setup-rates";
import { SetupRatePresenter } from "../presenters/setup-rate-presenter";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const fetchSetupRatesQuerySchema = z.object({
  includeInactive: z.string().transform((value) => value === 'true').optional()
})

type FetchSetupRatesQuerySchema = z.infer<typeof fetchSetupRatesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchSetupRatesQuerySchema)

@Controller('/setup-rates')
export class FetchSetupRatesController {
  constructor(private fetchSetupRates: FetchSetupRatesUseCase) { }

  @Get()
  @Roles('ADMIN')
  async handle(@Query(queryValidationPipe) query: FetchSetupRatesQuerySchema) {
    const { includeInactive } = query

    const result = await this.fetchSetupRates.execute({
      includeInactive
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    const { setupRates } = result.value

    return {
      setupRates: setupRates.map(SetupRatePresenter.toHTTP)
    }
  }
}
