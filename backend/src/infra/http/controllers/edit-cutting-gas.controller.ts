import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { EditCuttingGasUseCase } from "@/domain/application/use-cases/edit-cutting-gas";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { CuttingGasAlreadyExistsError } from "@/domain/application/use-cases/errors/cutting-gas-already-exists-error";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const editCuttingGasBodySchema = z.object({
  name: z.string().optional(),
  pricePerHour: z.number().positive().min(1).optional(),
  isActive: z.boolean().optional()
})

type EditCuttingGasBodySchema = z.infer<typeof editCuttingGasBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editCuttingGasBodySchema)

@Controller('/cutting-gases/:id')
export class EditCuttingGasController {
  constructor(private editCuttingGas: EditCuttingGasUseCase) { }

  @Put()
  @HttpCode(204)
  @Roles('ADMIN')
  async handle(
    @Param('id') gasId: string,
    @Body(bodyValidationPipe) body: EditCuttingGasBodySchema
  ) {
    const { name, pricePerHour, isActive } = body

    const result = await this.editCuttingGas.execute({
      gasId,
      name,
      pricePerHour,
      isActive
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case CuttingGasAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}