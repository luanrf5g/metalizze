interface GenerateSkuParams {
  materialSlug: string,
  width: number,
  height: number,
  thickness: number,
  type: 'STANDARD' | 'SCRAP',
  clientName?: string | null
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
}