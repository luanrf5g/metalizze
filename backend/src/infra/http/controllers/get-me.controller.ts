import { GetCurrentUserUseCase } from "@/domain/application/use-cases/get-current-user";
import { Controller, Get, NotFoundException } from "@nestjs/common";
import { UserPresenter } from "../presenters/user-presenter";
import type { UserPayload } from "@/infra/auth/decorators/current-user.decorator";
import { CurrentUser } from "@/infra/auth/decorators/current-user.decorator";

@Controller('/auth')
export class GetMeController {
    constructor(private getCurrentUser: GetCurrentUserUseCase) { }

    @Get('/me')
    async handle(@CurrentUser() userPayload: UserPayload) {
        const result = await this.getCurrentUser.execute({
            userId: userPayload.sub,
        })

        if (result.isLeft()) {
            throw new NotFoundException(result.value.message)
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        }
    }
}
