export interface DashboardMetrics {
  totalStandardSheets: number,
  totalScrapsSheets: number,
  totalMaterials: number,
  totalClients: number
}

export abstract class MetricsRepository {
  abstract getDashboardMetrics(): Promise<DashboardMetrics>
}