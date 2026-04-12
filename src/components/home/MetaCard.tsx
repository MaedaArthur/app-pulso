import type { ProjecaoMeta } from '../../lib/finance'
import { formatBRL } from '../../lib/fmt'

interface Props {
  projecao: ProjecaoMeta
}

export default function MetaCard({ projecao }: Props) {
  const { projecao: valor, percentual, metaPoupancaMensal } = projecao
  const pct = Math.round(percentual * 100)
  const atingida = percentual >= 1

  return (
    <div data-tour="meta" className="bg-slate-900 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">🎯 Meta de poupança</p>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          atingida
            ? 'bg-emerald-900/50 text-emerald-400'
            : pct >= 60
              ? 'bg-indigo-900/50 text-indigo-400'
              : 'bg-amber-900/50 text-amber-400'
        }`}>
          {pct}%
        </span>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            atingida ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between items-baseline">
        <p className="text-xs text-slate-400">
          {atingida
            ? '🎉 Meta atingida no ritmo atual!'
            : `você pode guardar ${formatBRL(valor)} se continuar assim`}
        </p>
        <p className="text-xs text-slate-600 shrink-0 ml-2">
          meta {formatBRL(metaPoupancaMensal)}
        </p>
      </div>
    </div>
  )
}
