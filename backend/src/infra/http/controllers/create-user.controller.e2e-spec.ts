import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Create User (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[POST] /users', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Novo Usuário',
        email: 'novo-usuario@metalizze.com',
        password: '123456',
        role: 'VIEWER',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({ message: 'Usuário criado com sucesso.' })

    const userOnDatabase = await prisma.user.findUnique({
      where: { email: 'novo-usuario@metalizze.com' },
    })

    expect(userOnDatabase).toBeTruthy()
    expect(userOnDatabase?.role).toBe('VIEWER')
  })
})