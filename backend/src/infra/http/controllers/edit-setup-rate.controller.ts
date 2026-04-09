import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { EditSetupRateUseCase } from "@/domain/application/use-cases/edit-setup-rate";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const editSetupRateBodySchema = z.object({
  name: z.string().min(1).optional(),
  pricePerHour: z.number().positive().optional(),
  isActive: z.boolean().optional()
})

type EditSetupRateBodySchema = z.infer<typeof editSetupRateBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editSetupRateBodySchema)

@Controller('/setup-rates/:id')
export class EditSetupRateController {
  constructor(private editSetupRate: EditSetupRateUseCase) { }

  @Put()
  @HttpCode(204)
  @Roles('ADMIN')
  async handle(
    @Param('id') setupRateId: string,
    @Body(bodyValidationPipe) body: EditSetupRateBodySchema
  ) {
    const { name, pricePerHour, isActive } = body

    const result = await this.editSetupRate.execute({
      setupRateId,
      name,
      pricePerHour,
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
