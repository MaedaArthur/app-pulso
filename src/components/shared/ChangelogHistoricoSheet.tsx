import { useState } from 'react'
import { CHANGELOGS } from '../../lib/changelog'
import type { ChangelogEntry } from '../../lib/changelog'

const TIPO_CONFIG: Record<ChangelogEntry['tipo'], { label: string; cor: string }> = {
  novo:     { label: 'Novo',     cor: 'text-indigo-400 bg-indigo-500/10' },
  melhoria: { label: 'Melhoria', cor: 'text-emerald-400 bg-emerald-500/10' },
  fix:      { label: 'Fix',      cor: 'text-amber-400 bg-amber-500/10' },
}

const CLOSE_DURATION = 260

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

interface Props {
  onFechar: () => void
}

export default function ChangelogHistoricoSheet({ onFechar }: Props) {
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
      <div className={`relative w-full max-w-md bg-slate-900 rounded-t-2xl pb-10 max-h-[90vh] flex flex-col ${closing ? 'sheet-out' : 'sheet-in'}`}>
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📜</span>
            <p className="text-base font-bold">Histórico de novidades</p>
          </div>
          <p className="text-xs text-slate-500">Todas as atualizações do app, da mais recente para a mais antiga.</p>
        </div>

        <div className="px-5 overflow-y-auto flex-1 pb-4">
          {CHANGELOGS.map((cl, i) => (
            <div key={cl.id} className={i > 0 ? 'mt-6 pt-6 border-t border-slate-800' : 'mt-4'}>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm font-semibold text-slate-200">{cl.titulo}</p>
                <p className="text-xs text-slate-600">{formatarData(cl.data)}</p>
              </div>
              <div className="space-y-2">
                {cl.entradas.map((entrada, j) => {
                  const cfg = TIPO_CONFIG[entrada.tipo]
                  return (
                    <div key={j} className="flex items-start gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cfg.cor}`}>
                        {cfg.label}
                      </span>
                      <p className="text-sm text-slate-300 leading-snug">{entrada.texto}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pt-3 shrink-0">
          <button
            onClick={handleFechar}
            className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm text-slate-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
