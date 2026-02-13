import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'

describe('Fetch Materials (E2E)', () => {
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

  test('[GET] /materials', async () => {
    await Promise.all([
      materialFactory.makePrismaMaterial({
        name: 'Aço Carbono'
      }),
      materialFactory.makePrismaMaterial({
        name: 'Alumínio'
      })
    ])

    const response = await request(app.getHttpServer())
      .get('/materials')
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      materials: expect.arrayContaining([
        expect.objectContaining({ name: 'Aço Carbono' }),
        expect.objectContaining({ name: 'Alumínio' })
      ])
    })
  })
})