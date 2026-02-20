import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { DeleteMaterialUseCase } from "@/domain/application/use-cases/delete-material";
import { MaterialHasSheetsError } from "@/domain/application/use-cases/errors/material-has-sheets-error";
import { BadRequestException, ConflictException, Controller, Delete, HttpCode, NotFoundException, Param } from "@nestjs/common";

@Controller('/materials/:id')
export class DeleteMaterialController {
  constructor(private deleteMaterial: DeleteMaterialUseCase) { }

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') materialId: string) {
    const result = await this.deleteMaterial.execute({ id: materialId })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case MaterialHasSheetsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}