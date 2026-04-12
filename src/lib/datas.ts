export function getMesAtual(): { inicio: string; fim: string } {
  const now = new Date()
  const ano = now.getFullYear()
  const mes = now.getMonth()
  const inicio = new Date(ano, mes, 1).toISOString().split('T')[0]
  const fim = new Date(ano, mes + 1, 1).toISOString().split('T')[0]
  return { inicio, fim }
}

export function diasTotaisDoMes(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

export function diasPassadosNoMes(): number {
  return new Date().getDate()
}

export function diasRestantesNoMes(): number {
  return diasTotaisDoMes() - diasPassadosNoMes()
}
