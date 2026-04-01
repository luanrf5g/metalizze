import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchProfilesUseCase } from "@/domain/application/use-cases/fetch-profiles";
import { ProfileWithDetailsPresenter } from "../presenters/profile-with-details-presenter";

const PROFILE_TYPES = ['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'] as const

const fetchProfilesQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  materialId: z.uuid().optional(),
  clientId: z.uuid().optional(),
  profileType: z.enum(PROFILE_TYPES).optional()
})

type FetchProfilesQuerySchema = z.infer<typeof fetchProfilesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchProfilesQuerySchema)

@Controller('/profiles')
export class FetchProfilesController {
  constructor(private fetchProfiles: FetchProfilesUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchProfilesQuerySchema) {
    const { page, materialId, clientId, profileType } = query

    const result = await this.fetchProfiles.execute({
      page,
      materialId,
      clientId,
      profileType
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { profiles, totalCount } = result.value

    const pageSize = 15
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    return {
      profiles: profiles.map(ProfileWithDetailsPresenter.toHTTP),
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      }
    }
  }
}
