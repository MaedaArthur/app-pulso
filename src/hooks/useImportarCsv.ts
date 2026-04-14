import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { parseCsvNubank } from '../lib/csvParser'
import type { GastoParseado } from '../lib/csvParser'
import { categorizar } from '../lib/categories'
import { hashGasto } from '../lib/hashGasto'
import { getMesAtual } from '../lib/datas'
import { useCorrecoesCategorias } from './useCategorias'
import type { Categoria } from '../types'
import { track } from '../lib/analytics'

export interface CategoriaSummary {
  categoria: Categoria
  total: number
  count: number
}

export interface PreviewImport {
  gastos: GastoParseado[]
  porCategoria: CategoriaSummary[]
  totalGeral: number
  ignoradosOutroMes: number
}

export async function parseFile(file: File): Promise<PreviewImport> {
  const content = await file.text()
  const { tipo, gastos: todos } = parseCsvNubank(content)

  // A fatura do cartão atravessa meses: compras de março aparecem na fatura
  // que é paga em abril. Então, no import de crédito, mantemos todas as compras
  // da fatura e reatribuímos ao mês de referência (o mês em que o usuário paga).
  // Para Pix/débito, ainda filtramos pelo mês atual, pois cada transação é paga
  // na hora.
  const { inicio, fim } = getMesAtual()
  let gastos: GastoParseado[]
  let ignoradosOutroMes: number

  if (tipo === 'credito') {
    // Descarta apenas compras futuras (datas >= fim do mês atual). Compras
    // anteriores ao início do mês são remapeadas para o primeiro dia do mês
    // de referência.
    const dentroDaFatura = todos.filter(g => g.data < fim)
    gastos = dentroDaFatura.map(g =>
      g.data < inicio ? { ...g, data: inicio } : g
    )
    ignoradosOutroMes = todos.length - dentroDaFatura.length
  } else {
    gastos = todos.filter(g => g.data >= inicio && g.data < fim)
    ignoradosOutroMes = todos.length - gastos.length
  }

  const acc: Record<string, CategoriaSummary> = {}
  for (const g of gastos) {
    const cat = categorizar(g.titulo) as Categoria
    if (!acc[cat]) acc[cat] = { categoria: cat, total: 0, count: 0 }
    acc[cat].total += g.valor
    acc[cat].count += 1
  }

  const porCategoria = Object.values(acc).sort((a, b) => b.total - a.total)
  const totalGeral = gastos.reduce((sum, g) => sum + g.valor, 0)

  return { gastos, porCategoria, totalGeral, ignoradosOutroMes }
}

export function useImportarCsv() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: correcoes } = useCorrecoesCategorias()

  const importar = useMutation({
    mutationFn: async ({ gastos, substituir = false }: { gastos: GastoParseado[]; substituir?: boolean }) => {
      if (substituir) {
        const { inicio, fim } = getMesAtual()
        const { error: errDelete } = await supabase
          .from('gastos')
          .delete()
          .eq('user_id', user!.id)
          .eq('origem', 'csv')
          .gte('data', inicio)
          .lt('data', fim)
        if (errDelete) throw errDelete
      }

      const rows = await Promise.all(
        gastos.map(async g => ({
          user_id: user!.id,
          valor: g.valor,
          titulo: g.titulo,
          categoria: categorizar(g.titulo, correcoes),
          data: g.data,
          origem: 'csv',
          hash: await hashGasto(user!.id, g.data, g.titulo, g.valor),
        }))
      )

      const { error } = await supabase
        .from('gastos')
        .upsert(rows, { onConflict: 'user_id,hash', ignoreDuplicates: true })

      if (error) throw error
    },
    onSuccess: (_data, { gastos, substituir }) => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
      track('gasto_importado', { quantidade: gastos.length, substituiu: substituir ?? false })
    },
  })

  return { importar }
}
