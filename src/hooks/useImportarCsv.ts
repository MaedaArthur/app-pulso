import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { parseCsvNubank } from '../lib/csvParser'
import type { GastoParseado, TipoCSV } from '../lib/csvParser'
import { categorizar } from '../lib/categories'
import { hashGasto } from '../lib/hashGasto'
import { getMesAtual } from '../lib/datas'
import { useCorrecoesCategorias } from './useCategorias'
import type { Categoria } from '../types'

export interface CategoriaSummary {
  categoria: Categoria
  total: number
  count: number
}

export interface PreviewImport {
  tipo: TipoCSV
  gastos: GastoParseado[]
  porCategoria: CategoriaSummary[]
  totalGeral: number
  ignoradosOutroMes: number
}

// Remapeia uma data YYYY-MM-DD para o mesmo dia no mês/ano informado.
// O dia é limitado ao último dia do mês destino para evitar datas inválidas.
function remapearParaMes(data: string, mesAtual: string, ultimoDia: number): string {
  const dia = parseInt(data.split('-')[2], 10)
  const diaAjustado = Math.min(dia, ultimoDia)
  return `${mesAtual}-${String(diaAjustado).padStart(2, '0')}`
}

export async function parseFile(file: File): Promise<PreviewImport> {
  const content = await file.text()
  const { tipo, gastos: todos } = parseCsvNubank(content)

  const agora = new Date()
  const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`

  let gastos: GastoParseado[]
  let ignoradosOutroMes: number

  if (tipo === 'credito') {
    // A fatura de crédito cobre um ciclo de faturamento que cruza a virada do mês.
    // Importamos todos os gastos da fatura e os atribuímos ao mês atual
    // (mês em que a fatura será paga), preservando o dia original.
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
    gastos = todos.map(g =>
      g.data.startsWith(mesAtual)
        ? g
        : { ...g, data: remapearParaMes(g.data, mesAtual, ultimoDia) }
    )
    ignoradosOutroMes = 0
  } else {
    // Para Pix/débito a data da transação é a data do pagamento:
    // filtra apenas o mês atual.
    gastos = todos.filter(g => g.data.startsWith(mesAtual))
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

  return { tipo, gastos, porCategoria, totalGeral, ignoradosOutroMes }
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
    },
  })

  return { importar }
}
