import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchSheetsUseCase } from "@/domain/application/use-cases/fetch-sheets";
import { SheetPresenter } from "../presenters/sheet-presenter";

const fetchSheetsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  materialId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  type: z.enum(['STANDARD', 'SCRAP']).optional()
})

type FetchSheetsQuerySchema = z.infer<typeof fetchSheetsQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchSheetsQuerySchema)

@Controller('/sheets')
export class FetchSheetsController {
  constructor(private fetchSheets: FetchSheetsUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchSheetsQuerySchema) {
    const { page, materialId, clientId, type } = query

    const result = await this.fetchSheets.execute({
      page,
      materialId,
      clientId,
      type
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const sheets = result.value.sheets

    return {
      sheets: sheets.map(SheetPresenter.toHTTP)
    }
  }
}