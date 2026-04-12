import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSaldo } from '../hooks/useSaldo'
import { useAuth } from '../contexts/AuthContext'
import { useTour } from '../contexts/TourContext'
import { supabase } from '../lib/supabase'
import { diasPassadosNoMes, diasTotaisDoMes } from '../lib/datas'
import HeroStatus from '../components/home/HeroStatus'
import RitmoDoMes from '../components/home/RitmoDoMes'
import ResumoEntradaGasto from '../components/home/ResumoEntradaGasto'
import CategoriasGastos from '../components/home/CategoriasGastos'
import ReservaCard from '../components/home/ReservaCard'
import DinheiroGuardadoCard from '../components/home/DinheiroGuardadoCard'
import MetaCard from '../components/home/MetaCard'

function DevTools() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  async function resetarOnboarding() {
    await supabase.from('perfis').update({
      onboarding_completo: false,
      como_recebe: null,
      renda_mensal_estimada: 0,
      gastos_fixos_mensais: 0,
      dinheiro_guardado: 0,
      meta_poupanca_mensal: 0,
      onde_guarda: null,
      foco: null,
      tipo_reserva: null,
    }).eq('id', user!.id)
    queryClient.removeQueries({ queryKey: ['perfil'] })
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="border border-dashed border-slate-700 rounded-xl p-3 mb-4 space-y-2">
      <p className="text-xs text-slate-600 font-mono uppercase tracking-wide">dev</p>
      <button onClick={resetarOnboarding} className="w-full text-sm bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-yellow-400 transition-colors">
        ↺ Resetar onboarding
      </button>
      <button onClick={signOut} className="w-full text-sm bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-red-400 transition-colors">
        → Sair da conta
      </button>
    </div>
  )
}

export default function Home() {
  const {
    saldoReal,
    estado,
    ritmo,
    totalEntradas,
    totalGastos,
    entradas,
    gastos,
    gastosPorCategoria,
    perfil,
    gastosDesatualizados,
    saudeReserva,
    metaPoupancaMensal,
    projecaoMeta,
    isLoading,
  } = useSaldo()

  const { iniciar } = useTour()

  useEffect(() => {
    if (perfil && perfil.tutorial_visto === false && !isLoading) {
      const timer = setTimeout(iniciar, 400)
      return () => clearTimeout(timer)
    }
  }, [perfil, isLoading, iniciar])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Carregando...
      </div>
    )
  }

  const semDados = (perfil?.dinheiro_guardado ?? 0) === 0 && totalEntradas === 0 && totalGastos === 0

  return (
    <div className="p-4">
      {import.meta.env.DEV && <DevTools />}

      <HeroStatus
        nome={perfil?.nome ?? null}
        saldoReal={saldoReal}
        estado={estado}
        gastosDesatualizados={gastosDesatualizados}
        semDados={semDados}
        metaPoupancaMensal={metaPoupancaMensal}
      />

      {!semDados && perfil?.tipo_reserva !== 'reserva' && (
        <DinheiroGuardadoCard valor={perfil?.dinheiro_guardado ?? 0} />
      )}

      {projecaoMeta && <MetaCard projecao={projecaoMeta} />}

      <RitmoDoMes
        ritmo={ritmo}
        estado={estado}
        totalGastos={totalGastos}
        diasPassados={diasPassadosNoMes()}
        diasTotais={diasTotaisDoMes()}
      />

      {saudeReserva && perfil && (
        <ReservaCard saude={saudeReserva} perfil={perfil} />
      )}

      <ResumoEntradaGasto
        totalEntradas={totalEntradas}
        totalGastos={totalGastos}
        ultimasEntradas={entradas.slice(0, 3)}
        ultimosGastos={gastos.slice(0, 3)}
      />

      <CategoriasGastos
        gastosPorCategoria={gastosPorCategoria}
        totalGastos={totalGastos}
      />
    </div>
  )
}
