import { EditUserUseCase } from "@/domain/application/use-cases/edit-user";
import { Body, Controller, NotFoundException, Param, Patch } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";
import { UserPresenter } from "../presenters/user-presenter";
import { UserPermissions } from "@/domain/enterprise/entities/user";
import z from "zod";

const editUserBodySchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    permissions: z.record(
        z.string(),
        z.object({
            read: z.boolean().optional(),
            write: z.boolean().optional(),
            delete: z.boolean().optional(),
        })
    ).optional(),
    isActive: z.boolean().optional(),
})

@Controller('/users')
export class EditUserController {
    constructor(private editUser: EditUserUseCase) { }

    @Patch(':id')
    @Roles('ADMIN')
    async handle(@Param('id') id: string, @Body() body: z.infer<typeof editUserBodySchema>) {
        const parsed = editUserBodySchema.parse(body)

        const result = await this.editUser.execute({
            userId: id,
            ...parsed,
            permissions: parsed.permissions as UserPermissions | undefined,
        })

        if (result.isLeft()) {
            throw new NotFoundException(result.value.message)
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        }
    }
}
