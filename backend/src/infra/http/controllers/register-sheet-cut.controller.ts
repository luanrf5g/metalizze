import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, NotFoundException, Post } from "@nestjs/common";
import { RegisterSheetCutUseCase } from "@/domain/application/use-cases/register-sheet-cut";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { NotFoundError } from "rxjs";
import { InsufficientStockError } from "@/domain/application/use-cases/errors/insufficient-stock-error";

const scrapSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  quantity: z.number().int().positive(),
  clientId: z.uuid().optional().nullable()
})

const registerSheetCutBodySchema = z.object({
  sheetId: z.uuid(),
  quantityToCut: z.number().int().positive(),
  description: z.string().optional(),
  generatedScraps: z.array(scrapSchema).default([])
})

type RegisterSheetCutBodySchema = z.infer<typeof registerSheetCutBodySchema>

const bodyValidationPipe = new ZodValidationPipe(registerSheetCutBodySchema)

@Controller('/sheets/cut')
export class RegisterSheetCutController {
  constructor(private registerSheetCut: RegisterSheetCutUseCase) { }

  @Post()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: RegisterSheetCutBodySchema
  ) {
    const { sheetId, quantityToCut, generatedScraps, description } = body

    const result = await this.registerSheetCut.execute({
      sheetId,
      quantityToCut,
      generatedScraps,
      description
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