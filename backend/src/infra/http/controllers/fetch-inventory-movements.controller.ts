import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchInventoryMovementsUseCase } from "@/domain/application/use-cases/fetch-inventory-movements";
import { InventoryMovementPresenter } from "../presenters/inventory-movement-presenter";

const fetchMovementsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  sheetId: z.uuid().optional()
})

type FetchMovementsQuerySchema = z.infer<typeof fetchMovementsQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchMovementsQuerySchema)

@Controller('/movements')
export class FetchInventoryMovementsController {
  constructor(private fetchMovements: FetchInventoryMovementsUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchMovementsQuerySchema) {
    const { page, sheetId } = query

    const result = await this.fetchMovements.execute({
      page,
      sheetId
    })

    if(result.isLeft()) {
      throw new BadRequestException()
    }

    const movements = result.value.movements

    return {
      movements: movements.map(InventoryMovementPresenter.toHTTP)
    }
  }
}