import { GetDashboardCardsMetricsUseCase } from './get-dashboard-cards-metrics'

describe('Get Dashboard Cards Metrics Use Case', () => {
  it('should return dashboard metrics from analytics service', async () => {
    const analyticsService = {
      getDashboardMetrics: vi.fn().mockResolvedValue({
        role: 'ADMIN',
        summary: { totalInventoryUnits: 12 },
      }),
    }

    const sut = new GetDashboardCardsMetricsUseCase(analyticsService as any)

    const result = await sut.execute('ADMIN')

    expect(analyticsService.getDashboardMetrics).toHaveBeenCalledWith('ADMIN')
    expect(result.value).toEqual({
      cardsMetrics: {
        role: 'ADMIN',
        summary: { totalInventoryUnits: 12 },
      },
    })
  })
})