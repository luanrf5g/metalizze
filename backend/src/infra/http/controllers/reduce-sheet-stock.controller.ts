import { ReduceSheetStockUseCase } from "@/domain/application/use-cases/reduce-sheet-stock";
import { BadRequestException, Body, Controller, HttpCode, Param, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { InsufficientStockError } from "@/domain/application/use-cases/errors/insufficient-stock-error";

const reduceSheetStockBodySchema = z.object({
  quantity: z.number().int().positive(),
  description: z.string().optional()
})

type ReduceSheetStockBodySchema = z.infer<typeof reduceSheetStockBodySchema>

const bodyValidationPipe = new ZodValidationPipe(reduceSheetStockBodySchema)

@Controller('/sheets/:id/reduce-stock')
export class ReduceSheetStockController {
  constructor(private reduceSheetStock: ReduceSheetStockUseCase) { }

  @Post()
  @HttpCode(204)
  async handle(
    @Param('id') sheetId: string,
    @Body(bodyValidationPipe) body: ReduceSheetStockBodySchema
  ) {
    const { quantity, description } = body

    const result = await this.reduceSheetStock.execute({
      sheetId,
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