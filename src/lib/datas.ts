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

// Normaliza qualquer data (string YYYY-MM-DD ou Date) para o 1º dia do mês
// em formato YYYY-MM-DD. Âncora contábil (cash-basis) das transações.
export function normalizarMesReferencia(data: string | Date): string {
  if (typeof data === 'string') {
    return `${data.slice(0, 7)}-01`
  }
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mes}-01`
}

// Valida string no formato YYYY-MM, mês entre 01 e 12, ano entre 2000 e 2100.
export function mesEhValido(mes: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(mes)) return false
  const [ano, m] = mes.split('-').map(Number)
  if (ano < 2000 || ano > 2100) return false
  if (m < 1 || m > 12) return false
  return true
}

// Mês atual no formato YYYY-MM.
export function mesAtualIso(): string {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
}

// Converte "YYYY-MM" em { inicio, fim } (1º dia do mês e 1º do mês seguinte),
// em formato YYYY-MM-DD.
export function limitesDoMes(mes: string): { inicio: string; fim: string } {
  const [ano, m] = mes.split('-').map(Number)
  const inicio = new Date(ano, m - 1, 1)
  const fim = new Date(ano, m, 1)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { inicio: fmt(inicio), fim: fmt(fim) }
}

export type TipoMes = 'passado' | 'atual' | 'futuro'

export function tipoDoMes(mes: string): TipoMes {
  const atual = mesAtualIso()
  if (mes === atual) return 'atual'
  return mes < atual ? 'passado' : 'futuro'
}

export function proximoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m, 1) // já pula para o mês seguinte
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function mesAnterior(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
