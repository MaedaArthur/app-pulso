import { describe, it, expect } from 'vitest'
import { calcularSaldo, estadoDoMes, ritmoDeMes } from '../finance'

describe('calcularSaldo', () => {
  it('retorna dinheiro_guardado menos gasto menos meta', () => {
    expect(calcularSaldo({
      dinheiroGuardado: 2000,
      totalGastoNoMes: 800,
      metaPoupancaMensal: 300,
    })).toBe(900)
  })

  it('retorna negativo quando gastos superam o guardado', () => {
    expect(calcularSaldo({
      dinheiroGuardado: 500,
      totalGastoNoMes: 600,
      metaPoupancaMensal: 100,
    })).toBe(-200)
  })

  it('retorna zero quando tudo se cancela', () => {
    expect(calcularSaldo({
      dinheiroGuardado: 1000,
      totalGastoNoMes: 700,
      metaPoupancaMensal: 300,
    })).toBe(0)
  })
})

describe('estadoDoMes', () => {
  it('verde quando saldo > 20% da renda', () => {
    expect(estadoDoMes({ saldoReal: 600, rendaMensalEstimada: 2000 })).toBe('verde')
  })

  it('amarelo quando saldo entre 0 e 20% da renda', () => {
    expect(estadoDoMes({ saldoReal: 300, rendaMensalEstimada: 2000 })).toBe('amarelo')
  })

  it('amarelo quando saldo é exatamente 0', () => {
    expect(estadoDoMes({ saldoReal: 0, rendaMensalEstimada: 2000 })).toBe('amarelo')
  })

  it('vermelho quando saldo negativo', () => {
    expect(estadoDoMes({ saldoReal: -100, rendaMensalEstimada: 2000 })).toBe('vermelho')
  })

  it('amarelo quando renda estimada é zero (fallback seguro)', () => {
    expect(estadoDoMes({ saldoReal: 500, rendaMensalEstimada: 0 })).toBe('amarelo')
  })
})

describe('ritmoDeMes', () => {
  it('ritmo ok quando gasto variavel proporcional aos dias', () => {
    const resultado = ritmoDeMes({
      totalGastoNoMes: 600,
      gastoFixosMensais: 400,  // variavel = 200
      rendaMensalEstimada: 2000,
      diasPassados: 15,
      diasTotaisMes: 30,
    })
    // % gasto = 200/2000 = 0.10, % dias = 0.50, ritmoOk = 0.10 <= 0.60
    expect(resultado.ritmoOk).toBe(true)
    expect(resultado.gastoVariavel).toBe(200)
    expect(resultado.diasRestantes).toBe(15)
  })

  it('cuidado quando gasto variavel acima dos dias + margem', () => {
    const resultado = ritmoDeMes({
      totalGastoNoMes: 1800,
      gastoFixosMensais: 400,  // variavel = 1400
      rendaMensalEstimada: 2000,
      diasPassados: 10,
      diasTotaisMes: 30,
    })
    // % gasto = 1400/2000 = 0.70, % dias = 0.33, ritmoOk = 0.70 <= 0.43? false
    expect(resultado.ritmoOk).toBe(false)
  })

  it('gastoVariavel nunca negativo quando fixos > total', () => {
    const resultado = ritmoDeMes({
      totalGastoNoMes: 300,
      gastoFixosMensais: 500,
      rendaMensalEstimada: 2000,
      diasPassados: 5,
      diasTotaisMes: 30,
    })
    expect(resultado.gastoVariavel).toBe(0)
  })
})
