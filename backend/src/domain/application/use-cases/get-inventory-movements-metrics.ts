import { Either, right } from "@/core/logic/Either";
import { DashboardInventoryMovementsMetrics, MetricsRepository } from "../repositories/metrics-repository";
import { Injectable } from "@nestjs/common";

type GetInventoryMovementsMetricsResponse = Either<
  null,
  {
    metrics: DashboardInventoryMovementsMetrics[]
  }
>

@Injectable()
export class GetInventoryMovementsMetricsUseCase {
  constructor(private metricsDashboard: MetricsRepository) { }

  async execute(): Promise<GetInventoryMovementsMetricsResponse> {
    const metrics = await this.metricsDashboard.getDashboardInventoryMovementsMetrics()

    return right({
      metrics
    })
  }
}