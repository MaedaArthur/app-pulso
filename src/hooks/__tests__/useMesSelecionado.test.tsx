import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMesSelecionado } from '../useMesSelecionado'
import { mesAtualIso, limitesDoMes } from '../../lib/datas'

function wrapper(initial: string): (props: { children: ReactNode }) => ReactNode {
  return ({ children }) => (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('useMesSelecionado', () => {
  it('retorna mês atual quando ?mes= está ausente', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/'),
    })
    const atual = mesAtualIso()
    expect(result.current.mes).toBe(atual)
    expect(result.current.isMesAtual).toBe(true)
    expect(result.current.tipo).toBe('atual')
  })

  it('lê o mês do query param ?mes=YYYY-MM', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2020-05'),
    })
    expect(result.current.mes).toBe('2020-05')
    expect(result.current.isMesAtual).toBe(false)
    expect(result.current.tipo).toBe('passado')
  })

  it('retorna inicio e fim corretos do mês', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2026-04'),
    })
    expect(result.current.inicio).toBe('2026-04-01')
    expect(result.current.fim).toBe('2026-05-01')
  })

  it('cai no mês atual quando ?mes= tem valor inválido', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=invalido'),
    })
    expect(result.current.mes).toBe(mesAtualIso())
  })

  it('cai no mês atual quando ?mes= tem mês inválido', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2026-13'),
    })
    expect(result.current.mes).toBe(mesAtualIso())
  })

  it('setMes atualiza a URL com o novo mês', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/'),
    })
    act(() => {
      result.current.setMes('2026-02')
    })
    expect(result.current.mes).toBe('2026-02')
    expect(result.current.inicio).toBe('2026-02-01')
  })

  it('proximoMes e mesAnterior navegam respeitando virada de ano', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2025-12'),
    })
    act(() => {
      result.current.proximoMes()
    })
    expect(result.current.mes).toBe('2026-01')
    act(() => {
      result.current.mesAnterior()
    })
    expect(result.current.mes).toBe('2025-12')
  })

  it('voltarAoAtual limpa o query param (= mês atual)', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2020-05'),
    })
    act(() => {
      result.current.voltarAoAtual()
    })
    expect(result.current.mes).toBe(mesAtualIso())
    expect(result.current.isMesAtual).toBe(true)
  })

  it('limites do mês consistentes com limitesDoMes()', () => {
    const { result } = renderHook(() => useMesSelecionado(), {
      wrapper: wrapper('/?mes=2024-02'),
    })
    expect(result.current).toMatchObject(limitesDoMes('2024-02'))
  })
})
