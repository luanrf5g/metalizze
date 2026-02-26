import { Either, right } from "@/core/logic/Either";
import { DashboardMetrics, MetricsRepository } from "../repositories/metrics-repository";
import { Injectable } from "@nestjs/common";

type GetDashboardMetricsResponde = Either<
  null,
  {
    metrics: DashboardMetrics
  }
>

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(private metricsRepository: MetricsRepository) { }

  async execute(): Promise<GetDashboardMetricsResponde> {
    const metrics = await this.metricsRepository.getDashboardMetrics();

    return right({
      metrics
    })
  }
}