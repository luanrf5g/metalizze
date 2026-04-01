import { Profile } from "@/domain/enterprise/entities/profile";

export class ProfileDetailsPresenter {
  static toHTTP(profile: Profile) {
    return {
      id: profile.id.toString(),
      sku: profile.sku,
      profileType: profile.profileType,
      clientId: profile.clientId ? profile.clientId.toString() : null,
      materialId: profile.materialId.toString(),
      width: profile.width,
      height: profile.height,
      length: profile.length,
      thickness: profile.thickness,
      quantity: profile.quantity,
      price: profile.price,
      storageLocation: profile.storageLocation,
      createdAt: profile.createdAt
    }
  }
}
