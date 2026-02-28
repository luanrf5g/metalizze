import { BadRequestException, Body, ConflictException, Controller, HttpCode, NotFoundException, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { RegisterInventoryMovementUseCase } from "@/domain/application/use-cases/register-inventory-movements";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { InsufficientStockError } from "@/domain/application/use-cases/errors/insufficient-stock-error";

const registerInventoryMovementBodySchema = z.object({
  sheetId: z.uuid(),
  type: z.enum(['ENTRY', 'EXIT']),
  quantity: z.number().int().positive().min(1),
  description: z.string(),
})

type RegisterInventoryMovementBodySchema = z.infer<typeof registerInventoryMovementBodySchema>

const bodyValidationPipe = new ZodValidationPipe(registerInventoryMovementBodySchema)

@Controller('/movements')
export class RegisterInventoryMovementController {
  constructor(private registerInventoryMovement: RegisterInventoryMovementUseCase) { }

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: RegisterInventoryMovementBodySchema) {
    const { sheetId, type, quantity, description } = body

    const result = await this.registerInventoryMovement.execute({
      sheetId, quantity, type, description
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InsufficientStockError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
