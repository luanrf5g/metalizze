import { Either, right } from '@/core/logic/Either'
import { Injectable } from '@nestjs/common'
import { AnalyticsService } from '../services/analytics.service'

type GetDashboardCardsMetricsResponse = Either<
  null,
  {
    cardsMetrics: Awaited<ReturnType<AnalyticsService['getDashboardMetrics']>>
  }
>

@Injectable()
export class GetDashboardCardsMetricsUseCase {
  constructor(private analyticsService: AnalyticsService) { }

  async execute(role: 'ADMIN' | 'OPERATOR' | 'VIEWER'): Promise<GetDashboardCardsMetricsResponse> {
    const cardsMetrics = await this.analyticsService.getDashboardMetrics(role)

    return right({
      cardsMetrics,
    })
  }
}