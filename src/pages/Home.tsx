import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function Home() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()

  async function resetarOnboarding() {
    await supabase
      .from('perfis')
      .update({
        onboarding_completo: false,
        como_recebe: null,
        renda_mensal_estimada: 0,
        gastos_fixos_mensais: 0,
        onde_guarda: null,
        foco: null,
      })
      .eq('id', user!.id)
    queryClient.invalidateQueries({ queryKey: ['perfil'] })
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-slate-400 text-sm">Home (em breve)</p>

      {import.meta.env.DEV && (
        <div className="border border-dashed border-slate-700 rounded-xl p-3 space-y-2">
          <p className="text-xs text-slate-500 font-mono">DEV</p>
          <button
            onClick={resetarOnboarding}
            className="w-full text-sm bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-yellow-400 transition-colors"
          >
            ↺ Resetar onboarding
          </button>
          <button
            onClick={signOut}
            className="w-full text-sm bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-red-400 transition-colors"
          >
            → Sair da conta
          </button>
        </div>
      )}
    </div>
  )
}
