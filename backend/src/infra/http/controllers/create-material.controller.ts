import { RegisterMaterialUseCase } from "@/domain/application/use-cases/register-material";
import { Body, ConflictException, Controller, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const createMaterialBodySchema = z.object({
  name: z.string().min(1, { error: 'Name of material is required.' })
})

type createMaterialBodyDto = z.infer<typeof createMaterialBodySchema>

@Controller('/materials')
export class CreateMaterialController {
  constructor(private registerMaterials: RegisterMaterialUseCase) { }

  @Post()
  @UsePipes(new ZodValidationPipe(createMaterialBodySchema))
  async handle(@Body() body: createMaterialBodyDto) {
    const { name } = body

    const result = await this.registerMaterials.execute({
      name
    })

    if (result.isLeft()) {
      const error = result.value

      throw new ConflictException(error.message)
    }

    return {
      message: 'Material created successfully.'
    }
  }
}