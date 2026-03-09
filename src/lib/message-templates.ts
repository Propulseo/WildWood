/** Remplace les {{cle}} dans un template par les valeurs du dictionnaire */
export function replaceVariables(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`)
}

/** Construit le dictionnaire de variables pour un template WA */
export function buildVariableData(
  clientNom: string,
  dateDebut: string,
  dateFin: string,
  bungalowNum: number,
  messageLibre?: string,
): Record<string, string> {
  const parts = clientNom.split(' ')
  const prenom = parts[0] ?? clientNom
  const [y1, m1, d1] = dateDebut.split('-')
  const nuits = Math.round(
    (new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86400000,
  )
  return {
    prenom,
    nom: parts.slice(1).join(' ') || prenom,
    date_debut: `${d1}/${m1}/${y1}`,
    bungalow_numero: String(bungalowNum),
    nuits: String(nuits),
    ...(messageLibre ? { message_libre: messageLibre } : {}),
  }
}
