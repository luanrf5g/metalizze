import { RegisterUserUseCase } from "@/domain/application/use-cases/register-user";
import { Body, ConflictException, Controller, Post, UsePipes } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { UserPermissions } from "@/domain/enterprise/entities/user";

const createUserBodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    permissions: z.record(
        z.string(),
        z.object({
            read: z.boolean().optional(),
            write: z.boolean().optional(),
            delete: z.boolean().optional(),
        })
    ).optional(),
})

type CreateUserBodyDto = z.infer<typeof createUserBodySchema>

@Controller('/users')
export class CreateUserController {
    constructor(private registerUser: RegisterUserUseCase) { }

    @Post()
    @Roles('ADMIN')
    @UsePipes(new ZodValidationPipe(createUserBodySchema))
    async handle(@Body() body: CreateUserBodyDto) {
        const { name, email, password, role, permissions } = body

        const result = await this.registerUser.execute({
            name,
            email,
            password,
            role,
            permissions: permissions as UserPermissions,
        })

        if (result.isLeft()) {
            throw new ConflictException(result.value.message)
        }

        return {
            message: 'Usuário criado com sucesso.',
        }
    }
}
