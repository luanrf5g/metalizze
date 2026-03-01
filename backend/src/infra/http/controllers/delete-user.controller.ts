import { DeleteUserUseCase } from "@/domain/application/use-cases/delete-user";
import { Controller, Delete, NotFoundException, Param } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";

@Controller('/users')
export class DeleteUserController {
    constructor(private deleteUser: DeleteUserUseCase) { }

    @Delete(':id')
    @Roles('ADMIN')
    async handle(@Param('id') id: string) {
        const result = await this.deleteUser.execute({ userId: id })

        if (result.isLeft()) {
            throw new NotFoundException(result.value.message)
        }

        return { message: 'Usuário removido com sucesso.' }
    }
}
