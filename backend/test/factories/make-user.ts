import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import {
  User,
  UserPermissions,
  UserProps,
} from "@/domain/enterprise/entities/user";
import { PrismaUserMapper } from "@/infra/database/prisma/mappers/prisma-user-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";

type MakeUserOverride = Partial<Omit<UserProps, 'password' | 'permissions'>> & {
  password?: string;
  permissions?: UserPermissions;
};

export function makeUser(
  override: MakeUserOverride = {},
  id?: UniqueEntityId
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456',
      role: 'ADMIN',
      permissions: {},
      ...override,
    },
    id,
  );

  return user;
}

@Injectable()
export class UserFactory {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async makePrismaUser(data: MakeUserOverride = {}): Promise<User> {
    const plainPassword = data.password ?? '123456';
    const hashedPassword = await hash(plainPassword, 8);

    const user = makeUser({
      role: 'ADMIN',
      ...data,
      password: hashedPassword,
    });

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });

    return user;
  }

  async makeAuthenticatedUser(data: MakeUserOverride = {}) {
    const user = await this.makePrismaUser({
      role: 'ADMIN',
      ...data,
    });

    const accessToken = this.jwt.sign({
      sub: user.id.toString(),
      role: user.role,
    });

    return {
      user,
      accessToken,
    };
  }
}