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

function calcTooltipPos(rect: TargetRect): { top: number; left: number; acima: boolean } {
  const abaixoOk = rect.top + rect.height + PADDING + TOOLTIP_HEIGHT + 12 < window.innerHeight
  const acima = !abaixoOk
  const top = acima
    ? rect.top - PADDING - TOOLTIP_HEIGHT - 12
    : rect.top + rect.height + PADDING + 12
  const left = Math.max(
    16,
    Math.min(
      rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
      window.innerWidth - TOOLTIP_WIDTH - 16,
    ),
  )
  return { top, left, acima }
}

export default function TourOverlay() {
  const { ativo, passoAtual, avancar, pular } = useTour()
  const [rect, setRect] = useState<TargetRect | null>(null)

  useEffect(() => {
    if (!ativo) return
    setRect(null)

    const step = TOUR_STEPS[passoAtual]
    let attempts = 0

    function tryFind() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }, 300)
      } else if (attempts < 10) {
        attempts++
        setTimeout(tryFind, 100)
      } else {
        // elemento não encontrado: pula esse passo
        avancar()
      }
    }

    const delay = passoAtual === 0 ? 400 : 150
    const timer = setTimeout(tryFind, delay)
    return () => clearTimeout(timer)
  }, [ativo, passoAtual, avancar])

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
      {/* spotlight ring */}
      <div style={ringStyle} />

      {/* tooltip */}
      <div style={tooltipStyle} className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
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
          {isUltimo ? 'Concluir' : 'Próximo →'}
        </button>
      </div>
    </>,
    document.body,
  )
}
