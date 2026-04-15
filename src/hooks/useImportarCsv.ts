import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { parseCsvNubank } from '../lib/csvParser'
import type { GastoParseado } from '../lib/csvParser'
import { categorizar } from '../lib/categories'
import { hashGasto } from '../lib/hashGasto'
import { mesAtualIso, normalizarMesReferencia } from '../lib/datas'
import { useCorrecoesCategorias } from './useCategorias'
import type { Categoria } from '../types'
import { track } from '../lib/analytics'

export interface CategoriaSummary {
  categoria: Categoria
  total: number
  count: number
}

export interface PreviewImport {
  tipo: 'credito' | 'pix'
  gastos: GastoParseado[]
  porCategoria: CategoriaSummary[]
  totalGeral: number
  mesReferenciaSugerido: string // "YYYY-MM-01"
  mesesDistintos: number        // quantidade de meses distintos nas compras
  aviso?: string                // aviso opcional quando CSV abrange ≥3 meses
}

function sugerirMesReferencia(gastos: GastoParseado[]): string {
  if (gastos.length === 0) {
    return normalizarMesReferencia(new Date())
  }
  // Mês da compra mais recente = mês em que a fatura (ou os gastos pix) é paga.
  const maisRecente = gastos.reduce((max, g) => (g.data > max ? g.data : max), gastos[0].data)
  return normalizarMesReferencia(maisRecente)
}

function contarMesesDistintos(gastos: GastoParseado[]): number {
  const s = new Set(gastos.map(g => g.data.slice(0, 7)))
  return s.size
}

export async function parseFile(file: File): Promise<PreviewImport> {
  const content = await file.text()
  const { tipo, gastos } = parseCsvNubank(content)

  const mesReferenciaSugerido = sugerirMesReferencia(gastos)
  const mesesDistintos = contarMesesDistintos(gastos)
  const aviso = mesesDistintos >= 3
    ? `O arquivo abrange ${mesesDistintos} meses diferentes. Confirme o mês de referência.`
    : undefined

  const acc: Record<string, CategoriaSummary> = {}
  for (const g of gastos) {
    const cat = categorizar(g.titulo) as Categoria
    if (!acc[cat]) acc[cat] = { categoria: cat, total: 0, count: 0 }
    acc[cat].total += g.valor
    acc[cat].count += 1
  }

  const porCategoria = Object.values(acc).sort((a, b) => b.total - a.total)
  const totalGeral = gastos.reduce((sum, g) => sum + g.valor, 0)

  return { tipo, gastos, porCategoria, totalGeral, mesReferenciaSugerido, mesesDistintos, aviso }
}

interface ImportarArgs {
  gastos: GastoParseado[]
  mesReferencia: string // YYYY-MM-01
  substituir?: boolean
}

export function useImportarCsv() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: correcoes } = useCorrecoesCategorias()

  const importar = useMutation({
    mutationFn: async ({ gastos, mesReferencia, substituir = false }: ImportarArgs) => {
      if (substituir) {
        const { error: errDelete } = await supabase
          .from('gastos')
          .delete()
          .eq('user_id', user!.id)
          .eq('origem', 'csv')
          .eq('mes_referencia', mesReferencia)
        if (errDelete) throw errDelete
      }

      const rows = await Promise.all(
        gastos.map(async g => ({
          user_id: user!.id,
          valor: g.valor,
          titulo: g.titulo,
          categoria: categorizar(g.titulo, correcoes),
          data: g.data,
          mes_referencia: mesReferencia,
          origem: 'csv',
          hash: await hashGasto(user!.id, g.data, g.titulo, g.valor),
        }))
      )

      const { error } = await supabase
        .from('gastos')
        .upsert(rows, { onConflict: 'user_id,hash', ignoreDuplicates: true })

      if (error) throw error
    },
    onSuccess: (_data, { gastos, mesReferencia, substituir }) => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
      const mesAtual = `${mesAtualIso()}-01`
      track('gasto_importado', {
        quantidade: gastos.length,
        substituiu: substituir ?? false,
        mes_referencia: mesReferencia,
        mes_referencia_diferente_do_atual: mesReferencia !== mesAtual,
      })
    },
  })

  return { importar }
}
