import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { ToggleSetupRateActiveUseCase } from "@/domain/application/use-cases/toggle-setup-rate-active";
import { BadRequestException, Controller, NotFoundException, Param, Patch } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

@Controller('/setup-rates/:id/toggle-active')
export class ToggleSetupRateActiveController {
  constructor(private toggleSetupRateActive: ToggleSetupRateActiveUseCase) { }

  @Patch()
  @Roles('ADMIN')
  async handle(
    @Param('id') setupRateId: string
  ) {
    const result = await this.toggleSetupRateActive.execute({
      setupRateId
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
