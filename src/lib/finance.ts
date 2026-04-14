import type { EstadoMes } from '../types'

export function calcularSaldo(params: {
  dinheiroGuardado: number
  tipoReserva: 'buffer' | 'reserva' | 'poupanca' | null
  totalEntradasNoMes: number
  totalGastoNoMes: number // transações reais (CSV/manual) — já inclui gastos fixos
  netMovimentosReserva: number // depósitos - retiradas feitos pelo app
  // NOTA: metaPoupancaMensal e gastos_fixos_mensais não entram aqui.
  // Meta é uma aspiração exibida separadamente — subtrair causaria falso vermelho
  // para quem recebe no fim do mês. gastos_fixos só é usado no ritmoDeMes.
}): number {
  const base = params.tipoReserva === 'buffer' ? params.dinheiroGuardado : 0
  return base + params.totalEntradasNoMes - params.totalGastoNoMes - params.netMovimentosReserva
}

export function estadoDoMes(params: {
  saldoReal: number
  rendaMensalEstimada: number
}): EstadoMes {
  const { saldoReal, rendaMensalEstimada } = params
  if (rendaMensalEstimada <= 0) return 'amarelo'
  if (saldoReal > rendaMensalEstimada * 0.2) return 'verde'
  if (saldoReal >= 0) return 'amarelo'
  return 'vermelho'
}

export interface ResultadoRitmo {
  porcentagemDias: number
  porcentagemGasto: number
  ritmoOk: boolean
  diasRestantes: number
  gastoVariavel: number
}

export function ritmoDeMes(params: {
  totalGastoNoMes: number
  gastoFixosMensais: number
  rendaMensalEstimada: number
  diasPassados: number
  diasTotaisMes: number
}): ResultadoRitmo {
  const { totalGastoNoMes, gastoFixosMensais, rendaMensalEstimada, diasPassados, diasTotaisMes } = params
  const gastoVariavel = Math.max(0, totalGastoNoMes - gastoFixosMensais)
  const porcentagemDias = diasTotaisMes > 0 ? diasPassados / diasTotaisMes : 0
  const porcentagemGasto = rendaMensalEstimada > 0 ? gastoVariavel / rendaMensalEstimada : 0
  const ritmoOk = porcentagemGasto <= porcentagemDias + 0.1
  const diasRestantes = diasTotaisMes - diasPassados
  return { porcentagemDias, porcentagemGasto, ritmoOk, diasRestantes, gastoVariavel }
}

export interface ProjecaoMeta {
  projecao: number   // quanto vai sobrar no fim do mês no ritmo atual
  percentual: number // 0–1 em relação à meta
  metaPoupancaMensal: number
}

// Projeta quanto vai sobrar no fim do mês baseado no ritmo de gasto atual.
// Retorna null quando não há dados suficientes (dia 0 ou meta zerada).
export function calcularProjecaoMeta(params: {
  totalEntradasMes: number
  totalGastosMes: number
  metaPoupancaMensal: number
  diasPassados: number
  diasTotaisMes: number
}): ProjecaoMeta | null {
  const { totalEntradasMes, totalGastosMes, metaPoupancaMensal, diasPassados, diasTotaisMes } = params
  if (diasPassados === 0 || metaPoupancaMensal === 0) return null

  const gastoMedioDiario = totalGastosMes / diasPassados
  const projecaoGastoTotal = gastoMedioDiario * diasTotaisMes
  const projecao = Math.max(0, totalEntradasMes - projecaoGastoTotal)
  const percentual = Math.min(1, projecao / metaPoupancaMensal)

  return { projecao, percentual, metaPoupancaMensal }
}

export interface SaudeReserva {
  mesesCobertos: number
  estado: 'verde' | 'amarelo' | 'vermelho'
  disponivelParaUsar: number // quanto pode usar sem comprometer 3 meses de colchão
}

export function calcularSaudeReserva(params: {
  dinheiroGuardado: number
  gastosFixosMensais: number
  saldoMes: number
}): SaudeReserva {
  const { dinheiroGuardado, gastosFixosMensais, saldoMes } = params
  const referencia = gastosFixosMensais > 0 ? gastosFixosMensais : 1
  const mesesCobertos = dinheiroGuardado / referencia

  let estado: SaudeReserva['estado']
  if (mesesCobertos >= 6) estado = 'verde'
  else if (mesesCobertos >= 3) estado = 'amarelo'
  else estado = 'vermelho'

  const colchaoMinimo = referencia * 3
  const excedente = Math.max(0, dinheiroGuardado - colchaoMinimo)
  // só sugere usar se o mês está negativo
  const disponivelParaUsar = saldoMes < 0 ? Math.min(excedente, Math.abs(saldoMes)) : 0

  return { mesesCobertos, estado, disponivelParaUsar }
}
