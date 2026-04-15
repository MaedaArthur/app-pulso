import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { normalizarMesReferencia } from '../lib/datas'
import { track } from '../lib/analytics'

interface NovaEntrada {
  valor: number
  fonte: string
  data: string
  mes_referencia?: string // default: mês da data
}

export function useAdicionarEntrada() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entrada: NovaEntrada) => {
      const mesRef = entrada.mes_referencia ?? normalizarMesReferencia(entrada.data)
      const { error } = await supabase
        .from('entradas')
        .insert({ ...entrada, mes_referencia: mesRef, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] })
      queryClient.invalidateQueries({ queryKey: ['entradas-historico'] })
      track('entrada_adicionada')
    },
  })
}
