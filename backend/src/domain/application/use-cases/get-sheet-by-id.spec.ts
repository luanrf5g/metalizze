import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { GetSheetByIdUseCase } from "./get-sheet-by-id";
import { makeSheet } from "test/factories/make-sheet";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

let sheetsRepository: InMemorySheetsRepository
let sut: GetSheetByIdUseCase

describe('Get Sheet By Id Use Case', () => {
  beforeEach(() => {
    sheetsRepository = new InMemorySheetsRepository()
    sut = new GetSheetByIdUseCase(sheetsRepository)
  })

  it('should be able to get a sheet by id', async () => {
    const sheet = makeSheet()

    await sheetsRepository.create(sheet)

    const result = await sut.execute({
      id: sheet.id.toString()
    })

    expect(result.isRight())
    expect(result.value).toEqual({
      sheet: sheetsRepository.items[0]
    })
  })
})