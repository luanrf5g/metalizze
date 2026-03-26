import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchAllProfilesUseCase } from "@/domain/application/use-cases/fetch-all-profiles";
import { ProfileWithDetailsPresenter } from "../presenters/profile-with-details-presenter";

const PROFILE_TYPES = ['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'] as const

const fetchAllProfilesQuerySchema = z.object({
  materialId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  profileType: z.enum(PROFILE_TYPES).optional()
})

type FetchAllProfilesQuerySchema = z.infer<typeof fetchAllProfilesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchAllProfilesQuerySchema)

@Controller('/profiles/all')
export class FetchAllProfilesController {
  constructor(private fetchAllProfiles: FetchAllProfilesUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchAllProfilesQuerySchema) {
    const { materialId, clientId, profileType } = query

    const result = await this.fetchAllProfiles.execute({
      materialId,
      clientId,
      profileType
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { profiles } = result.value

    return {
      profiles: profiles.map(ProfileWithDetailsPresenter.toHTTP)
    }
  }
}
