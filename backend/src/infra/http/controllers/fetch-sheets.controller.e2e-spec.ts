import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SheetFactory } from 'test/factories/make-sheet'
import { MaterialFactory } from 'test/factories/make-material'
import { ClientFactory } from 'test/factories/make-client'

describe('Fetch Sheets (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let clientFactory: ClientFactory
  let sheetFactory: SheetFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, ClientFactory, SheetFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    materialFactory = moduleRef.get(MaterialFactory)
    clientFactory = moduleRef.get(ClientFactory)
    sheetFactory = moduleRef.get(SheetFactory)

    await app.init()
  })

  test('[GET] /sheets', async () => {
    const material = await materialFactory.makePrismaMaterial()

    await sheetFactory.makePrismaSheet({ materialId: material.id })
    await sheetFactory.makePrismaSheet({ materialId: material.id })

    const response = await request(app.getHttpServer()).get('/sheets').send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets.length).toBeGreaterThanOrEqual(2)
  })

  test('[GET] /sheets (with filters)', async () => {
    const materialTarget = await materialFactory.makePrismaMaterial({ name: 'Material Alvo' })
    const materialNoise = await materialFactory.makePrismaMaterial({ name: 'Material Ruido' })
    const clientTarget = await clientFactory.makePrismaClient({ name: 'Cliente Alvo' })

    await sheetFactory.makePrismaSheet({
      materialId: materialTarget.id,
      clientId: clientTarget.id,
      type: 'STANDARD',
    })

    await sheetFactory.makePrismaSheet({ materialId: materialNoise.id })
    await sheetFactory.makePrismaSheet({ materialId: materialTarget.id, type: 'SCRAP' })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .query({
        materialId: materialTarget.id.toString(),
        clientId: clientTarget.id.toString(),
        type: 'STANDARD',
      })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets).toHaveLength(1)
    expect(response.body.sheets[0]).toEqual(
      expect.objectContaining({
        materialId: materialTarget.id.toString(),
        type: 'STANDARD',
        client: expect.objectContaining({
          id: clientTarget.id.toString(),
          name: 'Cliente Alvo'
        })
      }),
    )
  })
})