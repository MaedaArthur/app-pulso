import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useMesSelecionado } from './useMesSelecionado'
import type { Entrada } from '../types'

export function useEntradas() {
  const { user } = useAuth()
  const { inicio, fim, mes } = useMesSelecionado()

  return useQuery({
    queryKey: ['entradas', user?.id, mes],
    queryFn: async (): Promise<Entrada[]> => {
      const { data, error } = await supabase
        .from('entradas')
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
