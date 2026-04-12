import { describe, it, expect } from 'vitest'
import { parseCsvNubank } from '../csvParser'

const CSV_CREDITO = `date,title,amount
2024-04-01,Pagamento recebido,-1500.00
2024-04-05,MERCADO PAO DE ACUCAR,87.50
2024-04-08,Uber *Viagem,23.00
2024-04-10,NETFLIX.COM,45.90`

const CSV_PIX = `Data,Valor,Identificador,Descrição
01/04/2024,2500.00,abc123,Pix recebido - Empresa XYZ
05/04/2024,-87.50,def456,Compra débito - MERCADO
08/04/2024,-23.00,ghi789,Pix enviado - João
10/04/2024,-45.90,jkl012,Débito - NETFLIX`

const CSV_CREDITO_ASPAS = `"date","title","amount"
"2024-04-05","MERCADO PAO DE ACUCAR","87.50"
"2024-04-08","Uber","23"`

describe('parseCsvNubank — crédito', () => {
  it('detecta tipo como credito', () => {
    const { tipo } = parseCsvNubank(CSV_CREDITO)
    expect(tipo).toBe('credito')
  })

  it('ignora linha de pagamento (valor negativo)', () => {
    const { gastos } = parseCsvNubank(CSV_CREDITO)
    expect(gastos.every(g => g.valor > 0)).toBe(true)
  })

  it('retorna 3 gastos (exclui o pagamento)', () => {
    const { gastos } = parseCsvNubank(CSV_CREDITO)
    expect(gastos).toHaveLength(3)
  })

  it('parse correto de titulo e valor', () => {
    const { gastos } = parseCsvNubank(CSV_CREDITO)
    const mercado = gastos.find(g => g.titulo.includes('MERCADO'))!
    expect(mercado.valor).toBe(87.5)
    expect(mercado.data).toBe('2024-04-05')
  })

  it('funciona com celulas entre aspas', () => {
    const { gastos } = parseCsvNubank(CSV_CREDITO_ASPAS)
    expect(gastos).toHaveLength(2)
    expect(gastos[0].valor).toBe(87.5)
  })
})

describe('parseCsvNubank — Pix/débito', () => {
  it('detecta tipo como pix', () => {
    const { tipo } = parseCsvNubank(CSV_PIX)
    expect(tipo).toBe('pix')
  })

  it('ignora entradas (valor positivo)', () => {
    const { gastos } = parseCsvNubank(CSV_PIX)
    expect(gastos.every(g => g.valor > 0)).toBe(true)
  })

  it('retorna 3 gastos (exclui o Pix recebido)', () => {
    const { gastos } = parseCsvNubank(CSV_PIX)
    expect(gastos).toHaveLength(3)
  })

  it('converte data DD/MM/YYYY para YYYY-MM-DD', () => {
    const { gastos } = parseCsvNubank(CSV_PIX)
    const mercado = gastos.find(g => g.titulo.includes('MERCADO'))!
    expect(mercado.data).toBe('2024-04-05')
  })

  it('valor sempre positivo (saidas viram positivo)', () => {
    const { gastos } = parseCsvNubank(CSV_PIX)
    const mercado = gastos.find(g => g.titulo.includes('MERCADO'))!
    expect(mercado.valor).toBe(87.5)
  })
})

describe('parseCsvNubank — edge cases', () => {
  it('retorna lista vazia para CSV sem linhas de dados', () => {
    const { gastos } = parseCsvNubank('date,title,amount\n')
    expect(gastos).toHaveLength(0)
  })

  it('retorna lista vazia para string vazia', () => {
    const { gastos } = parseCsvNubank('')
    expect(gastos).toHaveLength(0)
  })
})
