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

// Formato real do extrato Nubank conta/Pix
const CSV_PIX_NUBANK = `Data,Valor,Identificador,Descrição
01/04/2026,22.00,aaa,Resgate RDB
01/04/2026,-21.12,bbb,Transferência enviada pelo Pix - 99 TECNOLOGIA LTDA - 18.033.552/0001-61 - BANCO BTG PACTUAL S.A. (0208) Agência: 30 Conta: 571873-6
02/04/2026,640.00,ccc,Resgate RDB
02/04/2026,-580.86,ddd,Pagamento de fatura
02/04/2026,-59.14,eee,Aplicação RDB
05/04/2026,-32.90,fff,Transferência enviada pelo Pix - IFOOD.COM AGENCIA DE RESTAURANTES ONLINE S.A. - 14.380.200/0001-21 - ADYEN DO BRASIL IP LTDA. Agência: 1 Conta: 100000003-3
08/04/2026,839.00,ggg,Transferência Recebida - EMPRESA LTDA - 47.137.361/0001-48 - NU PAGAMENTOS
08/04/2026,-15.00,hhh,Transferência enviada pelo Pix - UNIVERSIDADE FEDERAL DE SANTA CATARINA - 83.899.526/0001-82 - STN Agência: 1 Conta: 62870515-8`

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

describe('parseCsvNubank — Pix formato real Nubank', () => {
  it('exclui Resgate RDB (positivo, operação interna)', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos.find(g => g.titulo.includes('Resgate RDB'))).toBeUndefined()
  })

  it('exclui Pagamento de fatura', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos.find(g => g.titulo.toLowerCase().includes('fatura'))).toBeUndefined()
  })

  it('exclui Aplicação RDB', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos.find(g => g.titulo.toLowerCase().includes('rdb'))).toBeUndefined()
  })

  it('exclui transferência recebida (entrada)', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos.find(g => g.titulo.includes('EMPRESA LTDA'))).toBeUndefined()
  })

  it('mantém gastos reais via Pix', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos).toHaveLength(3) // 99, IFOOD, UNIVERSIDADE
  })

  it('extrai nome do merchant de descrição longa', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    const ifood = gastos.find(g => g.titulo.includes('IFOOD'))!
    expect(ifood.titulo).toBe('IFOOD.COM AGENCIA DE RESTAURANTES ONLINE S.A.')
    expect(ifood.titulo).not.toContain('ADYEN')
    expect(ifood.titulo).not.toContain('14.380.200')
  })

  it('extrai nome da 99 corretamente', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    const noventa = gastos.find(g => g.titulo.includes('99'))!
    expect(noventa.titulo).toBe('99 TECNOLOGIA LTDA')
    expect(noventa.valor).toBe(21.12)
  })

  it('todos os valores são positivos', () => {
    const { gastos } = parseCsvNubank(CSV_PIX_NUBANK)
    expect(gastos.every(g => g.valor > 0)).toBe(true)
  })
})

describe('parseCsvNubank — regressão fatura (abril/2026)', () => {
  // CSV real do Nubank com pagamentos de fatura que não devem contar como gastos.
  const PIX_ABRIL = `Data,Valor,Identificador,Descrição
02/04/2026,640.00,x1,Resgate RDB
02/04/2026,-580.86,x2,Pagamento de fatura
02/04/2026,-59.14,x3,Aplicação RDB
13/04/2026,437.46,x4,Resgate RDB
13/04/2026,-437.46,x5,Pagamento de fatura
05/04/2026,-32.90,x6,Transferência enviada pelo Pix - IFOOD.COM AGENCIA DE RESTAURANTES ONLINE S.A. - 14.380.200/0001-21 - ADYEN`

  it('não inclui "Pagamento de fatura" como gasto', () => {
    const { gastos } = parseCsvNubank(PIX_ABRIL)
    expect(gastos.find(g => g.titulo.toLowerCase().includes('fatura'))).toBeUndefined()
  })

  it('não inclui Aplicação RDB nem Resgate RDB', () => {
    const { gastos } = parseCsvNubank(PIX_ABRIL)
    expect(gastos.find(g => g.titulo.toLowerCase().includes('rdb'))).toBeUndefined()
  })

  it('mantém apenas o pix real (ifood)', () => {
    const { gastos } = parseCsvNubank(PIX_ABRIL)
    expect(gastos).toHaveLength(1)
    expect(gastos[0].valor).toBe(32.90)
  })

  const CREDITO_ABRIL = `date,title,amount
2026-04-13,Pagamento recebido,-437.46
2026-04-02,Pagamento recebido,-580.86
2026-04-14,Supermercados Imperatr,14.58
2026-04-13,Pantanal Auto Posto,16.00`

  it('credit CSV não inclui "Pagamento recebido" (valor negativo)', () => {
    const { gastos } = parseCsvNubank(CREDITO_ABRIL)
    expect(gastos.find(g => g.titulo.toLowerCase().includes('pagamento'))).toBeUndefined()
    expect(gastos).toHaveLength(2)
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
