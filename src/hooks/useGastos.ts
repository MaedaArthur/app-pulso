import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useMesSelecionado } from './useMesSelecionado'
import type { Gasto } from '../types'

export function useGastos() {
  const { user } = useAuth()
  const { inicio, fim, mes } = useMesSelecionado()

  return useQuery({
    queryKey: ['gastos', user?.id, mes],
    queryFn: async (): Promise<Gasto[]> => {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user!.id)
        .gte('mes_referencia', inicio)
        .lt('mes_referencia', fim)
        .order('data', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
