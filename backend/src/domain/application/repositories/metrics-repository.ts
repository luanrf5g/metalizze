export interface DashboardCardsMetrics {
  totalStandardSheets: number,
  totalScrapSheets: number,
  totalMaterials: number,
  totalClients: number
}

export interface DashboardInventoryMovementsMetrics {
  date: string,
  entries: number,
  exits: number
}

export abstract class MetricsRepository {
  abstract getDashboardCardsMetrics(): Promise<DashboardCardsMetrics>
  abstract getDashboardInventoryMovementsMetrics(days?: number): Promise<DashboardInventoryMovementsMetrics[]>
}