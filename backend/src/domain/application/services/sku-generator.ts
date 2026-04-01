import { ProfileType } from "@/domain/enterprise/entities/profile"

interface GenerateSkuParams {
  materialSlug: string,
  width: number,
  height: number,
  thickness: number,
  type: 'STANDARD' | 'SCRAP',
  clientName?: string | null
}

interface GenerateProfileSkuParams {
  materialSlug: string,
  profileType: ProfileType,
  width: number,
  height: number,
  length: number,
  thickness: number,
  clientName?: string | null
}

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  SQUARE: 'QD',
  RECTANGULAR: 'RT',
  ROUND: 'RD',
  OBLONG: 'OB',
  ANGLE: 'CT',
  U_CHANNEL: 'PU',
}

export class SkuGenerator {
  static generate({
    materialSlug,
    width,
    height,
    thickness,
    type,
    clientName
  }: GenerateSkuParams): string {
    const formattedThickness = thickness.toFixed(2)

    const baseSku = `${materialSlug}-${formattedThickness}-${width}x${height}`.toUpperCase()

    let finalSku = baseSku

    if (clientName) {
      const formattedOwnerName = clientName
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')

      finalSku = `${finalSku}-C:${formattedOwnerName}`
    }

    if (type === 'SCRAP') {
      finalSku = `${finalSku}-SCRAP`
    }

    return finalSku
  }

  /**
   * Gera SKU para perfis no formato:
   * {MATERIAL}-{TIPO_PERFIL}-{ESPESSURA}-{LARGURA}x{ALTURA}x{COMPRIMENTO}[-C:{CLIENTE}]
   *
   * Exemplos:
   * ACO-QD-2.00-50x50x6000 (Perfil quadrado 50mm, 6m)
   * ACO-RT-3.00-100x50x6000 (Perfil retangular 100x50mm, 6m)
   * ACO-RD-2.50-25x25x6000-C:JOAO (Perfil redondo 25mm, 6m, cliente João)
   */
  static generateProfileSku({
    materialSlug,
    profileType,
    width,
    height,
    length,
    thickness,
    clientName
  }: GenerateProfileSkuParams): string {
    const typeLabel = PROFILE_TYPE_LABELS[profileType]
    const formattedThickness = thickness.toFixed(2)

    let finalSku = `${materialSlug}-${typeLabel}-${formattedThickness}-${width}x${height}x${length}`.toUpperCase()

    if (clientName) {
      const formattedOwnerName = clientName
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')

      finalSku = `${finalSku}-C:${formattedOwnerName}`
    }

    return finalSku
  }
}