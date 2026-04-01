import { Profile } from "@/domain/enterprise/entities/profile";

export class ProfilePresenter {
  static toHTTP(profile: Profile) {
    return {
      id: profile.id.toString(),
      sku: profile.sku,
      profileType: profile.profileType,
      materialId: profile.materialId.toString(),
      clientId: profile.clientId ? profile.clientId.toString() : null,
      quantity: profile.quantity,
      price: profile.price,
      createdAt: profile.createdAt,
    }
  }
}
