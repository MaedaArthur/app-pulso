import { useState, useRef, useEffect } from 'react'
import { formatBRL } from '../../lib/fmt'

interface Props {
  label: string
  subtexto: string
  valor: number
  corBorda: string   // classe Tailwind, ex: 'border-emerald-500'
  aoSalvar: (novoValor: number) => void
  salvando?: boolean
}

export default function CampoEditavel({
  label,
  subtexto,
  valor,
  corBorda,
  aoSalvar,
  salvando = false,
}: Props) {
  const [editando, setEditando] = useState(false)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editando) {
      setInput(String(valor))
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editando, valor])
  /* eslint-enable react-hooks/set-state-in-effect */

  function confirmar() {
    const novoValor = parseFloat(input.replace(',', '.'))
    if (!isNaN(novoValor) && novoValor >= 0) {
      aoSalvar(novoValor)
    }
    setEditando(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirmar()
    if (e.key === 'Escape') setEditando(false)
  }

  return (
    <div className={`bg-slate-900 rounded-2xl p-4 border-l-4 ${corBorda}`}>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </p>

      {editando ? (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-slate-500 text-sm">R$</span>
          <input
            ref={inputRef}
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            onBlur={confirmar}
            onKeyDown={handleKeyDown}
            min="0"
            step="0.01"
            className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
          />
        </div>
      ) : (
        <button
          onClick={() => setEditando(true)}
          disabled={salvando}
          className="flex items-center gap-2 mb-1 group"
        >
          <span className="text-2xl font-bold text-white">
            {salvando ? '...' : formatBRL(valor)}
          </span>
          <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-sm">
            ✏️
          </span>
        </button>
      )}

      <p className="text-xs text-slate-600 leading-relaxed">{subtexto}</p>
    </div>
  )
}
