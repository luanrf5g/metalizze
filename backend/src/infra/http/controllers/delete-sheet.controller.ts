import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { DeleteSheetUseCase } from "@/domain/application/use-cases/delete-sheet";
import { BadRequestException, Controller, Delete, HttpCode, NotFoundException, Param } from "@nestjs/common";

@Controller('/sheets/:id')
export class DeleteSheetController {
  constructor(private deleteSheet: DeleteSheetUseCase) { }

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') sheetId: string) {
    const result = await this.deleteSheet.execute({
      sheetId
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
