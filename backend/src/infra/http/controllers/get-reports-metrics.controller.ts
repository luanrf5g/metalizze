import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { GetReportsMetricsUseCase } from '@/domain/application/use-cases/get-reports-metrics'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import type { ReportPeriod } from '@/domain/application/services/analytics.service'

const validPeriods = new Set<ReportPeriod>(['7d', '30d', '90d', '180d', '365d'])

@Controller('/metrics/reports')
@UseGuards(JwtAuthGuard)
export class GetReportsMetricsController {
    constructor(private getReportsMetrics: GetReportsMetricsUseCase) { }

    @Get()
    async handle(@Query('period') period?: string) {
        const selectedPeriod: ReportPeriod = validPeriods.has((period ?? '90d') as ReportPeriod)
            ? (period as ReportPeriod)
            : '90d'

        const result = await this.getReportsMetrics.execute(selectedPeriod)

        if (result.isLeft()) {
            throw new Error('Unexpected error occurred')
        }

        return {
            metrics: result.value.metrics,
        }
    }
}
