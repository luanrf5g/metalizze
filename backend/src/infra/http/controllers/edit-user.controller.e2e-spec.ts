import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Edit User (E2E)', () => {
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

  test('[PATCH] /users/:id', async () => {
    const user = await userFactory.makePrismaUser({
      name: 'Usuário Antigo',
      email: 'usuario-antigo@metalizze.com',
      role: 'VIEWER',
    })

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Usuário Atualizado',
        role: 'OPERATOR',
        isActive: false,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      user: expect.objectContaining({
        name: 'Usuário Atualizado',
        role: 'OPERATOR',
        isActive: false,
      }),
    })

    const userOnDatabase = await prisma.user.findUnique({
      where: { id: user.id.toString() },
    })

    expect(userOnDatabase?.name).toBe('Usuário Atualizado')
    expect(userOnDatabase?.role).toBe('OPERATOR')
    expect(userOnDatabase?.isActive).toBe(false)
  })
})