import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export type TipoReport = 'bug' | 'sugestao' | 'outro'

export function useEnviarReport() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ tipo, descricao }: { tipo: TipoReport; descricao: string }) => {
      const { error } = await supabase
        .from('reports')
        .insert({ user_id: user!.id, tipo, descricao })
      if (error) throw error
    },
  })
}
