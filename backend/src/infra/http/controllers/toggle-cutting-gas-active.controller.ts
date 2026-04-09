import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { ToggleCuttingGasActiveUseCase } from "@/domain/application/use-cases/toggle-cutting-gas-active";
import { BadRequestException, Controller, NotFoundException, Param, Patch } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

@Controller('/cutting-gases/:id/toggle-active')
export class ToggleCuttingGasActiveController {
  constructor(private toggleCuttingGasActive: ToggleCuttingGasActiveUseCase) { }

  @Patch()
  @Roles('ADMIN')
  async handle(
    @Param('id') gasId: string
  ) {
    const result = await this.toggleCuttingGasActive.execute({
      gasId
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}