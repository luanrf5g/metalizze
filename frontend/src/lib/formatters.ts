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