import { EditClientUseCase } from "@/domain/application/use-cases/edit-client";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Patch, Put } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

const editClientBodySchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional()
})

type EditClientBodySchema = z.infer<typeof editClientBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editClientBodySchema)

@Controller('/clients/:id')
export class EditClientController {
  constructor(private editClient: EditClientUseCase) { }

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('id') clientId: string,
    @Body(bodyValidationPipe) body: EditClientBodySchema
  ) {
    const { name, email, phone } = body

    const result = await this.editClient.execute({
      clientId,
      name,
      email,
      phone
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}