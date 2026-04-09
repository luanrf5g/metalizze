import { AdditionalService, AdditionalServiceType } from "@/domain/enterprise/entities/additional-service";

export abstract class AdditionalServicesRepository {
  abstract create(service: AdditionalService): Promise<void>
  abstract findById(id: string): Promise<AdditionalService | null>
  abstract findByTypeAndName(
    type: AdditionalServiceType,
    name: string
  ): Promise<AdditionalService | null>
  abstract findAll(params?: { includeInactive?: boolean }): Promise<AdditionalService[]>
  abstract save(service: AdditionalService): Promise<void>
  abstract toggleActive(id: string, isActive: boolean): Promise<void>
}
