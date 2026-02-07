import { EditClientUseCase } from "@/domain/application/use-cases/edit-client";
import { BadRequestException, Body, Controller, HttpCode, Param, Put } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const editClientBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string()
})

type EditClientBodySchema = z.infer<typeof editClientBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editClientBodySchema)

@Controller('/clients/:id')
export class EditClientController {
  constructor(private editClient: EditClientUseCase) { }

  @Put()
  @HttpCode(204)
  async handle(
    @Param('id') clientId: string,
    @Body(bodyValidationPipe) body: EditClientBodySchema
  ) {
    const { name, email, phone } = body

    console.log('clientId', clientId)

    const result = await this.editClient.execute({
      clientId,
      name,
      email,
      phone
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}