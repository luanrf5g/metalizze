import { ProfileWithDetails } from "@/domain/enterprise/value-objects/profile-with-details";

export class ProfileWithDetailsPresenter {
  static toHTTP(profile: ProfileWithDetails) {
    return {
      id: profile.id.toString(),
      sku: profile.sku,
      profileType: profile.profileType,
      width: profile.width,
      height: profile.height,
      length: profile.length,
      thickness: profile.thickness,
      materialId: profile.materialId.toString(),
      material: {
        id: profile.material.id.toString(),
        name: profile.material.name,
        slug: profile.material.slug,
      },
      quantity: profile.quantity,
      price: profile.price,
      createdAt: profile.createdAt,
      client: profile.client ? {
        id: profile.client.id.toString(),
        name: profile.client.name,
        document: profile.client.document
      } : null
    }
  }
}
