import { describe, it, expect } from 'vitest'
import {
  normalizarMesReferencia,
  tipoDoMes,
  proximoMes,
  mesAnterior,
  mesAtualIso,
  limitesDoMes,
  mesEhValido,
} from '../datas'

describe('normalizarMesReferencia', () => {
  it('retorna o 1º dia do mês da data informada (string YYYY-MM-DD)', () => {
    expect(normalizarMesReferencia('2026-04-15')).toBe('2026-04-01')
  })

  it('funciona no 1º dia do mês (idempotente)', () => {
    expect(normalizarMesReferencia('2026-04-01')).toBe('2026-04-01')
  })

  it('funciona no último dia do mês', () => {
    expect(normalizarMesReferencia('2026-01-31')).toBe('2026-01-01')
  })

  it('aceita Date e retorna string YYYY-MM-DD', () => {
    const d = new Date(2026, 3, 15) // 15/abr/2026 horário local
    expect(normalizarMesReferencia(d)).toBe('2026-04-01')
  })

  it('preserva mês mesmo em virada de ano', () => {
    expect(normalizarMesReferencia('2025-12-31')).toBe('2025-12-01')
    expect(normalizarMesReferencia('2026-01-01')).toBe('2026-01-01')
  })
})

describe('mesEhValido', () => {
  it('aceita formato YYYY-MM', () => {
    expect(mesEhValido('2026-04')).toBe(true)
    expect(mesEhValido('2000-01')).toBe(true)
    expect(mesEhValido('2100-12')).toBe(true)
  })

  it('rejeita formato diferente', () => {
    expect(mesEhValido('2026-4')).toBe(false)
    expect(mesEhValido('2026/04')).toBe(false)
    expect(mesEhValido('abril')).toBe(false)
    expect(mesEhValido('')).toBe(false)
  })

  it('rejeita meses inválidos', () => {
    expect(mesEhValido('2026-00')).toBe(false)
    expect(mesEhValido('2026-13')).toBe(false)
  })

  it('rejeita anos fora da faixa 2000-2100', () => {
    expect(mesEhValido('1999-04')).toBe(false)
    expect(mesEhValido('2101-04')).toBe(false)
  })
})

describe('mesAtualIso', () => {
  it('retorna string YYYY-MM do mês corrente', () => {
    const m = mesAtualIso()
    expect(m).toMatch(/^\d{4}-\d{2}$/)
    const [ano, mes] = m.split('-').map(Number)
    const agora = new Date()
    expect(ano).toBe(agora.getFullYear())
    expect(mes).toBe(agora.getMonth() + 1)
  })
})

describe('limitesDoMes', () => {
  it('retorna inicio (1º dia) e fim (1º dia do mês seguinte)', () => {
    expect(limitesDoMes('2026-04')).toEqual({
      inicio: '2026-04-01',
      fim: '2026-05-01',
    })
  })

  it('funciona na virada de ano', () => {
    expect(limitesDoMes('2026-12')).toEqual({
      inicio: '2026-12-01',
      fim: '2027-01-01',
    })
  })

  it('funciona em fevereiro (não precisa saber dos dias)', () => {
    expect(limitesDoMes('2024-02')).toEqual({
      inicio: '2024-02-01',
      fim: '2024-03-01',
    })
  })
})

describe('tipoDoMes', () => {
  it('retorna "atual" para o mês corrente', () => {
    expect(tipoDoMes(mesAtualIso())).toBe('atual')
  })

  it('retorna "passado" para mês anterior', () => {
    const agora = new Date()
    const mesAnteriorDate = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    const mes = `${mesAnteriorDate.getFullYear()}-${String(mesAnteriorDate.getMonth() + 1).padStart(2, '0')}`
    expect(tipoDoMes(mes)).toBe('passado')
  })

  it('retorna "futuro" para mês seguinte', () => {
    const agora = new Date()
    const mesFuturoDate = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
    const mes = `${mesFuturoDate.getFullYear()}-${String(mesFuturoDate.getMonth() + 1).padStart(2, '0')}`
    expect(tipoDoMes(mes)).toBe('futuro')
  })
})

describe('proximoMes / mesAnterior', () => {
  it('avança o mês respeitando virada de ano', () => {
    expect(proximoMes('2026-04')).toBe('2026-05')
    expect(proximoMes('2026-12')).toBe('2027-01')
  })

  it('retrocede o mês respeitando virada de ano', () => {
    expect(mesAnterior('2026-04')).toBe('2026-03')
    expect(mesAnterior('2026-01')).toBe('2025-12')
  })
})
