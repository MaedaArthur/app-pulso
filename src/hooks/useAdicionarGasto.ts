import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { hashGasto } from '../lib/hashGasto'
import { normalizarMesReferencia } from '../lib/datas'
import { track } from '../lib/analytics'

interface NovoGasto {
  valor: number
  titulo: string
  categoria: string
  data: string
  mes_referencia?: string // default: mês da data
}

export function useAdicionarGasto() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (g: NovoGasto) => {
      const mesRef = g.mes_referencia ?? normalizarMesReferencia(g.data)
      const hash = await hashGasto(user!.id, g.data, g.titulo, g.valor)
      const { error } = await supabase
        .from('gastos')
        .insert({
          user_id: user!.id,
          valor: g.valor,
          titulo: g.titulo,
          categoria: g.categoria,
          data: g.data,
          mes_referencia: mesRef,
          origem: 'manual',
          hash,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['gastos-historico'] })
      track('gasto_adicionado_manual')
    },
  })
}
