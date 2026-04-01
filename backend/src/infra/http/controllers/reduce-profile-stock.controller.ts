import { ReduceProfileStockUseCase } from "@/domain/application/use-cases/reduce-profile-stock";
import { BadRequestException, Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { InsufficientStockError } from "@/domain/application/use-cases/errors/insufficient-stock-error";

const reduceProfileStockBodySchema = z.object({
  quantity: z.number().int().positive(),
  description: z.string().optional()
})

type ReduceProfileStockBodySchema = z.infer<typeof reduceProfileStockBodySchema>

const bodyValidationPipe = new ZodValidationPipe(reduceProfileStockBodySchema)

@Controller('/profiles/:id/reduce-stock')
export class ReduceProfileStockController {
  constructor(private reduceProfileStock: ReduceProfileStockUseCase) { }

  @Post()
  @HttpCode(204)
  async handle(
    @Param('id') profileId: string,
    @Body(bodyValidationPipe) body: ReduceProfileStockBodySchema
  ) {
    const { quantity, description } = body

    const result = await this.reduceProfileStock.execute({
      profileId,
      quantity,
      description
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InsufficientStockError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
