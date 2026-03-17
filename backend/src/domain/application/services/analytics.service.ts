import { Injectable } from '@nestjs/common'
import { Prisma, SheetType } from '@prisma/client'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'
export type ReportPeriod = '7d' | '30d' | '90d' | '180d' | '365d'

const REPORT_PERIODS: Record<ReportPeriod, { days: number; label: string }> = {
  '7d': { days: 7, label: 'Últimos 7 dias' },
  '30d': { days: 30, label: 'Últimos 30 dias' },
  '90d': { days: 90, label: 'Últimos 90 dias' },
  '180d': { days: 180, label: 'Últimos 180 dias' },
  '365d': { days: 365, label: 'Últimos 12 meses' },
}

type StockSheetRecord = {
  id: string
  sku: string
  type: SheetType
  quantity: number
  price: number | null
  createdAt: Date
  deletedAt: Date | null
  material: {
    name: string
  }
  client: {
    id: string
    name: string
  } | null
}

type TrendSheetRecord = {
  quantity: number
  price: number | null
  type: SheetType
  createdAt: Date
  deletedAt: Date | null
  movements: Array<{
    type: 'ENTRY' | 'EXIT'
    quantity: number
    createdAt: Date
  }>
}

const GENERATED_SCRAP_PREFIX = 'Retalho gerado do corte da chapa mãe:'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardMetrics(role: UserRole) {
    const now = new Date()
    const currentWeekStart = this.getStartOfWeek(now)
    const previousWeekStart = this.addDays(currentWeekStart, -7)

    const [stockSheets, recentCutOrders, clientOwnedCutMovements, weeklyMetrics] = await Promise.all([
      this.getStockSheets(),
      this.getRecentCutOrders(8),
      this.getClientOwnedCutMovements(),
      this.getWeeklyOperationsSnapshot(currentWeekStart, previousWeekStart, now),
    ])

    return {
      role,
      summary: this.buildStockSummary(stockSheets, role),
      weekly: {
        ...weeklyMetrics,
        clientsWithCutOrdersCurrentWeek: this.countDistinctClients(
          clientOwnedCutMovements.filter((movement) => movement.createdAt >= currentWeekStart),
        ),
      },
      materialSnapshot: this.buildMaterialSnapshot(stockSheets).slice(0, 6),
      clientsWithOwnedSheetOrders: this.buildClientOrders(clientOwnedCutMovements).slice(0, 5),
      recentCutOrders,
    }
  }

  async getReportsMetrics(period: ReportPeriod = '90d') {
    const now = new Date()
    const periodConfig = REPORT_PERIODS[period]
    const periodStart = this.getRollingPeriodStart(now, periodConfig.days)
    const currentWeekStart = this.getStartOfWeek(now)
    const previousWeekStart = this.addDays(currentWeekStart, -7)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const trendStart = periodStart

    const [
      stockSheets,
      trendSheets,
      recentCutOrders,
      clientOwnedCutMovements,
      selectedPeriodComparison,
      weeklyComparison,
      monthlySnapshot,
      allTimeTotals,
      operationalTrend,
      materialPerformance,
    ] = await Promise.all([
      this.getStockSheets(),
      this.getTrendSheets(trendStart),
      this.getRecentCutOrders(this.getRecentOrdersLimit(periodConfig.days), periodStart),
      this.getClientOwnedCutMovements(periodStart),
      this.getPeriodOperationsSnapshot(periodConfig.days, now),
      this.getWeeklyOperationsSnapshot(currentWeekStart, previousWeekStart, now),
      this.getMonthlyOperationsSnapshot(currentMonthStart, now),
      this.getAllTimeTotals(),
      this.getOperationalTrend(periodConfig.days, now),
      this.getMaterialPerformance(periodStart),
    ])

    const stockSummary = this.buildStockSummary(stockSheets, 'ADMIN')
    const clientBreakdown = this.buildClientOrders(clientOwnedCutMovements)

    return {
      selectedPeriod: {
        key: period,
        label: periodConfig.label,
        days: periodConfig.days,
        startDate: periodStart.toISOString(),
        endDate: now.toISOString(),
      },
      overview: {
        totalStockValue: stockSummary.totalStockValue ?? 0,
        standardStockValue: stockSummary.standardStockValue,
        scrapStockValue: stockSummary.scrapStockValue,
        totalStandardSheets: stockSummary.totalStandardSheets,
        totalScrapSheets: stockSummary.totalScrapSheets,
        totalInventoryUnits: stockSummary.totalInventoryUnits,
        totalMaterials: stockSummary.totalMaterials,
        totalClients: stockSummary.totalClients,
        lowStockSheets: stockSummary.lowStockSheets,
        ownedSheetsInStock: stockSummary.ownedSheetsInStock,
      },
      periodComparison: selectedPeriodComparison,
      weeklyComparison,
      monthlySnapshot,
      totals: {
        ...allTimeTotals,
        clientsWithOwnedSheetOrders: clientBreakdown.length,
        ownedSheetCutOrders: clientBreakdown.reduce((acc, client) => acc + client.cutOrders, 0),
      },
      charts: {
        stockValueTrend: this.buildStockValueTrendByPeriod(trendSheets, periodConfig.days, now),
        operationalTrend,
        materialPerformance: materialPerformance.slice(0, 8),
      },
      topClients: clientBreakdown.slice(0, 6),
      recentCutOrders,
    }
  }

  private async getStockSheets(): Promise<StockSheetRecord[]> {
    return this.prisma.sheet.findMany({
      where: {
        deletedAt: null,
        quantity: {
          gt: 0,
        },
      },
      select: {
        id: true,
        sku: true,
        type: true,
        quantity: true,
        price: true,
        createdAt: true,
        deletedAt: true,
        material: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  private async getTrendSheets(startDate: Date): Promise<TrendSheetRecord[]> {
    return this.prisma.sheet.findMany({
      where: {
        createdAt: {
          lte: new Date(),
        },
        OR: [
          { deletedAt: null },
          {
            deletedAt: {
              gte: startDate,
            },
          },
        ],
      },
      select: {
        quantity: true,
        price: true,
        type: true,
        createdAt: true,
        deletedAt: true,
        movements: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            type: true,
            quantity: true,
            createdAt: true,
          },
        },
      },
    })
  }

  private async getRecentCutOrders(limit: number, startDate?: Date) {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        type: 'EXIT',
        createdAt: startDate
          ? {
            gte: startDate,
          }
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        description: true,
        sheet: {
          select: {
            sku: true,
            type: true,
            material: {
              select: {
                name: true,
              },
            },
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return movements.map((movement) => ({
      id: movement.id,
      createdAt: movement.createdAt.toISOString(),
      quantity: movement.quantity,
      description: movement.description,
      sheetSku: movement.sheet.sku,
      sheetType: movement.sheet.type,
      materialName: movement.sheet.material.name,
      clientName: movement.sheet.client?.name ?? null,
    }))
  }

  private async getClientOwnedCutMovements(startDate?: Date) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        type: 'EXIT',
        createdAt: startDate
          ? {
            gte: startDate,
          }
          : undefined,
        sheet: {
          type: 'STANDARD',
          clientId: {
            not: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        quantity: true,
        sheet: {
          select: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  }

  private async getWeeklyOperationsSnapshot(currentWeekStart: Date, previousWeekStart: Date, now: Date) {
    const [cutOrders, sheetsConsumed, scrapsGenerated, scrapsReused] = await Promise.all([
      this.getMovementCountComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentWeekStart,
            lte: now,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousWeekStart,
            lt: currentWeekStart,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentWeekStart,
            lte: now,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousWeekStart,
            lt: currentWeekStart,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'ENTRY',
          createdAt: {
            gte: currentWeekStart,
            lte: now,
          },
          sheet: {
            type: 'SCRAP',
          },
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
        },
        {
          type: 'ENTRY',
          createdAt: {
            gte: previousWeekStart,
            lt: currentWeekStart,
          },
          sheet: {
            type: 'SCRAP',
          },
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentWeekStart,
            lte: now,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousWeekStart,
            lt: currentWeekStart,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
      ),
    ])

    return {
      cutOrdersCurrentWeek: cutOrders.current,
      cutOrdersComparedToLastWeek: cutOrders.change,
      sheetsConsumedCurrentWeek: sheetsConsumed.current,
      sheetsConsumedComparedToLastWeek: sheetsConsumed.change,
      scrapsGeneratedCurrentWeek: scrapsGenerated.current,
      scrapsGeneratedComparedToLastWeek: scrapsGenerated.change,
      scrapsReusedCurrentWeek: scrapsReused.current,
      scrapsReusedComparedToLastWeek: scrapsReused.change,
    }
  }

  private async getPeriodOperationsSnapshot(periodDays: number, now: Date) {
    const currentStart = this.getRollingPeriodStart(now, periodDays)
    const previousStart = this.addDays(currentStart, -periodDays)

    const [cutOrders, sheetsConsumed, scrapsGenerated, scrapsReused] = await Promise.all([
      this.getMovementCountComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentStart,
            lte: now,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentStart,
            lte: now,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'ENTRY',
          createdAt: {
            gte: currentStart,
            lte: now,
          },
          sheet: {
            type: 'SCRAP',
          },
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
        },
        {
          type: 'ENTRY',
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
          sheet: {
            type: 'SCRAP',
          },
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
        },
      ),
      this.getMovementQuantityComparison(
        {
          type: 'EXIT',
          createdAt: {
            gte: currentStart,
            lte: now,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
        {
          type: 'EXIT',
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
      ),
    ])

    return {
      cutOrders: cutOrders.current,
      cutOrdersComparedToPreviousPeriod: cutOrders.change,
      sheetsConsumed: sheetsConsumed.current,
      sheetsConsumedComparedToPreviousPeriod: sheetsConsumed.change,
      scrapsGenerated: scrapsGenerated.current,
      scrapsGeneratedComparedToPreviousPeriod: scrapsGenerated.change,
      scrapsReused: scrapsReused.current,
      scrapsReusedComparedToPreviousPeriod: scrapsReused.change,
    }
  }

  private async getMonthlyOperationsSnapshot(currentMonthStart: Date, now: Date) {
    const [cutOrdersThisMonth, sheetsConsumedThisMonth, scrapsGeneratedThisMonth, scrapsReusedThisMonth] = await Promise.all([
      this.prisma.inventoryMovement.count({
        where: {
          type: 'EXIT',
          createdAt: {
            gte: currentMonthStart,
            lte: now,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
      }),
      this.sumMovementQuantity({
        type: 'EXIT',
        createdAt: {
          gte: currentMonthStart,
          lte: now,
        },
        sheet: {
          type: 'STANDARD',
        },
      }),
      this.sumMovementQuantity({
        type: 'ENTRY',
        createdAt: {
          gte: currentMonthStart,
          lte: now,
        },
        sheet: {
          type: 'SCRAP',
        },
        description: {
          startsWith: GENERATED_SCRAP_PREFIX,
        },
      }),
      this.sumMovementQuantity({
        type: 'EXIT',
        createdAt: {
          gte: currentMonthStart,
          lte: now,
        },
        sheet: {
          type: 'SCRAP',
        },
      }),
    ])

    return {
      cutOrdersThisMonth,
      sheetsConsumedThisMonth,
      scrapsGeneratedThisMonth,
      scrapsReusedThisMonth,
    }
  }

  private async getAllTimeTotals() {
    const [totalCutOrders, totalSheetsConsumed, totalScrapsGenerated, totalScrapsReused] = await Promise.all([
      this.prisma.inventoryMovement.count({
        where: {
          type: 'EXIT',
          sheet: {
            type: 'STANDARD',
          },
        },
      }),
      this.sumMovementQuantity({
        type: 'EXIT',
        sheet: {
          type: 'STANDARD',
        },
      }),
      this.sumMovementQuantity({
        type: 'ENTRY',
        sheet: {
          type: 'SCRAP',
        },
        description: {
          startsWith: GENERATED_SCRAP_PREFIX,
        },
      }),
      this.sumMovementQuantity({
        type: 'EXIT',
        sheet: {
          type: 'SCRAP',
        },
      }),
    ])

    return {
      totalCutOrders,
      totalSheetsConsumed,
      totalScrapsGenerated,
      totalScrapsReused,
    }
  }

  private async getOperationalTrend(periodDays: number, now: Date) {
    const startDate = this.getRollingPeriodStart(now, periodDays)
    const useDailyBuckets = periodDays <= 31

    const [standardExits, generatedScrapEntries, scrapExits] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'EXIT',
          createdAt: {
            gte: startDate,
          },
          sheet: {
            type: 'STANDARD',
          },
        },
        select: {
          createdAt: true,
          quantity: true,
        },
      }),
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'ENTRY',
          createdAt: {
            gte: startDate,
          },
          sheet: {
            type: 'SCRAP',
          },
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
        },
        select: {
          createdAt: true,
          quantity: true,
        },
      }),
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'EXIT',
          createdAt: {
            gte: startDate,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
        select: {
          createdAt: true,
          quantity: true,
        },
      }),
    ])

    const buckets = this.createTrendBuckets(startDate, now, useDailyBuckets)

    for (const movement of standardExits) {
      const bucketIndex = this.getTrendBucketIndex(movement.createdAt, startDate, now, useDailyBuckets)
      if (bucketIndex < 0) continue
      buckets[bucketIndex].orders += 1
      buckets[bucketIndex].sheetsConsumed += movement.quantity
    }

    for (const movement of generatedScrapEntries) {
      const bucketIndex = this.getTrendBucketIndex(movement.createdAt, startDate, now, useDailyBuckets)
      if (bucketIndex < 0) continue
      buckets[bucketIndex].scrapsGenerated += movement.quantity
    }

    for (const movement of scrapExits) {
      const bucketIndex = this.getTrendBucketIndex(movement.createdAt, startDate, now, useDailyBuckets)
      if (bucketIndex < 0) continue
      buckets[bucketIndex].scrapsReused += movement.quantity
    }

    return buckets
  }

  private async getMaterialPerformance(startDate?: Date) {
    const [stockSheets, standardExits, generatedScrapEntries, scrapExits] = await Promise.all([
      this.getStockSheets(),
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'EXIT',
          createdAt: startDate
            ? {
              gte: startDate,
            }
            : undefined,
          sheet: {
            type: 'STANDARD',
          },
        },
        select: {
          quantity: true,
          sheet: {
            select: {
              material: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'ENTRY',
          createdAt: startDate
            ? {
              gte: startDate,
            }
            : undefined,
          description: {
            startsWith: GENERATED_SCRAP_PREFIX,
          },
          sheet: {
            type: 'SCRAP',
          },
        },
        select: {
          quantity: true,
          sheet: {
            select: {
              material: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.inventoryMovement.findMany({
        where: {
          type: 'EXIT',
          createdAt: startDate
            ? {
              gte: startDate,
            }
            : undefined,
          sheet: {
            type: 'SCRAP',
          },
        },
        select: {
          quantity: true,
          sheet: {
            select: {
              material: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ])

    const materials = new Map<string, {
      name: string
      stockValue: number
      standardSheets: number
      scrapSheets: number
      sheetsConsumed: number
      scrapsGenerated: number
      scrapsReused: number
    }>()

    const ensureMaterial = (name: string) => {
      if (!materials.has(name)) {
        materials.set(name, {
          name,
          stockValue: 0,
          standardSheets: 0,
          scrapSheets: 0,
          sheetsConsumed: 0,
          scrapsGenerated: 0,
          scrapsReused: 0,
        })
      }

      return materials.get(name)!
    }

    for (const sheet of stockSheets) {
      const item = ensureMaterial(sheet.material.name)
      const stockValue = (sheet.price ?? 0) * sheet.quantity

      item.stockValue += stockValue

      if (sheet.type === 'STANDARD') {
        item.standardSheets += sheet.quantity
      } else {
        item.scrapSheets += sheet.quantity
      }
    }

    for (const movement of standardExits) {
      ensureMaterial(movement.sheet.material.name).sheetsConsumed += movement.quantity
    }

    for (const movement of generatedScrapEntries) {
      ensureMaterial(movement.sheet.material.name).scrapsGenerated += movement.quantity
    }

    for (const movement of scrapExits) {
      ensureMaterial(movement.sheet.material.name).scrapsReused += movement.quantity
    }

    return Array.from(materials.values()).sort((a, b) => {
      const scoreA = a.stockValue + a.sheetsConsumed * 5 + a.scrapsGenerated * 2
      const scoreB = b.stockValue + b.sheetsConsumed * 5 + b.scrapsGenerated * 2
      return scoreB - scoreA
    })
  }

  private buildStockSummary(stockSheets: StockSheetRecord[], role: UserRole) {
    const summary = {
      totalStandardSheets: 0,
      totalScrapSheets: 0,
      totalInventoryUnits: 0,
      totalMaterials: new Set<string>(),
      totalClients: new Set<string>(),
      standardStockValue: 0,
      scrapStockValue: 0,
      lowStockSheets: 0,
      ownedSheetsInStock: 0,
    }

    for (const sheet of stockSheets) {
      const value = (sheet.price ?? 0) * sheet.quantity

      summary.totalInventoryUnits += sheet.quantity
      summary.totalMaterials.add(sheet.material.name)

      if (sheet.client) {
        summary.totalClients.add(sheet.client.id)
        summary.ownedSheetsInStock += sheet.quantity
      }

      if (sheet.quantity > 0 && sheet.quantity <= 2) {
        summary.lowStockSheets += 1
      }

      if (sheet.type === 'STANDARD') {
        summary.totalStandardSheets += sheet.quantity
        summary.standardStockValue += value
      } else {
        summary.totalScrapSheets += sheet.quantity
        summary.scrapStockValue += value
      }
    }

    const totalStockValue = summary.standardStockValue + summary.scrapStockValue

    return {
      totalStandardSheets: summary.totalStandardSheets,
      totalScrapSheets: summary.totalScrapSheets,
      totalInventoryUnits: summary.totalInventoryUnits,
      totalMaterials: summary.totalMaterials.size,
      totalClients: summary.totalClients.size,
      totalStockValue: role === 'ADMIN' ? totalStockValue : null,
      standardStockValue: summary.standardStockValue,
      scrapStockValue: summary.scrapStockValue,
      lowStockSheets: summary.lowStockSheets,
      ownedSheetsInStock: summary.ownedSheetsInStock,
    }
  }

  private buildMaterialSnapshot(stockSheets: StockSheetRecord[]) {
    const materials = new Map<string, {
      name: string
      standardSheets: number
      scrapSheets: number
      stockValue: number
    }>()

    for (const sheet of stockSheets) {
      if (!materials.has(sheet.material.name)) {
        materials.set(sheet.material.name, {
          name: sheet.material.name,
          standardSheets: 0,
          scrapSheets: 0,
          stockValue: 0,
        })
      }

      const current = materials.get(sheet.material.name)!
      current.stockValue += (sheet.price ?? 0) * sheet.quantity

      if (sheet.type === 'STANDARD') {
        current.standardSheets += sheet.quantity
      } else {
        current.scrapSheets += sheet.quantity
      }
    }

    return Array.from(materials.values()).sort((a, b) => b.stockValue - a.stockValue)
  }

  private buildClientOrders(
    movements: Array<{
      createdAt: Date
      quantity: number
      sheet: {
        client: {
          id: string
          name: string
        } | null
      }
    }>,
  ) {
    const clients = new Map<string, { id: string; name: string; cutOrders: number; sheetsConsumed: number }>()

    for (const movement of movements) {
      if (!movement.sheet.client) continue

      if (!clients.has(movement.sheet.client.id)) {
        clients.set(movement.sheet.client.id, {
          id: movement.sheet.client.id,
          name: movement.sheet.client.name,
          cutOrders: 0,
          sheetsConsumed: 0,
        })
      }

      const current = clients.get(movement.sheet.client.id)!
      current.cutOrders += 1
      current.sheetsConsumed += movement.quantity
    }

    return Array.from(clients.values()).sort((a, b) => {
      if (b.cutOrders !== a.cutOrders) {
        return b.cutOrders - a.cutOrders
      }

      return b.sheetsConsumed - a.sheetsConsumed
    })
  }

  private buildStockValueTrendByPeriod(sheets: TrendSheetRecord[], periodDays: number, now: Date) {
    const startDate = this.getRollingPeriodStart(now, periodDays)
    const useDailyBuckets = periodDays <= 31
    const pointDates = this.createTrendPointDates(startDate, now, useDailyBuckets)

    return pointDates.map((pointDate) => {
      let totalValue = 0
      let standardValue = 0
      let scrapValue = 0

      for (const sheet of sheets) {
        const quantityAtDate = this.getSheetQuantityAtDate(sheet, pointDate)

        if (quantityAtDate <= 0) {
          continue
        }

        const value = quantityAtDate * (sheet.price ?? 0)
        totalValue += value

        if (sheet.type === 'STANDARD') {
          standardValue += value
        } else {
          scrapValue += value
        }
      }

      return {
        date: pointDate.toISOString(),
        label: useDailyBuckets ? this.formatDayLabel(pointDate) : this.formatRangeLabel(this.addDays(pointDate, -6)),
        totalValue: Number(totalValue.toFixed(2)),
        standardValue: Number(standardValue.toFixed(2)),
        scrapValue: Number(scrapValue.toFixed(2)),
      }
    })
  }

  private getSheetQuantityAtDate(sheet: TrendSheetRecord, pointDate: Date) {
    if (sheet.createdAt > pointDate) {
      return 0
    }

    if (sheet.deletedAt && sheet.deletedAt <= pointDate) {
      return 0
    }

    let quantity = sheet.quantity

    for (const movement of sheet.movements) {
      if (movement.createdAt <= pointDate) {
        continue
      }

      if (movement.type === 'ENTRY') {
        quantity -= movement.quantity
      } else {
        quantity += movement.quantity
      }
    }

    return Math.max(quantity, 0)
  }

  private countDistinctClients(
    movements: Array<{
      sheet: {
        client: {
          id: string
        } | null
      }
    }>,
  ) {
    const clients = new Set<string>()

    for (const movement of movements) {
      if (movement.sheet.client?.id) {
        clients.add(movement.sheet.client.id)
      }
    }

    return clients.size
  }

  private async getMovementCountComparison(
    currentWhere: Prisma.InventoryMovementWhereInput,
    previousWhere: Prisma.InventoryMovementWhereInput,
  ) {
    const [current, previous] = await Promise.all([
      this.prisma.inventoryMovement.count({ where: currentWhere }),
      this.prisma.inventoryMovement.count({ where: previousWhere }),
    ])

    return {
      current,
      previous,
      change: this.calculatePercentageChange(current, previous),
    }
  }

  private async getMovementQuantityComparison(
    currentWhere: Prisma.InventoryMovementWhereInput,
    previousWhere: Prisma.InventoryMovementWhereInput,
  ) {
    const [current, previous] = await Promise.all([
      this.sumMovementQuantity(currentWhere),
      this.sumMovementQuantity(previousWhere),
    ])

    return {
      current,
      previous,
      change: this.calculatePercentageChange(current, previous),
    }
  }

  private async sumMovementQuantity(where: Prisma.InventoryMovementWhereInput) {
    const result = await this.prisma.inventoryMovement.aggregate({
      where,
      _sum: {
        quantity: true,
      },
    })

    return result._sum.quantity ?? 0
  }

  private calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }

    return Math.round(((current - previous) / previous) * 100)
  }

  private getStartOfWeek(date: Date) {
    const start = new Date(date)
    const day = start.getDay()
    const diff = day === 0 ? 6 : day - 1

    start.setDate(start.getDate() - diff)
    start.setHours(0, 0, 0, 0)

    return start
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
  }

  private endOfDay(date: Date) {
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return end
  }

  private getRollingPeriodStart(now: Date, days: number) {
    const start = new Date(now)
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    return start
  }

  private getRecentOrdersLimit(days: number) {
    if (days <= 7) return 20
    if (days <= 30) return 40
    if (days <= 90) return 80
    return 120
  }

  private createTrendBuckets(startDate: Date, endDate: Date, useDailyBuckets: boolean) {
    if (useDailyBuckets) {
      const days = Math.floor((this.startOfDay(endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return Array.from({ length: days }, (_, index) => {
        const date = this.addDays(startDate, index)
        return {
          label: this.formatDayLabel(date),
          orders: 0,
          sheetsConsumed: 0,
          scrapsGenerated: 0,
          scrapsReused: 0,
        }
      })
    }

    const weeks = Math.ceil((this.startOfDay(endDate).getTime() - startDate.getTime() + 1) / (1000 * 60 * 60 * 24 * 7))

    return Array.from({ length: weeks }, (_, index) => {
      const weekStart = this.addDays(startDate, index * 7)
      return {
        label: this.formatRangeLabel(weekStart),
        orders: 0,
        sheetsConsumed: 0,
        scrapsGenerated: 0,
        scrapsReused: 0,
      }
    })
  }

  private createTrendPointDates(startDate: Date, endDate: Date, useDailyBuckets: boolean) {
    if (useDailyBuckets) {
      const days = Math.floor((this.startOfDay(endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return Array.from({ length: days }, (_, index) => this.endOfDay(this.addDays(startDate, index)))
    }

    const weeks = Math.ceil((this.startOfDay(endDate).getTime() - startDate.getTime() + 1) / (1000 * 60 * 60 * 24 * 7))
    return Array.from({ length: weeks }, (_, index) => this.endOfDay(this.addDays(startDate, index * 7 + 6)))
  }

  private getTrendBucketIndex(date: Date, startDate: Date, endDate: Date, useDailyBuckets: boolean) {
    const targetDate = this.startOfDay(date)

    if (targetDate < startDate || targetDate > endDate) {
      return -1
    }

    const diffInDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return useDailyBuckets ? diffInDays : Math.floor(diffInDays / 7)
  }

  private startOfDay(date: Date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    return start
  }

  private formatDayLabel(date: Date) {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  private formatRangeLabel(startDate: Date) {
    return startDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }
}