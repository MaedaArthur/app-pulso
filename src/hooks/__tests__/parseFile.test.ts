import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseFile } from '../useImportarCsv'

// CSV da fatura de crédito com gastos de março e abril (ciclo de faturamento)
const CSV_FATURA_CREDITO_CICLO = `date,title,amount
2026-03-05,MERCADO PAO DE ACUCAR,87.50
2026-03-15,Uber *Viagem,23.00
2026-03-28,NETFLIX.COM,45.90
2026-04-01,iFood pedido,62.00`

// CSV Pix com gastos de março e abril
const CSV_PIX_DOIS_MESES = `Data,Valor,Identificador,Descrição
05/03/2026,-87.50,aaa,Transferência enviada pelo Pix - MERCADO LTDA - 123 - BANCO X
15/04/2026,-23.00,bbb,Transferência enviada pelo Pix - UBER DO BRASIL - 456 - BANCO Y`

function makeFile(content: string, name = 'fatura.csv'): File {
  return new File([content], name, { type: 'text/csv' })
}

// Fixa a data atual em abril de 2026 para testes determinísticos
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-14'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('parseFile — crédito (ciclo de faturamento)', () => {
  it('importa todos os gastos da fatura, incluindo os de meses anteriores', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    expect(result.tipo).toBe('credito')
    expect(result.gastos).toHaveLength(4)
  })

  it('remapeia gastos de março para abril (mês atual)', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    expect(result.gastos.every(g => g.data.startsWith('2026-04'))).toBe(true)
  })

  it('preserva o dia original no remapeamento', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    const mercado = result.gastos.find(g => g.titulo.includes('MERCADO'))!
    expect(mercado.data).toBe('2026-04-05')
  })

  it('não altera gastos que já estão no mês atual', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    const ifood = result.gastos.find(g => g.titulo.includes('iFood'))!
    expect(ifood.data).toBe('2026-04-01')
  })

  it('ignoradosOutroMes é zero para fatura de crédito', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    expect(result.ignoradosOutroMes).toBe(0)
  })

  it('totalGeral soma todos os gastos da fatura', async () => {
    const result = await parseFile(makeFile(CSV_FATURA_CREDITO_CICLO))
    expect(result.totalGeral).toBeCloseTo(87.5 + 23 + 45.9 + 62, 2)
  })
})

describe('parseFile — Pix (mês calendário)', () => {
  it('filtra apenas gastos do mês atual', async () => {
    const result = await parseFile(makeFile(CSV_PIX_DOIS_MESES))
    expect(result.tipo).toBe('pix')
    expect(result.gastos).toHaveLength(1)
    expect(result.gastos[0].data).toBe('2026-04-15')
  })

  it('contabiliza transações de outro mês em ignoradosOutroMes', async () => {
    const result = await parseFile(makeFile(CSV_PIX_DOIS_MESES))
    expect(result.ignoradosOutroMes).toBe(1)
  })
})
