import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { EditMaterialUseCase } from "./edit-material";
import { makeMaterial } from "test/factories/make-material";

let materialsRepository: InMemoryMaterialsRepository
let sut: EditMaterialUseCase

describe('Edit Material Use Case', () => {
  beforeEach(() => {
    materialsRepository = new InMemoryMaterialsRepository()
    sut = new EditMaterialUseCase(materialsRepository)
  })

  it('should be able to edit a material and update a Slug', async () => {
    const material = makeMaterial({ name: 'aço carbono' })

    await materialsRepository.create(material)

    expect(material.slug.value).toBe('aco-carbono')

    const response = await sut.execute({
      materialId: material.id.toString(),
      name: 'Aço Inox'
    })

    expect(response.isRight()).toBeTruthy()
    expect(materialsRepository.items[0]).toMatchObject({
      props: {
        name: 'Aço Inox',
        slug: {
          value: 'aco-inox'
        }
      }
    })
  })
})