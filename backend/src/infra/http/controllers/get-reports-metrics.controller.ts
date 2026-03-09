import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetReportsMetricsUseCase } from '@/domain/application/use-cases/get-reports-metrics';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';

@Controller('/metrics/reports')
@UseGuards(JwtAuthGuard)
export class GetReportsMetricsController {
    constructor(private getReportsMetrics: GetReportsMetricsUseCase) { }

    @Get()
    async handle() {
        const result = await this.getReportsMetrics.execute();

        if (result.isLeft()) {
            throw new Error('Unexpected error occurred');
        }

        return {
            metrics: result.value.metrics,
        };
    }
}
