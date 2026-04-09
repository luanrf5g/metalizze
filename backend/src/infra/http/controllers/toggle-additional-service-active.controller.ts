import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { ToggleAdditionalServiceActiveUseCase } from "@/domain/application/use-cases/toggle-additional-service-active";
import { BadRequestException, Controller, NotFoundException, Param, Patch } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

@Controller('/additional-services/:id/toggle-active')
export class ToggleAdditionalServiceActiveController {
  constructor(private toggleAdditionalServiceActive: ToggleAdditionalServiceActiveUseCase) { }

  @Patch()
  @Roles('ADMIN')
  async handle(
    @Param('id') serviceId: string
  ) {
    const result = await this.toggleAdditionalServiceActive.execute({
      serviceId
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
