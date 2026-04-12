import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'

type DadosPerfil = Partial<Omit<Perfil, 'id' | 'created_at' | 'onboarding_completo'>>

export function useAtualizarPerfil() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dados: DadosPerfil) => {
      const { error } = await supabase
        .from('perfis')
        .update(dados)
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
    },
  })
}
