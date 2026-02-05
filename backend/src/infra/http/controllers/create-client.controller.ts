import { RegisterClientUseCase } from "@/domain/application/use-cases/register-client";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { ClientAlreadyExistsError } from "@/domain/application/use-cases/errors/client-already-exists";

const createClientBodySchema = z.object({
  name: z.string(),
  document: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional()
})

type CreateClientBodySchema = z.infer<typeof createClientBodySchema>

@Controller('/clients')
export class CreateClientController {
  constructor(private registerClients: RegisterClientUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createClientBodySchema))
  async handle(@Body() body: CreateClientBodySchema) {
    const { name, document, phone, email } = body

    const result = await this.registerClients.execute({
      name,
      document,
      phone,
      email
    })

    if(result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ClientAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}