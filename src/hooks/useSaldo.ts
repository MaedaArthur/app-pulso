import { usePerfil } from './usePerfil'
import { useEntradas } from './useEntradas'
import { useGastos } from './useGastos'
import { useTotalEntradasHistorico, useTotalGastosHistorico } from './useHistorico'
import { useMovimentacoesReserva } from './useMovimentacoesReserva'
import { calcularSaldo, estadoDoMes, ritmoDeMes, calcularSaudeReserva, calcularProjecaoMeta } from '../lib/finance'
import type { ResultadoRitmo, SaudeReserva, ProjecaoMeta } from '../lib/finance'
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
  saudeReserva: SaudeReserva | null
  metaPoupancaMensal: number
  projecaoMeta: ProjecaoMeta | null
  reservaTotal: number
  netMovimentosReserva: number
  isLoading: boolean
}

export function useSaldo(): ResultadoSaldo {
  const { data: perfil, isLoading: perfilLoading } = usePerfil()
  const { data: entradas = [], isLoading: entradasLoading } = useEntradas()
  const { data: gastos = [], isLoading: gastosLoading } = useGastos()
  const { data: totalEntradasHistorico = 0, isLoading: entradasHistLoading } = useTotalEntradasHistorico()
  const { data: totalGastosHistorico = 0, isLoading: gastosHistLoading } = useTotalGastosHistorico()
  const { data: movimentacoes = [], isLoading: movimentacoesLoading } = useMovimentacoesReserva()

  const isLoading = perfilLoading || entradasLoading || gastosLoading || entradasHistLoading || gastosHistLoading || movimentacoesLoading

  const netMovimentosReserva = movimentacoes.reduce((sum, m) => sum + m.valor, 0)

  // Totais mensais — usados no resumo, ritmo e categorias
  const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0)

  const tipoReserva = perfil?.tipo_reserva ?? null

  // Saldo usa histórico completo — não zera na virada do mês
  const saldoReal = calcularSaldo({
    dinheiroGuardado: perfil?.dinheiro_guardado ?? 0,
    tipoReserva,
    totalEntradasNoMes: totalEntradasHistorico,
    totalGastoNoMes: totalGastosHistorico,
    netMovimentosReserva,
  })

  const metaPoupancaMensal = perfil?.meta_poupanca_mensal ?? 0

  const projecaoMeta = calcularProjecaoMeta({
    totalEntradasMes: totalEntradas,
    totalGastosMes: totalGastos,
    metaPoupancaMensal,
    diasPassados: diasPassadosNoMes(),
    diasTotaisMes: diasTotaisDoMes(),
  })

  const reservaTotal = (perfil?.dinheiro_guardado ?? 0) + netMovimentosReserva

  const saudeReserva = reservaTotal > 0
    ? calcularSaudeReserva({
        dinheiroGuardado: reservaTotal,
        gastosFixosMensais: perfil?.gastos_fixos_mensais ?? 0,
        saldoMes: saldoReal,
      })
    : null

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
  // eslint-disable-next-line react-hooks/purity
  const agora = Date.now()
  const gastosDesatualizados = ultimoImport
    ? agora - new Date(ultimoImport).getTime() > SETE_DIAS
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
    saudeReserva,
    metaPoupancaMensal,
    projecaoMeta,
    reservaTotal,
    netMovimentosReserva,
    isLoading,
  }
}
