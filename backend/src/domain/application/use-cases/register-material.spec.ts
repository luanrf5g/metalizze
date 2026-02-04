import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { RegisterMaterialUseCase } from "./register-material";
import { MaterialAlreadyExistsError } from "./errors/material-already-exists-error";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository
let sut: RegisterMaterialUseCase // sut: System Under Test

describe('Register material Use Case', () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository()
    sut = new RegisterMaterialUseCase(inMemoryMaterialsRepository)
  })

  it('should be able to register a new material', async () => {
    const result = await sut.execute({
      name: 'Aço Carbono'
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryMaterialsRepository.items[0].name).toEqual('Aço Carbono')
  })

  it('should not be able to register a material with same name', async () => {
    const materialName = 'Inox 304'
    await sut.execute({ name: materialName })

    const result = await sut.execute({ name: materialName })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MaterialAlreadyExistsError)
  })
})