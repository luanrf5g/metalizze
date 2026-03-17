import { GetInventoryMovementsMetricsUseCase } from './get-inventory-movements-metrics'

describe('Get Inventory Movements Metrics Use Case', () => {
  it('should return grouped inventory metrics from repository', async () => {
    const metricsRepository = {
      getDashboardInventoryMovementsMetrics: vi.fn().mockResolvedValue([
        { date: '2026-03-01', entries: 10, exits: 3 },
      ]),
    }

    const sut = new GetInventoryMovementsMetricsUseCase(metricsRepository as any)

    const result = await sut.execute()

    expect(metricsRepository.getDashboardInventoryMovementsMetrics).toHaveBeenCalled()
    expect(result.value).toEqual({
      metrics: [{ date: '2026-03-01', entries: 10, exits: 3 }],
    })
  })
})