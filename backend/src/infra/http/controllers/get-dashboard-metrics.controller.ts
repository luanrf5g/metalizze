import { GetDashboardMetricsUseCase } from "@/domain/application/use-cases/get-dashboard-metrics";
import { BadRequestException, Controller, Get } from "@nestjs/common";

@Controller('/metrics')
export class GetDashboardMetricsController {
  constructor(private getDashboardMetrics: GetDashboardMetricsUseCase) { }

  @Get()
  async handle() {
    const result = await this.getDashboardMetrics.execute()

    if (result.isLeft()) {
      throw new BadRequestException("Unexpected error white fetching metrics")
    }

    const metrics = result.value.metrics

    return {
      metrics: {
        totalStandardSheets: metrics.totalStandardSheets,
        totalScrapsSheets: metrics.totalScrapsSheets,
        totalMaterials: metrics.totalMaterials,
        totalClients: metrics.totalClients
      }
    }
  }
}