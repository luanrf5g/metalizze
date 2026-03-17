import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Fetch Users (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /users', async () => {
    await Promise.all([
      userFactory.makePrismaUser({ name: 'Usuário A', email: 'user-a@metalizze.com' }),
      userFactory.makePrismaUser({ name: 'Usuário B', email: 'user-b@metalizze.com' }),
    ])

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      users: expect.arrayContaining([
        expect.objectContaining({ name: 'Usuário A' }),
        expect.objectContaining({ name: 'Usuário B' }),
      ]),
    })
  })
})