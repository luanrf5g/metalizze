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