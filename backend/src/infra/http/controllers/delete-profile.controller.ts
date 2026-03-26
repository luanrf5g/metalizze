import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { DeleteProfileUseCase } from "@/domain/application/use-cases/delete-profile";
import { BadRequestException, Controller, Delete, HttpCode, NotFoundException, Param } from "@nestjs/common";

@Controller('/profiles/:id')
export class DeleteProfileController {
  constructor(private deleteProfile: DeleteProfileUseCase) { }

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') profileId: string) {
    const result = await this.deleteProfile.execute({
      profileId
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
