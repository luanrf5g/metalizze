import { GetDashboardCardsMetricsUseCase } from '@/domain/application/use-cases/get-dashboard-cards-metrics'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { UserPayload } from '@/infra/auth/decorators/current-user.decorator'
import { BadRequestException, Controller, Get } from '@nestjs/common'

@Controller('/metrics/cards')
export class GetDashboardMetricsController {
  constructor(private getDashboardCardsMetrics: GetDashboardCardsMetricsUseCase) { }

  @Get()
  async handle(@CurrentUser() userPayload: UserPayload) {
    const role = userPayload.role as 'ADMIN' | 'OPERATOR' | 'VIEWER'
    const result = await this.getDashboardCardsMetrics.execute(role)

    if (result.isLeft()) {
      throw new BadRequestException('Unexpected error while fetching metrics')
    }

    const metrics = result.value.cardsMetrics

    return {
      metrics,
    }
  }
}