import { FindManyProfilesParams, ProfilesRepository } from "@/domain/application/repositories/profiles-repository";
import { Profile, ProfileType } from "@/domain/enterprise/entities/profile";

export class InMemoryProfilesRepository implements ProfilesRepository {
  public items: Profile[] = []

  async create(profile: Profile) {
    this.items.push(profile)
  }

  async save(profile: Profile) {
    const itemIndex = this.items.findIndex((item) => item.id === profile.id)

    this.items[itemIndex] = profile
  }

  async delete(id: string) {
    const filteredItems = this.items.filter((item) => item.id.toString() !== id)

    this.items = filteredItems
  }

  async countByClientId(clientId: string) {
    return this.items.filter((item) => item.clientId?.toString() === clientId).length
  }

  async countByMaterialId(materialId: string) {
    return this.items.filter((item) => item.materialId.toString() === materialId).length
  }

  async findById(id: string) {
    const profile = this.items.find((item) => item.id.toString() === id)

    if (!profile) return null

    return profile
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
    const profile = this.items.find((item) => {
      const itemClientId = item.clientId ? item.clientId.toString() : null

      return (
        item.materialId.toString() === materialId &&
        item.profileType === profileType &&
        item.width === width &&
        item.height === height &&
        item.length === length &&
        item.thickness === thickness &&
        itemClientId === clientId
      )
    })

    if (!profile) return null

    return profile
  }

  async findMany({ page, materialId, clientId, profileType }: FindManyProfilesParams) {
    const profiles = this.items.filter((item) => {
      if (materialId && item.materialId.toString() !== materialId) {
        return false
      }
      if (clientId && item.clientId?.toString() !== clientId) {
        return false
      }
      if (profileType && item.profileType !== profileType) {
        return false
      }
      if (item.deletedAt) {
        return false
      }

      return true
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice((page - 1) * 15, page * 15)

    return profiles
  }

  async findAll({ materialId, clientId, profileType }: Omit<FindManyProfilesParams, 'page'>) {
    const profiles = this.items.filter((item) => {
      if (materialId && item.materialId.toString() !== materialId) {
        return false
      }
      if (clientId && item.clientId?.toString() !== clientId) {
        return false
      }
      if (profileType && item.profileType !== profileType) {
        return false
      }
      if (item.deletedAt) {
        return false
      }

      return true
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return profiles
  }

  async count({ materialId, clientId, profileType }: Omit<FindManyProfilesParams, 'page'>) {
    const total = (await this.findAll({ materialId, clientId, profileType })).length
    return total
  }
}
