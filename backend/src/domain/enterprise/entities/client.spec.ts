import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Client } from "./client"

describe('Client entity', () => {
  it('should be able to create a new client', () => {
    const client = Client.create({
      name: 'John Doe',
      document: '12345678900',
      email: 'johndoe@example.com',
      phone: '81999999999'
    })

    expect(client).toBeTruthy()
    expect(client.id).toBeTruthy()
    expect(client.document).toEqual('12345678900')
  })

  it('should be able to create a new client with specific id', () => {
    const clientId = new UniqueEntityId('id-existent')

    const client = Client.create({
      name: 'John doe',
      document: '12345678900',
      email: 'johndoe@example.com',
      phone: '81999999999'
    }, clientId)

    expect(client.id).toEqual(clientId)
  })
})