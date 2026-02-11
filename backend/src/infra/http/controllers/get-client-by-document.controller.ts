import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { GetClientByDocumentUseCase } from "@/domain/application/use-cases/get-client-by-document";
import { BadRequestException, Controller, Get, HttpCode, NotFoundException, Param } from "@nestjs/common";
import { ClientPresenter } from "../presenters/client-presenter";
import { ClientDetailsPresenter } from "../presenters/client-details-presenter";

@Controller('/clients/:document')
export class GetClientByDocumentController {
  constructor(
    private readonly getClientByDocumentUseCase: GetClientByDocumentUseCase
  ) { }

  @Get()
  @HttpCode(200)
  async handle(@Param('document') document: string) {
    const result = await this.getClientByDocumentUseCase.execute({ document })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      client: ClientDetailsPresenter.toHTTP(result.value.client)
    }
  }
}