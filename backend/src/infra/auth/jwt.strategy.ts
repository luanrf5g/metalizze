import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { EnvService } from '../env/env.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(env: EnvService) {
        const publicKey = env.get('JWT_PUBLIC_KEY')

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: Buffer.from(publicKey, 'base64'),
            algorithms: ['RS256'],
        })
    }

    async validate(payload: { sub: string; role: string }) {
        return { sub: payload.sub, role: payload.role }
    }
}
