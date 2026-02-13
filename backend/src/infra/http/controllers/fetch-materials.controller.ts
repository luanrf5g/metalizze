import { BadRequestException, Controller, Get, HttpCode, Query } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { FetchMaterialsUseCase } from "@/domain/application/use-cases/fetch-materials";
import { MaterialPresenter } from "../presenters/material-presenter";

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/materials')
export class FetchMaterialsController {
  constructor(private fetchMaterials: FetchMaterialsUseCase) { }

  @Get()
  @HttpCode(200)
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
  ) {
    const result = await this.fetchMaterials.execute({ page })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const materials = result.value.materials

    return {
      materials: materials.map(MaterialPresenter.toHTTP)
    }
  }
}