import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { CreateSetupRateUseCase } from "@/domain/application/use-cases/create-setup-rate";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const createSetupRateBodySchema = z.object({
  name: z.string().min(1),
  pricePerHour: z.number().positive(),
  isActive: z.boolean().default(true).optional()
})

type CreateSetupRateBodySchema = z.infer<typeof createSetupRateBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createSetupRateBodySchema)

@Controller('/setup-rates')
export class CreateSetupRateController {
  constructor(private createSetupRate: CreateSetupRateUseCase) { }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @UsePipes(bodyValidationPipe)
  async handle(@Body() body: CreateSetupRateBodySchema) {
    const { name, pricePerHour, isActive } = body

    const result = await this.createSetupRate.execute({
      name,
      pricePerHour,
      isActive
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }
  }
}
