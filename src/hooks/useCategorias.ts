import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { normalizarMerchant } from '../lib/categories'
import type { Categoria } from '../types'

export function useCorrecoesCategorias() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['categorias-usuario', user?.id],
    queryFn: async (): Promise<Map<string, Categoria>> => {
      const { data, error } = await supabase
        .from('categorias_usuario')
        .select('merchant_key, categoria')
        .eq('user_id', user!.id)
      if (error) throw error
      return new Map(data.map(r => [r.merchant_key, r.categoria as Categoria]))
    },
    enabled: !!user,
  })
}

export function useSalvarCorrecao() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ merchantKey, categoria }: { merchantKey: string; categoria: Categoria }) => {
      const { error } = await supabase
        .from('categorias_usuario')
        .upsert(
          { user_id: user!.id, merchant_key: merchantKey, categoria },
          { onConflict: 'user_id,merchant_key' }
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-usuario'] })
    },
  })
}

export function useAtualizarCategoriaGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, categoria }: { id: string; categoria: Categoria }) => {
      const { error } = await supabase
        .from('gastos')
        .update({ categoria })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
    },
  })
}

// Combina correção de categoria + regra de merchant numa operação só
export function useCorrigirCategoria() {
  const { mutate: atualizarGasto } = useAtualizarCategoriaGasto()
  const { mutate: salvarCorrecao } = useSalvarCorrecao()

  return function corrigir(gastoId: string, titulo: string, categoria: Categoria) {
    const merchantKey = normalizarMerchant(titulo)
    atualizarGasto({ id: gastoId, categoria })
    salvarCorrecao({ merchantKey, categoria })
  }
}
