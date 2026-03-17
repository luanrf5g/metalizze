import { GetReportsMetricsUseCase } from './get-reports-metrics'

describe('Get Reports Metrics Use Case', () => {
  it('should return report metrics from analytics service', async () => {
    const analyticsService = {
      getReportsMetrics: vi.fn().mockResolvedValue({
        selectedPeriod: { key: '30d' },
      }),
    }

    const sut = new GetReportsMetricsUseCase(analyticsService as any)

    const result = await sut.execute('30d')

    expect(analyticsService.getReportsMetrics).toHaveBeenCalledWith('30d')
    expect(result.value).toEqual({
      metrics: {
        selectedPeriod: { key: '30d' },
      },
    })
  })
})