import { v4 as uuid } from 'uuid'

export class UniqueEntityId {
  private value: string

  toValue() {
    return this.value
  }

  toString() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? uuid();
  }

  public equals(id: UniqueEntityId) {
    return id.toValue() === this.value
  }
}