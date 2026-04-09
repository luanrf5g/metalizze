import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { RegisterCuttingGasUseCase } from "@/domain/application/use-cases/register-cutting-gas";
import { CuttingGasAlreadyExistsError } from "@/domain/application/use-cases/errors/cutting-gas-already-exists-error";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const createCuttingGasBodySchema = z.object({
  name: z.string(),
  pricePerHour: z.number().positive().min(1),
  isActive: z.boolean().default(true).optional()
})

type CreateCuttingGasBodySchema = z.infer<typeof createCuttingGasBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createCuttingGasBodySchema)

@Controller('/cutting-gases')
export class CreateCuttingGasController {
  constructor(private registerCuttingGas: RegisterCuttingGasUseCase) { }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @UsePipes(bodyValidationPipe)
  async handle(@Body() body: CreateCuttingGasBodySchema) {
    const { name, pricePerHour, isActive } = body

    const result = await this.registerCuttingGas.execute({
      name,
      pricePerHour,
      isActive
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case CuttingGasAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
