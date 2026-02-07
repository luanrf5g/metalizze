import { RegisterSheetUseCase } from "@/domain/application/use-cases/register-sheet";
import { BadRequestException, Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const createSheetBodySchema = z.object({
  materialId: z.uuid(),
  width: z.number().positive(),
  height: z.number().positive(),
  thickness: z.number().positive(),
  quantity: z.number().int().min(1),
  clientId: z.uuid().nullable().optional()
})

type CreateSheetBodySchema = z.infer<typeof createSheetBodySchema>

@Controller('/sheets')
export class CreateSheetController {
  constructor(private registerSheets: RegisterSheetUseCase) { }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createSheetBodySchema))
  async handle(@Body() body: CreateSheetBodySchema) {
    const { materialId, width, height, thickness, quantity, clientId } = body

    const result = await this.registerSheets.execute(
      { materialId, width, height, thickness, quantity, clientId }
    )

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}