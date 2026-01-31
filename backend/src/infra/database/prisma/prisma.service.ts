import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    super({ adapter })
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}