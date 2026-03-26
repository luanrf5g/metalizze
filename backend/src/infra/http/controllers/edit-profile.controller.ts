import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { EditProfileUseCase } from "@/domain/application/use-cases/edit-profile";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

const PROFILE_TYPES = ['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'] as const

const editProfileBodySchema = z.object({
  materialId: z.uuid().optional(),
  clientId: z.uuid().nullable().optional(),
  profileType: z.enum(PROFILE_TYPES).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  length: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  price: z.number().min(0).optional(),
  storageLocation: z.string().max(255).nullable().optional()
})

type EditProfileBodySchema = z.infer<typeof editProfileBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editProfileBodySchema)

@Controller('/profiles/:id')
export class EditProfileController {
  constructor(private editProfile: EditProfileUseCase) { }

  @Put()
  @HttpCode(204)
  async handle(
    @Param('id') profileId: string,
    @Body(bodyValidationPipe) body: EditProfileBodySchema
  ) {
    const { materialId, clientId, profileType, width, height, length, thickness, price, storageLocation } = body

    const result = await this.editProfile.execute({
      profileId,
      materialId,
      clientId,
      profileType,
      width,
      height,
      length,
      thickness,
      price,
      storageLocation
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
