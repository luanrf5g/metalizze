import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchAllSheetsUseCase } from "@/domain/application/use-cases/fetch-all-sheets";
import { SheetWithDetailsPresenter } from "../presenters/sheet-with-details-presenter";

const fetchAllSheetsQuerySchema = z.object({
  materialId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  type: z.enum(['STANDARD', 'SCRAP']).optional()
})

type FetchAllSheetsQuerySchema = z.infer<typeof fetchAllSheetsQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchAllSheetsQuerySchema)

@Controller('/sheets/all')
export class FetchAllSheetsController {
  constructor(private fetchAllSheets: FetchAllSheetsUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchAllSheetsQuerySchema) {
    const { materialId, clientId, type } = query

    const result = await this.fetchAllSheets.execute({
      materialId,
      clientId,
      type
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { sheets } = result.value

    return {
      sheets: sheets.map(SheetWithDetailsPresenter.toHTTP)
    }
  }
}
