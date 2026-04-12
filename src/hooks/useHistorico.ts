import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function useTotalEntradasHistorico() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['entradas-historico', user?.id],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('entradas')
        .select('valor')
        .eq('user_id', user!.id)
      if (error) throw error
      return (data ?? []).reduce((sum, e) => sum + e.valor, 0)
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTotalGastosHistorico() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['gastos-historico', user?.id],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('gastos')
        .select('valor')
        .eq('user_id', user!.id)
      if (error) throw error
      return (data ?? []).reduce((sum, g) => sum + g.valor, 0)
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}
