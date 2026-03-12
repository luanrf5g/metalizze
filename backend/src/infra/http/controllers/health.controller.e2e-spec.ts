import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Health (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test('[GET] /health', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })
})