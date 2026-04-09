import { ResourceNotFoundError } from "@/domain/application/use-cases/errors/resource-not-found-error";
import { GetCuttingGasByIdUseCase } from "@/domain/application/use-cases/get-cutting-gas-by-id";
import { BadRequestException, Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { CuttingGasPresenter } from "../presenters/cutting-gas-presenter";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

@Controller('/cutting-gases/:id')
export class GetCuttingGasByIdController {
  constructor(private getCuttingGasById: GetCuttingGasByIdUseCase) { }

  @Get()
  @Roles('ADMIN')
  async handle(
    @Param('id') gasId: string
  ) {
    const result = await this.getCuttingGasById.execute({ gasId })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { cuttingGas } = result.value

    return {
      cuttingGas: CuttingGasPresenter.toHTTP(cuttingGas)
    }
  }
}