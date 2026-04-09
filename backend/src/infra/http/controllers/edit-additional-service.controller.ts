import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { EditAdditionalServiceUseCase } from "@/domain/application/use-cases/edit-additional-service";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const editAdditionalServiceBodySchema = z.object({
  name: z.string().min(1).optional(),
  unitLabel: z.string().min(1).optional(),
  pricePerUnit: z.number().positive().optional(),
  isActive: z.boolean().optional()
})

type EditAdditionalServiceBodySchema = z.infer<typeof editAdditionalServiceBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editAdditionalServiceBodySchema)

@Controller('/additional-services/:id')
export class EditAdditionalServiceController {
  constructor(private editAdditionalService: EditAdditionalServiceUseCase) { }

  @Put()
  @HttpCode(204)
  @Roles('ADMIN')
  async handle(
    @Param('id') serviceId: string,
    @Body(bodyValidationPipe) body: EditAdditionalServiceBodySchema
  ) {
    const { name, unitLabel, pricePerUnit, isActive } = body

    const result = await this.editAdditionalService.execute({
      serviceId,
      name,
      unitLabel,
      pricePerUnit,
      isActive
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
