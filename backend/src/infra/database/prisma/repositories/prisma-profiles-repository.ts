import { FindManyProfilesParams, ProfilesRepository } from "@/domain/application/repositories/profiles-repository";
import { Profile, ProfileType } from "@/domain/enterprise/entities/profile";
import { Injectable } from "@nestjs/common";
import { PrismaProfileMapper } from "../mappers/prisma-profile-mapper";
import { PrismaService } from "../prisma.service";
import { PrismaProfileWithDetailsMapper } from "../mappers/prisma-profile-with-details-mapper";

@Injectable()
export class PrismaProfilesRepository implements ProfilesRepository {
  constructor(private prisma: PrismaService) { }

  async create(profile: Profile) {
    const data = PrismaProfileMapper.toPrisma(profile)

    await this.prisma.profile.create({
      data
    })
  }

  async save(profile: Profile) {
    const data = PrismaProfileMapper.toPrisma(profile)

    await this.prisma.profile.update({
      where: {
        id: data.id
      },
      data
    })
  }

  async delete(id: string) {
    await this.prisma.profile.delete({
      where: {
        id
      }
    })
  }

  async countByClientId(clientId: string) {
    const count = await this.prisma.profile.count({
      where: {
        clientId
      }
    })

    return count
  }

  async countByMaterialId(materialId: string) {
    const count = await this.prisma.profile.count({
      where: {
        materialId
      }
    })

    return count
  }

  async findById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        id
      }
    })

    if (!profile) return null

    return PrismaProfileMapper.toDomain(profile)
  }

  async findByDetails(
    materialId: string,
    profileType: ProfileType,
    width: number,
    height: number,
    length: number,
    thickness: number,
    clientId: string | null
  ) {
    const profile = await this.prisma.profile.findFirst({
      where: {
        materialId,
        profileType,
        width,
        height,
        length,
        thickness,
        clientId
      }
    })

    if (!profile) return null

    return PrismaProfileMapper.toDomain(profile)
  }

  async findMany({ page, materialId, clientId, profileType }: FindManyProfilesParams) {
    const profiles = await this.prisma.profile.findMany({
      where: {
        materialId: materialId ?? undefined,
        clientId: clientId ?? undefined,
        profileType: profileType ?? undefined,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 15,
      skip: (page - 1) * 15,
      include: {
        material: true,
        client: true
      }
    })

    return profiles.map(PrismaProfileWithDetailsMapper.toDomain)
  }

  async findAll({ materialId, clientId, profileType }: Omit<FindManyProfilesParams, 'page'>) {
    const profiles = await this.prisma.profile.findMany({
      where: {
        materialId: materialId ?? undefined,
        clientId: clientId ?? undefined,
        profileType: profileType ?? undefined,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        material: true,
        client: true
      }
    })

    return profiles.map(PrismaProfileWithDetailsMapper.toDomain)
  }

  async count({ materialId, clientId, profileType }: Omit<FindManyProfilesParams, 'page'>) {
    const total = await this.prisma.profile.count({
      where: {
        materialId: materialId ?? undefined,
        clientId: clientId ?? undefined,
        profileType: profileType ?? undefined,
        deletedAt: null
      }
    })

    return total
  }
}
