import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { ConfigService } from '@nestjs/config'
import { Env } from '@/infra/env/env'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private pool: Pool

  constructor(private configService: ConfigService<Env, true>) {
    const connectionString = String(
      configService.get('DATABASE_URL', { infer: true })
    )

    const connectionStringClean = connectionString

    // We use the DATABASE_URL directly (DB-per-test ensures isolation).
    const pool = new Pool({
      connectionString: connectionStringClean,
    })

    const adapter = new PrismaPg(pool)

    // Use the adapter-backed PrismaClient instance.
    super({ adapter })
    this.pool = pool
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
    await this.pool.end()
  }
}