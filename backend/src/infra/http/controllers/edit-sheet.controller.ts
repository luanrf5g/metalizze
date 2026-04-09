import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { EditSheetUseCase } from "@/domain/application/use-cases/edit-sheet";
import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { SheetType } from "@prisma/client";

const editSheetBodySchema = z.object({
  materialId: z.uuid().optional(),
  clientId: z.uuid().nullable().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  type: z.enum(SheetType).optional(),
  price: z.number().min(0).optional(),
  storageLocation: z.string().max(255).nullable().optional()
})

type EditSheetBodySchema = z.infer<typeof editSheetBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editSheetBodySchema)

@Controller('/sheets/:id')
export class EditSheetController {
  constructor(private editSheet: EditSheetUseCase) { }

  @Put()
  @HttpCode(204)
  async handle(
    @Param('id') sheetId: string,
    @Body(bodyValidationPipe) body: EditSheetBodySchema
  ) {
    const { materialId, clientId, width, height, thickness, type, price, storageLocation } = body

    const result = await this.editSheet.execute({
      sheetId,
      materialId,
      clientId,
      width,
      height,
      thickness,
      type,
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