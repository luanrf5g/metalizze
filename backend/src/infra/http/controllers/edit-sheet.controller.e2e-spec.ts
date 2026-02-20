import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SheetFactory } from 'test/factories/make-sheet'
import { MaterialFactory } from 'test/factories/make-material'
import { ClientFactory } from 'test/factories/make-client'

describe('Edit Sheet (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let clientFactory: ClientFactory
  let sheetFactory: SheetFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, ClientFactory, SheetFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    clientFactory = moduleRef.get(ClientFactory)
    sheetFactory = moduleRef.get(SheetFactory)

    await app.init()
  })

  test('[PUT] /sheets/:id', async () => {
    // 1. Preparação
    const oldMaterial = await materialFactory.makePrismaMaterial({ name: 'Aco Velho' })
    const newMaterial = await materialFactory.makePrismaMaterial({ name: 'Aco Novo' })
    const client = await clientFactory.makePrismaClient({ name: 'John Doe' })

    const sheet = await sheetFactory.makePrismaSheet({
      materialId: oldMaterial.id,
      width: 1000,
      height: 1000,
      thickness: 1,
      type: 'STANDARD',
    })

    // 2. Ação
    const response = await request(app.getHttpServer())
      .put(`/sheets/${sheet.id.toString()}`)
      .send({
        materialId: newMaterial.id.toString(),
        clientId: client.id.toString(),
        width: 2000,
        height: 1500,
        type: 'SCRAP',
      })

    // 3. Verificação
    expect(response.statusCode).toBe(204)

    const sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })

    expect(sheetOnDatabase).toBeTruthy()
    expect(sheetOnDatabase?.width).toBe(2000)
    expect(sheetOnDatabase?.height).toBe(1500)
    expect(sheetOnDatabase?.materialId).toBe(newMaterial.id.toString())
    expect(sheetOnDatabase?.clientId).toBe(client.id.toString())
    expect(sheetOnDatabase?.type).toBe('SCRAP')

    // O mais importante: O SKU deve ter sido recalculado com as novas regras!
    expect(sheetOnDatabase?.sku).toContain('ACO-NOVO')
    expect(sheetOnDatabase?.sku).toContain('2000X1500')
    expect(sheetOnDatabase?.sku).toContain('JOHNDOE')
    expect(sheetOnDatabase?.sku).toContain('SCRAP')
  })
})