import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface NovaEntrada {
  valor: number
  fonte: string
  data: string
}

export function useAdicionarEntrada() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entrada: NovaEntrada) => {
      const { error } = await supabase
        .from('entradas')
        .insert({ ...entrada, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] })
      queryClient.invalidateQueries({ queryKey: ['entradas-historico'] })
    },
  })
}
