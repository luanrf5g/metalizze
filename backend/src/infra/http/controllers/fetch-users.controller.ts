import { FetchUsersUseCase } from "@/domain/application/use-cases/fetch-users";
import { Controller, Get, Query } from "@nestjs/common";
import { Roles } from "@/infra/auth/decorators/roles.decorator";
import { UserPresenter } from "../presenters/user-presenter";

@Controller('/users')
export class FetchUsersController {
    constructor(private fetchUsers: FetchUsersUseCase) { }

    @Get()
    @Roles('ADMIN')
    async handle(@Query('page') page: string = '1') {
        const result = await this.fetchUsers.execute({
            page: Number(page),
        })

        if (result.isRight()) {
            return {
                users: result.value.users.map(UserPresenter.toHTTP),
            }
        }
    }
}
