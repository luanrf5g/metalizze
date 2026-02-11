import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { DeleteClientUseCase } from "@/domain/application/use-cases/delete-client";
import { ClientHasSheetsError } from "@/domain/application/use-cases/errors/client-has-sheets-error";
import { BadRequestException, ConflictException, Controller, Delete, HttpCode, NotFoundException, Param } from "@nestjs/common";
import { NotFoundError } from "rxjs";

@Controller('/clients/:id')
export class DeleteClientController {
  constructor(private deleteClient: DeleteClientUseCase) { }

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') clientId: string) {
    const result = await this.deleteClient.execute({
      clientId
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case ClientHasSheetsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}