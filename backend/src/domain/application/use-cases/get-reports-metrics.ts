import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Either, right } from '@/core/logic/Either';

type ProductivityData = { name: string; ordens: number }[];
type MaterialUsageData = { name: string; usadas: number; retalhos: number }[];

type GetReportsMetricsResponse = Either<
    null,
    {
        metrics: {
            totalOrdersMonth: number;
            totalOrdersComparedToLastMonth: number;
            sheetsConsumedMonth: number;
            sheetsConsumedComparedToLastMonth: number;
            scrapsGeneratedMonth: number;
            scrapsGeneratedComparedToLastMonth: number;
            activeClients: number;
            productivityData: ProductivityData;
            materialUsageData: MaterialUsageData;
        }
    }
>;

@Injectable()
export class GetReportsMetricsUseCase {
    constructor(private prisma: PrismaService) { }

    async execute(): Promise<GetReportsMetricsResponse> {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // --- Cards Metrics ---

        // 1. Total Orders (We count EXIT InventoryMovements as "Orders")
        const totalOrdersMonth = await this.prisma.inventoryMovement.count({
            where: { type: 'EXIT', createdAt: { gte: startOfCurrentMonth } }
        });
        const totalOrdersLastMonth = await this.prisma.inventoryMovement.count({
            where: { type: 'EXIT', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
        });
        const totalOrdersComparedToLastMonth = this.calculatePercentageChange(totalOrdersMonth, totalOrdersLastMonth);

        // 2. Sheets Consumed
        const sheetsConsumedMonthData = await this.prisma.inventoryMovement.aggregate({
            _sum: { quantity: true },
            where: {
                type: 'EXIT',
                createdAt: { gte: startOfCurrentMonth },
                sheet: { type: 'STANDARD' }
            }
        });
        const sheetsConsumedMonth = sheetsConsumedMonthData._sum.quantity || 0;

        const sheetsConsumedLastMonthData = await this.prisma.inventoryMovement.aggregate({
            _sum: { quantity: true },
            where: {
                type: 'EXIT',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                sheet: { type: 'STANDARD' }
            }
        });
        const sheetsConsumedLastMonth = sheetsConsumedLastMonthData._sum.quantity || 0;
        const sheetsConsumedComparedToLastMonth = this.calculatePercentageChange(sheetsConsumedMonth, sheetsConsumedLastMonth);

        // 3. Scraps Generated 
        // A scrap is a sheet created within the month that has type SCRAP
        const scrapsGeneratedMonth = await this.prisma.sheet.count({
            where: { type: 'SCRAP', createdAt: { gte: startOfCurrentMonth } }
        });
        const scrapsGeneratedLastMonth = await this.prisma.sheet.count({
            where: { type: 'SCRAP', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
        });
        const scrapsGeneratedComparedToLastMonth = this.calculatePercentageChange(scrapsGeneratedMonth, scrapsGeneratedLastMonth);

        // 4. Active Clients (Assuming all for now, as no active flag or movement tying easily)
        const activeClients = await this.prisma.client.count();

        // --- Charts Metrics ---

        // 1. Productivity Data (Last 7 Days)
        const productivityData: ProductivityData = [];
        const daysToSubtract = 6; // To get exactly 7 days including today
        const startDateForProductivity = new Date(now);
        startDateForProductivity.setDate(startDateForProductivity.getDate() - daysToSubtract);
        startDateForProductivity.setHours(0, 0, 0, 0);

        const ordersByDay = await this.prisma.inventoryMovement.findMany({
            select: { createdAt: true },
            where: { type: 'EXIT', createdAt: { gte: startDateForProductivity } },
        });

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        // Initialize 7 days with 0
        for (let i = 0; i <= daysToSubtract; i++) {
            const date = new Date(startDateForProductivity);
            date.setDate(date.getDate() + i);
            productivityData.push({
                name: dayNames[date.getDay()],
                ordens: 0
            });
        }

        // Fill data
        ordersByDay.forEach((order: any) => {
            // Find the day in the last 7 days array and increment
            const orderDate = new Date(order.createdAt);
            const diffTime = Math.abs(orderDate.getTime() - startDateForProductivity.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= 6) {
                productivityData[diffDays].ordens += 1;
            }
        });

        // 2. Material Usage Data
        // Needs grouping by material for sheets used and scraps generated
        const allMaterials = await this.prisma.material.findMany();
        const materialUsageData: MaterialUsageData = [];

        for (const material of allMaterials) {
            // Sheets used (EXITS of type STANDARD for this material)
            const sheetsUsedData = await this.prisma.inventoryMovement.aggregate({
                _sum: { quantity: true },
                where: {
                    type: 'EXIT',
                    sheet: { materialId: material.id, type: 'STANDARD' }
                }
            });

            // Scraps generated (Sheets added with type SCRAP for this material)
            const scrapsData = await this.prisma.sheet.count({
                where: {
                    materialId: material.id,
                    type: 'SCRAP'
                }
            });

            // Only add materials that have some usage or scraps to avoid clutter
            const usadas = sheetsUsedData._sum.quantity || 0;
            const retalhos = scrapsData || 0;

            if (usadas > 0 || retalhos > 0) {
                materialUsageData.push({
                    name: material.name,
                    usadas,
                    retalhos
                });
            }
        }

        // Sort by most used and limit to top 5
        materialUsageData.sort((a, b) => b.usadas - a.usadas);
        const topMaterialUsage = materialUsageData.slice(0, 5);


        return right({
            metrics: {
                totalOrdersMonth,
                totalOrdersComparedToLastMonth,
                sheetsConsumedMonth,
                sheetsConsumedComparedToLastMonth,
                scrapsGeneratedMonth,
                scrapsGeneratedComparedToLastMonth,
                activeClients,
                productivityData,
                materialUsageData: topMaterialUsage
            }
        });
    }

    private calculatePercentageChange(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100);
    }
}
