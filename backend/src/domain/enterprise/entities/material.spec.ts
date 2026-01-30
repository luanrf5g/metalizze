import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Material } from "./material"

describe('Material Entity', () => {
  it('should be able to create a new material', () => {
    const material = Material.create({
      name: 'Aço Inox',
    })

    expect(material).toBeTruthy()
    expect(material.id).toBeTruthy()
    expect(material.name).toEqual('Aço Inox')
  })

  it('should be able to create a new material with a specific ID', () => {
    const id = new UniqueEntityId('id-existente')

    const material = Material.create(
      {
        name: 'Alumínio',
      },
      id
    )

    expect(material.id).toEqual(id)
  })
})