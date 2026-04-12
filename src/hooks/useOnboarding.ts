import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'

type DadosOnboarding = Pick<
  Perfil,
  'como_recebe' | 'renda_mensal_estimada' | 'gastos_fixos_mensais' | 'onde_guarda' | 'foco'
>

export function useOnboarding() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dados: DadosOnboarding) => {
      const { error } = await supabase
        .from('perfis')
        .update({ ...dados, onboarding_completo: true })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
    },
  })
}
