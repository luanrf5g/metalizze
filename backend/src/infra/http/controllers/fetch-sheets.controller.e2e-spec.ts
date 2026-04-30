import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SheetFactory } from 'test/factories/make-sheet'
import { MaterialFactory } from 'test/factories/make-material'
import { ClientFactory } from 'test/factories/make-client'
import { UserFactory } from 'test/factories/make-user'

describe('Fetch Sheets (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let clientFactory: ClientFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, ClientFactory, SheetFactory, UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    materialFactory = moduleRef.get(MaterialFactory)
    clientFactory = moduleRef.get(ClientFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /sheets — returns sheets with width/height/thickness and correct meta', async () => {
    const material = await materialFactory.makePrismaMaterial()

    await sheetFactory.makePrismaSheet({ materialId: material.id })
    await sheetFactory.makePrismaSheet({ materialId: material.id })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets.length).toBeGreaterThanOrEqual(2)
    expect(response.body.meta).toMatchObject({ page: 1, perPage: 20 })

    for (const sheet of response.body.sheets) {
      expect(sheet).toHaveProperty('width')
      expect(sheet).toHaveProperty('height')
      expect(sheet).toHaveProperty('thickness')
    }
  })

  test('[GET] /sheets — filter by materialId + clientId + type', async () => {
    const materialTarget = await materialFactory.makePrismaMaterial({ name: 'Material Alvo' })
    const materialNoise = await materialFactory.makePrismaMaterial({ name: 'Material Ruido' })
    const clientTarget = await clientFactory.makePrismaClient({ name: 'Cliente Alvo' })

    await sheetFactory.makePrismaSheet({ materialId: materialTarget.id, clientId: clientTarget.id, type: 'STANDARD' })
    await sheetFactory.makePrismaSheet({ materialId: materialNoise.id })
    await sheetFactory.makePrismaSheet({ materialId: materialTarget.id, type: 'SCRAP' })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ materialId: materialTarget.id.toString(), clientId: clientTarget.id.toString(), type: 'STANDARD' })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets).toHaveLength(1)
    expect(response.body.sheets[0]).toEqual(
      expect.objectContaining({
        materialId: materialTarget.id.toString(),
        type: 'STANDARD',
        client: expect.objectContaining({ id: clientTarget.id.toString(), name: 'Cliente Alvo' })
      }),
    )
  })

  test('[GET] /sheets — filter by materials csv', async () => {
    const matA = await materialFactory.makePrismaMaterial({ name: 'AÇO INOX 304' })
    const matB = await materialFactory.makePrismaMaterial({ name: 'AÇO CARBONO' })
    const matC = await materialFactory.makePrismaMaterial({ name: 'ALUMÍNIO' })

    await sheetFactory.makePrismaSheet({ materialId: matA.id })
    await sheetFactory.makePrismaSheet({ materialId: matA.id })
    await sheetFactory.makePrismaSheet({ materialId: matB.id })
    await sheetFactory.makePrismaSheet({ materialId: matC.id })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ materials: 'AÇO INOX 304,AÇO CARBONO' })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets.length).toBeGreaterThanOrEqual(3)
    for (const sheet of response.body.sheets) {
      expect(['AÇO INOX 304', 'AÇO CARBONO']).toContain(sheet.material.name)
    }
  })

  test('[GET] /sheets — filter by thicknesses csv', async () => {
    const mat = await materialFactory.makePrismaMaterial()

    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 2.0 })
    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 4.75 })
    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 8.0 })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ thicknesses: '2,4.75', materialId: mat.id.toString() })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets).toHaveLength(2)
    for (const sheet of response.body.sheets) {
      expect([2.0, 4.75]).toContain(sheet.thickness)
    }
  })

  test('[GET] /sheets — free text search by material name', async () => {
    const matInox = await materialFactory.makePrismaMaterial({ name: 'AÇO INOX 316L' })
    const matOutro = await materialFactory.makePrismaMaterial({ name: 'COBRE' })

    await sheetFactory.makePrismaSheet({ materialId: matInox.id })
    await sheetFactory.makePrismaSheet({ materialId: matOutro.id })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ search: 'inox 316' })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets.length).toBeGreaterThanOrEqual(1)
    for (const sheet of response.body.sheets) {
      expect(sheet.material.name.toLowerCase()).toContain('inox')
    }
  })

  test('[GET] /sheets — tokenized search "inox 2" matches inox sheets with thickness=2', async () => {
    const matInox = await materialFactory.makePrismaMaterial({ name: 'AÇO INOX 304 T2' })

    await sheetFactory.makePrismaSheet({ materialId: matInox.id, thickness: 2.0 })
    await sheetFactory.makePrismaSheet({ materialId: matInox.id, thickness: 4.0 })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ search: 'inox 2' })
      .send()

    expect(response.statusCode).toBe(200)
    const inox2 = response.body.sheets.filter(
      (s: { material: { name: string }; thickness: number }) =>
        s.material.name.toLowerCase().includes('inox') && s.thickness === 2
    )
    expect(inox2.length).toBeGreaterThanOrEqual(1)
  })

  test('[GET] /sheets — pagination with perPage + page', async () => {
    const mat = await materialFactory.makePrismaMaterial()

    for (let i = 0; i < 5; i++) {
      await sheetFactory.makePrismaSheet({ materialId: mat.id })
    }

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ perPage: '3', page: '1', materialId: mat.id.toString() })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.sheets).toHaveLength(3)
    expect(response.body.meta).toMatchObject({ page: 1, perPage: 3 })
    expect(response.body.meta.total).toBeGreaterThanOrEqual(5)
    expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(2)
  })

  test('[GET] /sheets — sort by thickness asc', async () => {
    const mat = await materialFactory.makePrismaMaterial()

    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 8.0 })
    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 1.0 })
    await sheetFactory.makePrismaSheet({ materialId: mat.id, thickness: 4.0 })

    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ sortBy: 'thickness', sortOrder: 'asc', materialId: mat.id.toString() })
      .send()

    expect(response.statusCode).toBe(200)
    const thicknesses = response.body.sheets.map((s: { thickness: number }) => s.thickness)
    for (let i = 1; i < thicknesses.length; i++) {
      expect(thicknesses[i]).toBeGreaterThanOrEqual(thicknesses[i - 1])
    }
  })

  test('[GET] /sheets — 400 on invalid sortBy', async () => {
    const response = await request(app.getHttpServer())
      .get('/sheets')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ sortBy: 'invalid_column' })
      .send()

    expect(response.statusCode).toBe(400)
  })
})
