import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { CreateAdditionalServiceUseCase } from "@/domain/application/use-cases/create-additional-service";
import { AdditionalServiceAlreadyExistsError } from "@/domain/application/use-cases/errors/additional-service-already-exists-error";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

const createAdditionalServiceBodySchema = z.object({
  type: z.enum(['BENDING', 'THREADING', 'WELDING']),
  name: z.string().min(1),
  unitLabel: z.string().min(1),
  pricePerUnit: z.number().positive(),
  isActive: z.boolean().default(true).optional()
})

type CreateAdditionalServiceBodySchema = z.infer<typeof createAdditionalServiceBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createAdditionalServiceBodySchema)

@Controller('/additional-services')
export class CreateAdditionalServiceController {
  constructor(private createAdditionalService: CreateAdditionalServiceUseCase) { }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @UsePipes(bodyValidationPipe)
  async handle(@Body() body: CreateAdditionalServiceBodySchema) {
    const { type, name, unitLabel, pricePerUnit, isActive } = body

    const result = await this.createAdditionalService.execute({
      type,
      name,
      unitLabel,
      pricePerUnit,
      isActive
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case AdditionalServiceAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
