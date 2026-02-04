import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './infra/env/env'
import { EnvModule } from './infra/env/env.module'
import { DatabaseModule } from './infra/database/database.module'
import { HttpModule } from './infra/http/http.module'

// IMPORTANT: Do not mutate `process.env` here. Use `EnvService` /
// `ConfigService` through DI (preferred) to access configuration values
// and defaults. This keeps initialization explicit and testable.

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      // CRUCIAL: Se for teste, NÃO LEIA o arquivo .env.
      // Confie no que o setup-e2e colocou na memória (process.env).
      ignoreEnvFile:
        process.env.NODE_ENV === 'test'
    }),
    EnvModule,
    DatabaseModule,
    HttpModule,
  ],
})
export class AppModule { }