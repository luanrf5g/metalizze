import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchSheetsUseCase } from "@/domain/application/use-cases/fetch-sheets";
import { SheetWithDetailsPresenter } from "../presenters/sheet-with-details-presenter";

const fetchSheetsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  perPage: z.string().optional().default('20').transform(Number).pipe(z.number().min(1).max(100)),
  materialId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  type: z.enum(['STANDARD', 'SCRAP']).optional(),
  search: z.string().optional(),
  materials: z.string().optional().transform((v) =>
    v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined
  ),
  thicknesses: z.string().optional().transform((v) =>
    v ? v.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n)) : undefined
  ),
  sortBy: z.enum(['createdAt', 'updatedAt', 'quantity', 'thickness']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

type FetchSheetsQuerySchema = z.infer<typeof fetchSheetsQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchSheetsQuerySchema)

@Controller('/sheets')
export class FetchSheetsController {
  constructor(private fetchSheets: FetchSheetsUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchSheetsQuerySchema) {
    const { page, perPage, materialId, clientId, type, search, materials, thicknesses, sortBy, sortOrder } = query

    const result = await this.fetchSheets.execute({
      page,
      perPage,
      materialId,
      clientId,
      type,
      search,
      materials,
      thicknesses,
      sortBy,
      sortOrder,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { sheets, totalCount, perPage: resolvedPerPage } = result.value
    const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPerPage))

    return {
      sheets: sheets.map(SheetWithDetailsPresenter.toHTTP),
      meta: {
        page,
        perPage: resolvedPerPage,
        total: totalCount,
        totalPages,
      }
    }
  }
}
