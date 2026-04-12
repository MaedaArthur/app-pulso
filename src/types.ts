export interface Perfil {
  id: string
  nome: string | null
  dinheiro_guardado: number
  meta_poupanca_mensal: number
  gastos_fixos_mensais: number
  renda_mensal_estimada: number
  como_recebe: string | null
  onde_guarda: string | null
  foco: string | null
  tipo_reserva: 'buffer' | 'reserva' | null
  onboarding_completo: boolean
  dica_csv_vista: boolean
  tutorial_visto: boolean
  created_at: string
}

export interface Entrada {
  id: string
  user_id: string
  valor: number
  fonte: string
  data: string
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  valor: number
  titulo: string
  categoria: string
  data: string
  origem: string
  hash: string
  created_at: string
}

export type EstadoMes = 'verde' | 'amarelo' | 'vermelho'

export type Categoria = string
