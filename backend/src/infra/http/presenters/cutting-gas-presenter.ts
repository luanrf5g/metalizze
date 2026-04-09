import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";

export class CuttingGasPresenter {
  static toHTTP(cuttingGas: CuttingGas) {
    return {
      id: cuttingGas.id.toString(),
      name: cuttingGas.name,
      pricePerHour: cuttingGas.pricePerHour,
      isActive: cuttingGas.isActive,
      createdAt: cuttingGas.createdAt,
      updatedAt: cuttingGas.updatedAt
    }
  }
}