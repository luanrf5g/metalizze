import { BadRequestException, Controller, Get, HttpCode, NotFoundException, Param } from "@nestjs/common";
import { GetSheetByIdUseCase } from "@/domain/application/use-cases/get-sheet-by-id";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { SheetDetailsPresenter } from "../presenters/sheet-details-presenter";

@Controller('/sheets/:id')
export class GetSheetByIdController {
  constructor(private getSheetById: GetSheetByIdUseCase) { }

  @Get()
  @HttpCode(200)
  async handle(@Param('id') id: string) {
    const result = await this.getSheetById.execute({ id })

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
      sheet: SheetDetailsPresenter.toHTTP(result.value.sheet)
    }
  }
}