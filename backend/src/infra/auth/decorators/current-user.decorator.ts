import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface UserPayload {
    sub: string
    role: string
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): UserPayload => {
        const request = context.switchToHttp().getRequest()
        return request.user as UserPayload
    },
)
