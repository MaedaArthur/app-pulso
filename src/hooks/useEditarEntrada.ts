import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface EdicaoEntrada {
  id: string
  valor: number
  fonte: string
  data: string
}

export function useEditarEntrada() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, valor, fonte, data }: EdicaoEntrada) => {
      const { error } = await supabase
        .from('entradas')
        .update({ valor, fonte, data })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] })
      queryClient.invalidateQueries({ queryKey: ['entradas-historico'] })
    },
  })
}
