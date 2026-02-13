import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'

describe('Edit Material (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)

    await app.init()
  })

  test('[PATCH] /materials/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Inox' })

    const materialId = material.id.toString()

    const response = await request(app.getHttpServer())
      .patch(`/materials/${materialId}`)
      .send({
        name: 'Aço Carbono'
      })

    expect(response.statusCode).toBe(204)
  })
})