import { AdditionalService } from "@/domain/enterprise/entities/additional-service";

export class AdditionalServicePresenter {
  static toHTTP(service: AdditionalService) {
    return {
      id: service.id.toString(),
      type: service.type,
      name: service.name,
      unitLabel: service.unitLabel,
      pricePerUnit: service.pricePerUnit,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
  }
}
