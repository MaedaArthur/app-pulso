import { useNavigate } from 'react-router-dom'
import type { SaudeReserva } from '../../lib/finance'
import { formatBRL } from '../../lib/fmt'

const ESTADO_COR: Record<SaudeReserva['estado'], string> = {
  verde:    'text-emerald-400',
  amarelo:  'text-amber-400',
  vermelho: 'text-red-400',
}

const ESTADO_BARRA: Record<SaudeReserva['estado'], string> = {
  verde:    'bg-emerald-500',
  amarelo:  'bg-amber-500',
  vermelho: 'bg-red-500',
}

interface Props {
  saude: SaudeReserva
  reservaTotal: number
}

export default function ReservaCard({ saude, reservaTotal }: Props) {
  const navigate = useNavigate()

  const meses = saude.mesesCobertos
  const mesesFormatado = meses >= 12
    ? `${Math.floor(meses / 12)}a ${Math.round(meses % 12)}m`
    : `${meses.toFixed(1).replace('.', ',')} meses`

  const porcentBarra = Math.min(1, meses / 6) * 100

  return (
    <div data-tour="reserva" className="bg-slate-900 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold">🔒 Reserva</p>
        <button
          onClick={() => navigate('/reserva')}
          className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          {formatBRL(reservaTotal)} · gerenciar →
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">cobre</p>
        <p className={`text-xs font-semibold ${ESTADO_COR[saude.estado]}`}>{mesesFormatado}</p>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${ESTADO_BARRA[saude.estado]} rounded-full transition-all`}
          style={{ width: `${porcentBarra}%` }}
        />
      </div>

      {saude.estado === 'vermelho' && (
        <p className="text-xs text-red-400/80 leading-relaxed">
          Sua reserva cobre menos de 3 meses. Tente não mexer nela.
        </p>
      )}

      {saude.disponivelParaUsar > 0 && (
        <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <p className="text-xs text-amber-300 leading-relaxed">
            Você pode usar até <span className="font-semibold">{formatBRL(saude.disponivelParaUsar)}</span> da reserva este mês sem comprometer o colchão de 3 meses.
          </p>
        </div>
      )}
    </div>
  )
}
