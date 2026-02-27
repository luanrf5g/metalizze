import { DashboardInventoryMovementsMetrics, MetricsRepository } from "@/domain/application/repositories/metrics-repository";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaMetricsRepository implements MetricsRepository {
  constructor(private prisma: PrismaService) { }

  async getDashboardCardsMetrics() {
    const [standardSheets, scrapSheets, totalMaterials, totalClients] = await Promise.all([
      this.prisma.sheet.aggregate({
        _sum: { quantity: true },
        where: { type: 'STANDARD', deletedAt: null }
      }),

      this.prisma.sheet.aggregate({
        _sum: { quantity: true },
        where: { type: 'SCRAP', deletedAt: null }
      }),

      this.prisma.material.count(),

      this.prisma.client.count()
    ])

    return {
      totalStandardSheets: standardSheets._sum.quantity || 0,
      totalScrapSheets: scrapSheets._sum.quantity || 0,
      totalMaterials,
      totalClients
    }
  }

  async getDashboardInventoryMovementsMetrics(days: number = 365) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
      },
      select: {
        type: true,
        quantity: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const groupedData = new Map<string, DashboardInventoryMovementsMetrics>()

    for (const mov of movements) {
      const dateString = mov.createdAt.toISOString().split('T')[0]

      if (!groupedData.has(dateString)) {
        groupedData.set(dateString, {
          date: dateString,
          entries: 0,
          exits: 0
        })
      }

      const dayData = groupedData.get(dateString)

      if (mov.type === 'ENTRY') {
        dayData!.entries += mov.quantity
      } else if (mov.type === 'EXIT') {
        dayData!.exits += mov.quantity
      }
    }

    return Array.from(groupedData.values())
  }
}