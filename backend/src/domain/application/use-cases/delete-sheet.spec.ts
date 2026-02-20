import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { DeleteSheetUseCase } from "./delete-sheet";
import { makeSheet } from "test/factories/make-sheet";

let sheetsRepository: InMemorySheetsRepository
let sut: DeleteSheetUseCase

describe('Delete Sheet Use Case', () => {
  beforeEach(() => {
    sheetsRepository = new InMemorySheetsRepository()
    sut = new DeleteSheetUseCase(sheetsRepository)
  })

  it('should be able to delete a sheet', async () => {
    const sheet = makeSheet()
    const sheetId = sheet.id.toString()
    await sheetsRepository.create(sheet)

    expect(sheetsRepository.items).toHaveLength(1)

    const result = await sut.execute({ sheetId })

    expect(result.isRight()).toBeTruthy()
    expect(sheetsRepository.items[0].deletedAt).toBeTruthy()
  })
})