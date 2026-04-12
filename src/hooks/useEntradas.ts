import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getMesAtual } from '../lib/datas'
import type { Entrada } from '../types'

export function useEntradas() {
  const { user } = useAuth()
  const { inicio, fim } = getMesAtual()

  return useQuery({
    queryKey: ['entradas', user?.id, inicio],
    queryFn: async (): Promise<Entrada[]> => {
      const { data, error } = await supabase
        .from('entradas')
        .select('*')
        .eq('user_id', user!.id)
        .gte('data', inicio)
        .lt('data', fim)
        .order('data', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
