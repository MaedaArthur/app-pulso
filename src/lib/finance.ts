import type { EstadoMes } from '../types'

export function calcularSaldo(params: {
  dinheiroGuardado: number
  totalGastoNoMes: number
  metaPoupancaMensal: number
}): number {
  return params.dinheiroGuardado - params.totalGastoNoMes - params.metaPoupancaMensal
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
  porcentagemDias: number   // 0–1: fração do mês passada
  porcentagemGasto: number  // 0–1: fração da renda gasta (só variável)
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
