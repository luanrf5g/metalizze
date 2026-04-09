import { CuttingGasRepository } from "@/domain/application/repositories/cutting-gas-repository";
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";

export class InMemoryCuttingGasRepository implements CuttingGasRepository {
  public items: CuttingGas[] = []

  async create(cuttingGas: CuttingGas) {
    this.items.push(cuttingGas)
  }

  async findById(gasId: string) {
    const cuttingGas = this.items.find((item) => item.id.toString() === gasId)

    if (!cuttingGas) return null

    return cuttingGas
  }

  async findByName(gasName: string) {
    const cuttingGas = this.items.find((item) => item.name === gasName)

    if (!cuttingGas) return null

    return cuttingGas
  }

  async findAll({ includeInactive = false }: { includeInactive?: boolean }) {
    if (includeInactive) {
      return this.items
    }

    return this.items.filter((item) => item.isActive)
  }

  async save(cuttingGas: CuttingGas) {
    const itemIndex = this.items.findIndex((item) => item.id === cuttingGas.id)

    this.items[itemIndex] = cuttingGas
  }

  async toggleActive(gasId: string, isActive: boolean) {
    const cuttingGas = this.items.find((item) => item.id.toString() === gasId)

    if (!cuttingGas) return null

    cuttingGas.isActive = isActive

    return cuttingGas
  }
}