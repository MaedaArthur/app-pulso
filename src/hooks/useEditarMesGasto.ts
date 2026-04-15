import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface Args {
  id: string
  mes_referencia: string // "YYYY-MM-01"
}

export function useEditarMesGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, mes_referencia }: Args) => {
      const { error } = await supabase
        .from('gastos')
        .update({ mes_referencia })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      // Invalida todas as queries de gastos (mês antigo e novo ficam cobertos
      // porque a queryKey é prefixada com 'gastos').
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
    },
  })
}
