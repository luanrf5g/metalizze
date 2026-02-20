import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { GetMaterialByIdUseCase } from "@/domain/application/use-cases/get-material-by-id";
import { BadRequestException, Controller, Get, HttpCode, NotFoundException, Param } from "@nestjs/common";
import { MaterialDetailsPresenter } from "../presenters/material-details-presenter";

@Controller('/materials/:id')
export class GetMaterialByIdController {
  constructor(private getMaterialById: GetMaterialByIdUseCase) { }

  @Get()
  @HttpCode(200)
  async handle(@Param('id') id: string) {
    const result = await this.getMaterialById.execute({ id })

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
      material: MaterialDetailsPresenter.toHTTP(result.value.material)
    }
  }
}