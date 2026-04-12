export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatData(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatDataCurta(isoDate: string): string {
  const [, mes, dia] = isoDate.split('-')
  return `${dia}/${mes}`
}
