import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Profile, ProfileProps, ProfileType } from "@/domain/enterprise/entities/profile";
import { PrismaProfileMapper } from "@/infra/database/prisma/mappers/prisma-profile-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";

const profileTypes: ProfileType[] = ['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL']

export function makeProfile(
  override: Partial<ProfileProps> = {},
  id?: UniqueEntityId
) {
  const profileType = override.profileType ?? faker.helpers.arrayElement(profileTypes)

  const width = override.width ?? faker.number.int({ min: 20, max: 200 })
  const height = override.height ?? width

  const profile = Profile.create(
    {
      materialId: new UniqueEntityId(),
      sku: faker.commerce.productName(),
      profileType,
      width,
      height,
      length: faker.number.int({ min: 1000, max: 12000 }),
      thickness: faker.number.float({ min: 0.5, max: 12, fractionDigits: 2 }),
      quantity: faker.number.int(10),
      ...override
    },
    id
  )

  return profile
}

@Injectable()
export class ProfileFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaProfile(data: Partial<ProfileProps> = {}): Promise<Profile> {
    const profile = makeProfile(data)

    await this.prisma.profile.create({
      data: PrismaProfileMapper.toPrisma(profile)
    })

    return profile
  }
}
