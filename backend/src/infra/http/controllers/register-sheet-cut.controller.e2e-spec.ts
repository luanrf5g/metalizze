import request from "supertest"
import { INestApplication } from "@nestjs/common"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { MaterialFactory } from "test/factories/make-material"
import { SheetFactory } from "test/factories/make-sheet"
import { Test } from "@nestjs/testing"
import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { UserFactory } from "test/factories/make-user"

describe('Register Sheet Cut (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SheetFactory, MaterialFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[POST] /sheets/cut', async () => {
    const material = await materialFactory.makePrismaMaterial()

    const motherSheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 10,
      width: 3000,
      height: 1200,
      thickness: 2
    })

    const response = await request(app.getHttpServer())
      .post('/sheets/cut')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sheetId: motherSheet.id.toString(),
        quantityToCut: 2,
        description: 'Corte de test E2E',
        generatedScraps: [
          { width: 1000, height: 500, quantity: 4 }
        ]
      })

    expect(response.statusCode).toBe(204)

    const updatedMotherSheet = await prisma.sheet.findUnique({
      where: { id: motherSheet.id.toString() }
    })

    expect(updatedMotherSheet?.quantity).toBe(8)

    const scrapSheet = await prisma.sheet.findFirst({
      where: {
        type: 'SCRAP',
        materialId: material.id.toString()
      }
    })

    expect(scrapSheet).toBeTruthy()
    expect(scrapSheet?.quantity).toBe(4)
    expect(scrapSheet?.width).toBe(1000)

    const movement = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' }
    })

    expect(movement.length).toBeGreaterThanOrEqual(2)
  })
})