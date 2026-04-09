import { CuttingGasRepository } from "@/domain/application/repositories/cutting-gas-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";
import { PrismaCuttingGasMapper } from "../mappers/prisma-cutting-gas-mapper";

@Injectable()
export class PrismaCuttingGasRepository implements CuttingGasRepository {
  constructor(private prisma: PrismaService) { }

  async create(cuttingGas: CuttingGas) {
    const data = PrismaCuttingGasMapper.toPrisma(cuttingGas)

    await this.prisma.cuttingGas.create({
      data
    })
  }

  async findById(id: string) {
    const cuttingGas = await this.prisma.cuttingGas.findUnique({
      where: {
        id
      }
    })

    if (!cuttingGas) return null

    return PrismaCuttingGasMapper.toDomain(cuttingGas)
  }

  async findByName(name: string) {
    const cuttingGas = await this.prisma.cuttingGas.findUnique({
      where: {
        name
      }
    })

    if (!cuttingGas) return null

    return PrismaCuttingGasMapper.toDomain(cuttingGas)
  }

  async findAll({ includeInactive = false }: { includeInactive?: boolean }) {
    const cuttingGases = await this.prisma.cuttingGas.findMany({
      where: {
        isActive: includeInactive ? undefined : true
      }
    })

    return cuttingGases.map(PrismaCuttingGasMapper.toDomain)
  }

  async save(cuttingGas: CuttingGas) {
    const data = PrismaCuttingGasMapper.toPrisma(cuttingGas)

    await this.prisma.cuttingGas.update({
      where: {
        id: data.id
      },
      data
    })
  }

  async toggleActive(id: string, isActive: boolean) {
    const cuttingGas = await this.prisma.cuttingGas.update({
      where: {
        id
      },
      data: {
        isActive
      }
    })

    if (!cuttingGas) return null

    return PrismaCuttingGasMapper.toDomain(cuttingGas)
  }
}