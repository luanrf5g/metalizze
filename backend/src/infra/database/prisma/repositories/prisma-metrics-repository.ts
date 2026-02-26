import { MetricsRepository } from "@/domain/application/repositories/metrics-repository";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaMetricsRepository implements MetricsRepository {
  constructor(private prisma: PrismaService) { }

  async getDashboardMetrics() {
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
      totalScrapsSheets: scrapSheets._sum.quantity || 0,
      totalMaterials,
      totalClients
    }
  }
}