import { SetupRate } from "@/domain/enterprise/entities/setup-rate";

export abstract class SetupRatesRepository {
  abstract create(setupRate: SetupRate): Promise<void>
  abstract findById(id: string): Promise<SetupRate | null>
  abstract findAll(params?: { includeInactive?: boolean }): Promise<SetupRate[]>
  abstract save(setupRate: SetupRate): Promise<void>
  abstract toggleActive(id: string, isActive: boolean): Promise<void>
}
