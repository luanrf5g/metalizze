import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchCuttingGasesUseCase } from "@/domain/application/use-cases/fetch-cutting-gases";
import { CuttingGasPresenter } from "../presenters/cutting-gas-presenter";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const fetchCuttingGasesQuerySchema = z.object({
  includeInactive: z.string().transform((value) => value === 'true').optional()
})

type FetchCuttingGasesQuerySchema = z.infer<typeof fetchCuttingGasesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchCuttingGasesQuerySchema)

@Controller('/cutting-gases')
export class FetchCuttingGasesController {
  constructor(private fetchCuttingGases: FetchCuttingGasesUseCase) { }

  @Get()
  @Roles('ADMIN')
  async handle(@Query(queryValidationPipe) query: FetchCuttingGasesQuerySchema) {
    const { includeInactive } = query

    const result = await this.fetchCuttingGases.execute({
      includeInactive
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    const { cuttingGases } = result.value

    return {
      cuttingGases: cuttingGases.map(CuttingGasPresenter.toHTTP)
    }
  }
}

