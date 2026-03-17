import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/logic/Either'
import { AnalyticsService, type ReportPeriod } from '../services/analytics.service'

type GetReportsMetricsResponse = Either<
    null,
    {
        metrics: Awaited<ReturnType<AnalyticsService['getReportsMetrics']>>
    }
>

@Injectable()
export class GetReportsMetricsUseCase {
    constructor(private analyticsService: AnalyticsService) { }

    async execute(period: ReportPeriod = '90d'): Promise<GetReportsMetricsResponse> {
        const metrics = await this.analyticsService.getReportsMetrics(period)

        return right({
            metrics,
        })
    }
}
