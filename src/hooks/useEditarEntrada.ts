import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { normalizarMesReferencia } from '../lib/datas'

interface EdicaoEntrada {
  id: string
  valor: number
  fonte: string
  data: string
  mes_referencia?: string // default: mês da data
}

export function useEditarEntrada() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, valor, fonte, data, mes_referencia }: EdicaoEntrada) => {
      const mesRef = mes_referencia ?? normalizarMesReferencia(data)
      const { error } = await supabase
        .from('entradas')
        .update({ valor, fonte, data, mes_referencia: mesRef })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] })
      queryClient.invalidateQueries({ queryKey: ['entradas-historico'] })
    },
  })
}
