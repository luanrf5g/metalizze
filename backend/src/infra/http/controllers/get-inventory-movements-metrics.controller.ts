import { GetInventoryMovementsMetricsUseCase } from "@/domain/application/use-cases/get-inventory-movements-metrics";
import { BadRequestException, Controller, Get } from "@nestjs/common";

@Controller('/metrics/inventory-movements')
export class GetInventoryMovementsMetricsController {
  constructor(private getInventoryMovementsMetrics: GetInventoryMovementsMetricsUseCase) { }

  @Get()
  async handle() {
    const result = await this.getInventoryMovementsMetrics.execute()

    if (result.isLeft()) {
      throw new BadRequestException("Unexpected error white fetching metrics for inventory movements")
    }

    const metrics = result.value.metrics

    return {
      metrics
    }
  }
}