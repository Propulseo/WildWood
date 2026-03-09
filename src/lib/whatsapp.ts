/** Nettoie un numero de telephone : garde le +, supprime espaces/tirets */
export function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

/** Construit l'URL wa.me pour envoyer un message WhatsApp */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = cleanPhone(phone).replace('+', '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

/** Ouvre WhatsApp dans un nouvel onglet */
export function openWhatsApp(phone: string, message: string): void {
  window.open(buildWhatsAppUrl(phone, message), '_blank')
}
