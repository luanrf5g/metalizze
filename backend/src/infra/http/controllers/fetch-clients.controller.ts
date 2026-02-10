import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { FetchClientsUseCase } from "@/domain/application/use-cases/fetch-clients";
import { ClientPresenter } from "../presenters/client-presenter";

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/clients')
export class FetchClientsController {
  constructor(private fetchClientsUseCase: FetchClientsUseCase) { }

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema
  ) {
    const result = await this.fetchClientsUseCase.execute({ page })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const clients = result.value.clients

    return {
      clients: clients.map(ClientPresenter.toHTTP)
    }
  }
}
