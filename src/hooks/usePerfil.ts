import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'

export function usePerfil() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['perfil', user?.id],
    queryFn: async (): Promise<Perfil> => {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data as Perfil
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}
