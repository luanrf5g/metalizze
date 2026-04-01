import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, NotFoundException, Post } from "@nestjs/common";
import { RegisterProfileCutUseCase } from "@/domain/application/use-cases/register-profile-cut";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { InsufficientStockError } from "@/domain/application/use-cases/errors/insufficient-stock-error";

const registerProfileCutBodySchema = z.object({
  profileId: z.string().uuid(),
  quantityToCut: z.number().int().positive(),
  description: z.string().optional(),
  leftovers: z.array(z.object({
    length: z.number().positive(),
    quantity: z.number().int().positive()
  })).default([])
})

type RegisterProfileCutBodySchema = z.infer<typeof registerProfileCutBodySchema>

const bodyValidationPipe = new ZodValidationPipe(registerProfileCutBodySchema)

@Controller('/profiles/cut')
export class RegisterProfileCutController {
  constructor(private registerProfileCut: RegisterProfileCutUseCase) { }

  @Post()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: RegisterProfileCutBodySchema
  ) {
    const { profileId, quantityToCut, description, leftovers } = body

    const result = await this.registerProfileCut.execute({
      profileId,
      quantityToCut,
      description,
      leftovers
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
