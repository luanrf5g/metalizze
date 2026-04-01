import { RegisterProfileUseCase } from "@/domain/application/use-cases/register-profile";
import { BadRequestException, Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const PROFILE_TYPES = ['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'] as const

const createProfileBodySchema = z.object({
  materialId: z.uuid(),
  profileType: z.enum(PROFILE_TYPES),
  width: z.number().positive(),
  height: z.number().positive(),
  length: z.number().positive(),
  thickness: z.number().positive(),
  quantity: z.number().int().min(1),
  price: z.number().min(0).nullable().optional(),
  clientId: z.uuid().nullable().optional(),
  description: z.string().optional()
})

type CreateProfileBodySchema = z.infer<typeof createProfileBodySchema>

@Controller('/profiles')
export class CreateProfileController {
  constructor(private registerProfile: RegisterProfileUseCase) { }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createProfileBodySchema))
  async handle(@Body() body: CreateProfileBodySchema) {
    const { materialId, profileType, width, height, length, thickness, quantity, price, clientId, description } = body

    const result = await this.registerProfile.execute(
      { materialId, profileType, width, height, length, thickness, quantity, price, clientId, description }
    )

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
