import { useNavigate } from 'react-router-dom'
import type { EstadoMes } from '../../types'
import { formatBRL } from '../../lib/fmt'

const GRADIENTES: Record<EstadoMes, string> = {
  verde:    'from-emerald-900 to-emerald-700',
  amarelo:  'from-amber-900 to-amber-700',
  vermelho: 'from-red-900 to-red-700',
}

const LABELS: Record<EstadoMes, string> = {
  verde:    '😊 Você está bem esse mês',
  amarelo:  '😐 Atenção com os gastos',
  vermelho: '😬 Mês no vermelho',
}

interface Props {
  nome: string | null
  saldoReal: number
  estado: EstadoMes
  gastosDesatualizados: boolean
  semDados: boolean
  metaPoupancaMensal: number
}

export default function HeroStatus({ nome, saldoReal, estado, gastosDesatualizados, semDados, metaPoupancaMensal }: Props) {
  const navigate = useNavigate()
  const primeiroNome = nome?.split(' ')[0] ?? 'você'

  if (semDados) {
    return (
      <div className="rounded-2xl bg-slate-900 p-5 mb-4">
        <p className="text-sm text-slate-400 mb-3">Olá, {primeiroNome} 👋</p>
        <p className="text-sm font-medium text-slate-300 mb-1">Configure seu saldo para começar</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Vá em Config e informe quanto você tem guardado. Depois registre suas entradas e importe seus gastos do Nubank.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${GRADIENTES[estado]} p-5 mb-4`}>
      <p className="text-sm text-white/70 mb-3">Olá, {primeiroNome} 👋</p>

      <p className="text-sm font-medium text-white/80 mb-1">{LABELS[estado]}</p>

      <p className="text-5xl font-bold tracking-tight text-white mb-1">
        {formatBRL(saldoReal)}
      </p>
      <p className="text-xs text-white/60">disponível no momento</p>

      {metaPoupancaMensal > 0 && (
        <p className="text-xs text-white/50 mt-1">
          🎯 meta de guardar {formatBRL(metaPoupancaMensal)} esse mês
        </p>
      )}

      {gastosDesatualizados && (
        <button
          onClick={() => navigate('/gastos')}
          className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-xs text-white/90 transition-colors w-full"
        >
          <span>⚠️</span>
          <span>Gastos desatualizados · importar →</span>
        </button>
      )}
    </div>
  )
}
