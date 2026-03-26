import { BadRequestException, Controller, Get, HttpCode, NotFoundException, Param } from "@nestjs/common";
import { GetProfileByIdUseCase } from "@/domain/application/use-cases/get-profile-by-id";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { ProfileDetailsPresenter } from "../presenters/profile-details-presenter";

@Controller('/profiles/:id')
export class GetProfileByIdController {
  constructor(private getProfileById: GetProfileByIdUseCase) { }

  @Get()
  @HttpCode(200)
  async handle(@Param('id') id: string) {
    const result = await this.getProfileById.execute({ id })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      profile: ProfileDetailsPresenter.toHTTP(result.value.profile)
    }
  }
}
