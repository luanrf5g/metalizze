export function translateSheetType(type: 'STANDARD' | 'SCRAP') {
  const dictionary = {
    STANDARD: 'Chapa Original',
    SCRAP: 'Retalho'
  }

  return dictionary[type] || type
}

export function formatDate(dateString: string, complete: boolean = false) {
  const date = new Date(dateString)

  if (complete) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDocument(document: string) {
  // Remove tudo que não é dígito
  document = document.replace(/\D/g, "");

  if (document.length === 11) {
    // Aplica a máscara: 000.000.000-00
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (document.length === 14) {
    // Aplica a máscara: 00.000.000./0000-00
    return document.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  return document
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function translateProfileType(type: string) {
  const dictionary: Record<string, string> = {
    SQUARE: 'Quadrado',
    RECTANGULAR: 'Retangular',
    ROUND: 'Redondo',
    OBLONG: 'Oblongo',
    ANGLE: 'Cantoneira',
    U_CHANNEL: 'Perfil U',
  }

  return dictionary[type] || type
}

export function formatProfileDimensions(profile: { width: number; height: number; length: number; thickness: number; profileType: string }) {
  const equalDimTypes = ['SQUARE', 'ROUND', 'ANGLE']
  const dim = equalDimTypes.includes(profile.profileType)
    ? `${profile.width}mm`
    : `${profile.width}x${profile.height}mm`

  return `${dim} × ${profile.length}mm · ${profile.thickness}mm esp.`
}

export function formatPhone(phone: string) {
  phone = phone.replace(/\D/g, "")

  if (phone.length === 11) {
    // Aplica a máscara: (00) 0.0000-0000
    return phone.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2.$3-$4")
  } else if (phone.length === 9) {
    return phone.replace(/(\d{1})(\d{4})(\d{4})/, "$1.$2-$3")
  }
}