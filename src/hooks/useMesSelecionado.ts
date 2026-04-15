import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  limitesDoMes,
  mesAnterior,
  mesAtualIso,
  mesEhValido,
  proximoMes,
  tipoDoMes,
  type TipoMes,
} from '../lib/datas'

export interface MesSelecionado {
  mes: string        // "YYYY-MM"
  inicio: string     // "YYYY-MM-01"
  fim: string        // "YYYY-MM-01" do mês seguinte
  isMesAtual: boolean
  tipo: TipoMes
  setMes: (mes: string) => void
  proximoMes: () => void
  mesAnterior: () => void
  voltarAoAtual: () => void
}

// Fonte única de verdade para o mês visualizado na dashboard: query param `mes`.
// Ausente ou inválido → mês corrente do relógio.
export function useMesSelecionado(): MesSelecionado {
  const [searchParams, setSearchParams] = useSearchParams()
  const atual = mesAtualIso()

  const paramMes = searchParams.get('mes')
  const mes = paramMes && mesEhValido(paramMes) ? paramMes : atual

  const { inicio, fim } = useMemo(() => limitesDoMes(mes), [mes])
  const isMesAtual = mes === atual
  const tipo = tipoDoMes(mes)

  const setMes = useCallback(
    (novo: string) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev)
          if (novo === atual) next.delete('mes')
          else next.set('mes', novo)
          return next
        },
        { replace: false }
      )
    },
    [setSearchParams, atual]
  )

  const avancar = useCallback(() => setMes(proximoMes(mes)), [setMes, mes])
  const retroceder = useCallback(() => setMes(mesAnterior(mes)), [setMes, mes])
  const voltarAoAtual = useCallback(() => setMes(atual), [setMes, atual])

  return {
    mes,
    inicio,
    fim,
    isMesAtual,
    tipo,
    setMes,
    proximoMes: avancar,
    mesAnterior: retroceder,
    voltarAoAtual,
  }
}
