// src/components/tour/TourOverlay.tsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTour } from '../../contexts/TourContext'
import { TOUR_STEPS } from './TOUR_STEPS'

const PADDING = 8
const TOOLTIP_WIDTH = 280
const TOOLTIP_HEIGHT = 150

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

function calcTooltipPos(rect: TargetRect): { top: number; left: number } {
  const abaixoOk = rect.top + rect.height + PADDING + TOOLTIP_HEIGHT + 12 < window.innerHeight
  const top = abaixoOk
    ? rect.top + rect.height + PADDING + 12
    : rect.top - PADDING - TOOLTIP_HEIGHT - 12
  const left = Math.max(
    16,
    Math.min(
      rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
      window.innerWidth - TOOLTIP_WIDTH - 16,
    ),
  )
  return { top, left }
}

export default function TourOverlay() {
  const { intro, ativo, feito, passoAtual, confirmarTour, avancar, pular, finalizar } = useTour()
  const [rect, setRect] = useState<TargetRect | null>(null)

  // Encontra o elemento e posiciona o anel ao mudar de passo
  useEffect(() => {
    if (!ativo) return
    setRect(null)

    const step = TOUR_STEPS[passoAtual]
    let attempts = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    function tryFind() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const t = setTimeout(() => {
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }, 300)
        timers.push(t)
      } else if (attempts < 10) {
        attempts++
        const t = setTimeout(tryFind, 100)
        timers.push(t)
      } else {
        avancar()
      }
    }

    const delay = passoAtual === 0 ? 400 : 150
    const t = setTimeout(tryFind, delay)
    timers.push(t)

    return () => { timers.forEach(clearTimeout) }
  }, [ativo, passoAtual, avancar])

  // Recalcula posição ao rolar ou redimensionar
  useEffect(() => {
    if (!ativo) return

    function reposicionar() {
      const step = TOUR_STEPS[passoAtual]
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    }

    window.addEventListener('scroll', reposicionar, { passive: true })
    window.addEventListener('resize', reposicionar, { passive: true })
    return () => {
      window.removeEventListener('scroll', reposicionar)
      window.removeEventListener('resize', reposicionar)
    }
  }, [ativo, passoAtual])

  // Tela de convite
  if (intro) {
    return createPortal(
      <div className="fixed inset-0 bg-black/75 z-[9998] flex items-center justify-center p-6">
        <div key="intro" className="tour-in bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xs text-center shadow-xl">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-base font-bold text-white mb-2">Quer um tour rápido?</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Vou te mostrar como usar cada parte do app para manter seu saldo sempre certinho. Leva menos de 1 minuto.
          </p>
          <button
            onClick={confirmarTour}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-sm font-semibold text-white transition-colors mb-3"
          >
            Vamos lá →
          </button>
          <button
            onClick={pular}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Pular tour
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  // Tela de conclusão
  if (feito) {
    return createPortal(
      <div className="fixed inset-0 bg-black/75 z-[9998] flex items-center justify-center p-6">
        <div key="feito" className="tour-in bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xs text-center shadow-xl">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-base font-bold text-white mb-2">Tour concluído!</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Agora você conhece o app. Duas dicas para manter tudo em dia:
          </p>
          <div className="bg-slate-800 rounded-xl p-3 text-left mb-6 space-y-2">
            <p className="text-xs text-slate-300">📥 Importe o CSV do Nubank toda semana</p>
            <p className="text-xs text-slate-300">✏️ Registre entradas assim que receber</p>
          </div>
          <button
            onClick={finalizar}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
          >
            Começar a usar →
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  if (!ativo || !rect) return null

  const step = TOUR_STEPS[passoAtual]
  const { top: ttTop, left: ttLeft } = calcTooltipPos(rect)
  const isUltimo = passoAtual === TOUR_STEPS.length - 1

  const ringStyle: React.CSSProperties = {
    position: 'fixed',
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
    borderRadius: '14px',
    border: '2px solid #818cf8',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
    zIndex: 9998,
    pointerEvents: 'none',
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: ttTop,
    left: ttLeft,
    width: TOOLTIP_WIDTH,
    zIndex: 9999,
  }

  return createPortal(
    <>
      <div style={ringStyle} />
      <div
        key={passoAtual}
        style={tooltipStyle}
        className="tour-in bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-xs text-indigo-400 font-semibold">
            Passo {passoAtual + 1} de {TOUR_STEPS.length}
          </p>
          <button
            onClick={pular}
            className="text-slate-500 hover:text-slate-300 text-xs leading-none mt-0.5 shrink-0"
          >
            Pular tour ✕
          </button>
        </div>

        <p className="text-sm font-semibold text-white mb-1">{step.titulo}</p>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{step.texto}</p>

        <button
          onClick={avancar}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {isUltimo ? 'Concluir →' : 'Próximo →'}
        </button>
      </div>
    </>,
    document.body,
  )
}
