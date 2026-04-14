import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { track } from '../lib/analytics'

export interface MovimentacaoReserva {
  id: string
  valor: number
  descricao: string | null
  created_at: string
}

export function useMovimentacoesReserva() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['movimentacoes-reserva', user?.id],
    queryFn: async (): Promise<MovimentacaoReserva[]> => {
      const { data, error } = await supabase
        .from('movimentacoes_reserva')
        .select('id, valor, descricao, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as MovimentacaoReserva[]
    },
    enabled: !!user,
  })
}

export function useNetMovimentacoesReserva() {
  const { data: movimentacoes = [] } = useMovimentacoesReserva()
  return movimentacoes.reduce((sum, m) => sum + m.valor, 0)
}

export function useAdicionarMovimentacaoReserva() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ valor, descricao }: { valor: number; descricao?: string }) => {
      const { error } = await supabase
        .from('movimentacoes_reserva')
        .insert({ user_id: user!.id, valor, descricao: descricao ?? null })
      if (error) throw error
    },
    onSuccess: (_data, { valor }) => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-reserva'] })
      track('reserva_movimentada', { tipo: valor > 0 ? 'deposito' : 'saque' })
    },
  })
}
