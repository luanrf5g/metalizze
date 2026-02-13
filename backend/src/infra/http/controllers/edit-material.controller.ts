import { EditMaterialUseCase } from "@/domain/application/use-cases/edit-material";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Patch } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

const editMaterialBodySchema = z.object({
  name: z.string().optional()
})

type EditMaterialBodySchame = z.infer<typeof editMaterialBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editMaterialBodySchema)

@Controller('/materials/:id')
export class EditMaterialController {
  constructor(private editMaterial: EditMaterialUseCase) { }

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('id') materialId: string,
    @Body(bodyValidationPipe) body: EditMaterialBodySchame
  ) {
    const { name } = body

    const result = await this.editMaterial.execute({ materialId, name })

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