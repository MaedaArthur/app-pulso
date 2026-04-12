import { usePerfil } from './usePerfil'
import { useEntradas } from './useEntradas'
import { useGastos } from './useGastos'
import { calcularSaldo, estadoDoMes, ritmoDeMes } from '../lib/finance'
import type { ResultadoRitmo } from '../lib/finance'
import { diasTotaisDoMes, diasPassadosNoMes } from '../lib/datas'
import type { Entrada, Gasto, Perfil, Categoria, EstadoMes } from '../types'

export interface GastosPorCategoria {
  categoria: Categoria
  total: number
  itens: Gasto[]
}

export interface ResultadoSaldo {
  saldoReal: number
  estado: EstadoMes
  ritmo: ResultadoRitmo
  totalEntradas: number
  totalGastos: number
  entradas: Entrada[]
  gastos: Gasto[]
  gastosPorCategoria: GastosPorCategoria[]
  perfil: Perfil | undefined
  gastosDesatualizados: boolean
  ultimoImport: string | null
  isLoading: boolean
}

export function useSaldo(): ResultadoSaldo {
  const { data: perfil, isLoading: perfilLoading } = usePerfil()
  const { data: entradas = [], isLoading: entradasLoading } = useEntradas()
  const { data: gastos = [], isLoading: gastosLoading } = useGastos()

  const isLoading = perfilLoading || entradasLoading || gastosLoading

  const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0)

  const saldoReal = calcularSaldo({
    dinheiroGuardado: perfil?.dinheiro_guardado ?? 0,
    totalGastoNoMes: totalGastos,
    metaPoupancaMensal: perfil?.meta_poupanca_mensal ?? 0,
  })

  const estado = estadoDoMes({
    saldoReal,
    rendaMensalEstimada: perfil?.renda_mensal_estimada ?? 0,
  })

  const ritmo = ritmoDeMes({
    totalGastoNoMes: totalGastos,
    gastoFixosMensais: perfil?.gastos_fixos_mensais ?? 0,
    rendaMensalEstimada: perfil?.renda_mensal_estimada ?? 0,
    diasPassados: diasPassadosNoMes(),
    diasTotaisMes: diasTotaisDoMes(),
  })

  const gastosPorCategoria: GastosPorCategoria[] = Object.entries(
    gastos.reduce((acc, g) => {
      const cat = g.categoria as Categoria
      if (!acc[cat]) acc[cat] = { categoria: cat, total: 0, itens: [] }
      acc[cat].total += g.valor
      acc[cat].itens.push(g)
      return acc
    }, {} as Record<string, GastosPorCategoria>)
  )
    .map(([, v]) => v)
    .sort((a, b) => b.total - a.total)

  const ultimoImport = gastos.length > 0
    ? gastos.reduce((max, g) => (g.created_at > max ? g.created_at : max), gastos[0].created_at)
    : null

  const SETE_DIAS = 7 * 24 * 60 * 60 * 1000
  const gastosDesatualizados = ultimoImport
    ? Date.now() - new Date(ultimoImport).getTime() > SETE_DIAS
    : false

  return {
    saldoReal,
    estado,
    ritmo,
    totalEntradas,
    totalGastos,
    entradas,
    gastos,
    gastosPorCategoria,
    perfil,
    gastosDesatualizados,
    ultimoImport,
    isLoading,
  }
}
