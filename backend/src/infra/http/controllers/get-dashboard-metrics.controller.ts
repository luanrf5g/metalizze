import { GetDashboardCardsMetricsUseCase } from "@/domain/application/use-cases/get-dashboard-cards-metrics";
import { BadRequestException, Controller, Get } from "@nestjs/common";

@Controller('/metrics/cards')
export class GetDashboardMetricsController {
  constructor(private getDashboardCardsMetrics: GetDashboardCardsMetricsUseCase) { }

  @Get()
  async handle() {
    const result = await this.getDashboardCardsMetrics.execute()

    if (result.isLeft()) {
      throw new BadRequestException("Unexpected error white fetching metrics")
    }

    const metrics = result.value.cardsMetrics

    return {
      metrics: {
        totalStandardSheets: metrics.totalStandardSheets,
        totalScrapSheets: metrics.totalScrapSheets,
        totalMaterials: metrics.totalMaterials,
        totalClients: metrics.totalClients
      }
    }
  }
}