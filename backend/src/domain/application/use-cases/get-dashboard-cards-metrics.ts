import { Either, right } from "@/core/logic/Either";
import { DashboardCardsMetrics, MetricsRepository } from "../repositories/metrics-repository";
import { Injectable } from "@nestjs/common";

type GetDashboardCardsMetricsResponde = Either<
  null,
  {
    cardsMetrics: DashboardCardsMetrics
  }
>

@Injectable()
export class GetDashboardCardsMetricsUseCase {
  constructor(private metricsRepository: MetricsRepository) { }

  async execute(): Promise<GetDashboardCardsMetricsResponde> {
    const cardsMetrics = await this.metricsRepository.getDashboardCardsMetrics();

    return right({
      cardsMetrics
    })
  }
}