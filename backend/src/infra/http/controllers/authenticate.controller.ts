import { AuthenticateUserUseCase } from "@/domain/application/use-cases/authenticate-user";
import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { Public } from "@/infra/auth/decorators/public.decorator";
import z from "zod";

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

@Controller('/auth')
export class AuthenticateController {
    constructor(private authenticateUser: AuthenticateUserUseCase) { }

    @Post('/login')
    @Public()
    async handle(@Body() body: z.infer<typeof authenticateBodySchema>) {
        const { email, password } = authenticateBodySchema.parse(body)

        const result = await this.authenticateUser.execute({ email, password })

        if (result.isLeft()) {
            throw new UnauthorizedException(result.value.message)
        }

        return {
            accessToken: result.value.accessToken,
        }
    }
}
