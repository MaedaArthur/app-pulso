import { useState } from 'react'
import { CHANGELOG } from '../../lib/changelog'
import type { ChangelogEntry } from '../../lib/changelog'

const TIPO_CONFIG: Record<ChangelogEntry['tipo'], { label: string; cor: string }> = {
  novo:      { label: 'Novo',     cor: 'text-indigo-400 bg-indigo-500/10' },
  melhoria:  { label: 'Melhoria', cor: 'text-emerald-400 bg-emerald-500/10' },
  fix:       { label: 'Fix',      cor: 'text-amber-400 bg-amber-500/10' },
}

const CLOSE_DURATION = 260

interface Props {
  onFechar: () => void
}

export default function WhatsNewSheet({ onFechar }: Props) {
  const [closing, setClosing] = useState(false)

  function handleFechar() {
    setClosing(true)
    setTimeout(onFechar, CLOSE_DURATION)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/60 ${closing ? 'backdrop-out' : 'backdrop-in'}`}
        onClick={handleFechar}
      />
      <div className={`relative w-full max-w-md bg-slate-900 rounded-t-2xl pb-10 ${closing ? 'sheet-out' : 'sheet-in'}`}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        <div className="px-5 pt-3 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎉</span>
            <p className="text-base font-bold">{CHANGELOG.titulo}</p>
          </div>

          <div className="space-y-3">
            {CHANGELOG.entradas.map((entrada, i) => {
              const cfg = TIPO_CONFIG[entrada.tipo]
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cfg.cor}`}>
                    {cfg.label}
                  </span>
                  <p className="text-sm text-slate-300 leading-snug">{entrada.texto}</p>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleFechar}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
          >
            Entendido →
          </button>
        </div>
      </div>
    </div>
  )
}
