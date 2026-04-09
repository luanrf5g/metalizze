import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";

export abstract class CuttingGasRepository {
  abstract create(gas: CuttingGas): Promise<void>
  abstract findById(id: string): Promise<CuttingGas | null>
  abstract findByName(name: string): Promise<CuttingGas | null>
  abstract findAll(params?: { includeInactive?: boolean }): Promise<CuttingGas[]>
  abstract save(gas: CuttingGas): Promise<void>
  abstract toggleActive(id: string, isActive: boolean): Promise<CuttingGas | null>
}