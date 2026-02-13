import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'

describe('Get Material By Id (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    materialFactory = moduleRef.get(MaterialFactory)

    await app.init()
  })

  test('[GET] /materials/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Inox' })

    const response = await request(app.getHttpServer())
      .get(`/materials/${material.id.toString()}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      material: {
        name: 'Aço Inox',
        slug: 'aco-inox'
      }
    })
  })
})