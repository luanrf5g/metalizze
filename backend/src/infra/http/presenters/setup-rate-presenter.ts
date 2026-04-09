import { SetupRate } from "@/domain/enterprise/entities/setup-rate";

export class SetupRatePresenter {
  static toHTTP(setupRate: SetupRate) {
    return {
      id: setupRate.id.toString(),
      name: setupRate.name,
      pricePerHour: setupRate.pricePerHour,
      isActive: setupRate.isActive,
      createdAt: setupRate.createdAt,
      updatedAt: setupRate.updatedAt
    }
  }
}
