import { useState } from 'react'
import { formatBRL } from '../../lib/fmt'
import { useAtualizarPerfil } from '../../hooks/useAtualizarPerfil'

interface Props {
  valor: number
}

export default function DinheiroGuardadoCard({ valor }: Props) {
  const [editando, setEditando] = useState(false)
  const [input, setInput] = useState('')
  const { mutate: atualizar, isPending } = useAtualizarPerfil()

  function abrir() {
    setInput(String(valor))
    setEditando(true)
  }

  function salvar() {
    const novo = parseFloat(input.replace(',', '.'))
    if (isNaN(novo) || novo < 0) return
    atualizar({ dinheiro_guardado: novo }, { onSuccess: () => setEditando(false) })
  }

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <span className="text-slate-400 text-sm">💰 R$</span>
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent text-base font-semibold focus:outline-none"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') salvar() }}
        />
        <button
          onClick={salvar}
          disabled={isPending}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-3 py-1.5 font-medium transition-colors"
        >
          {isPending ? '...' : 'Salvar'}
        </button>
        <button
          onClick={() => setEditando(false)}
          className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={abrir}
      className="w-full bg-slate-900 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">💰</span>
        <span className="text-sm text-slate-400">Guardado</span>
        <span className="text-sm font-semibold text-slate-200">{formatBRL(valor)}</span>
      </div>
      <span className="text-xs text-slate-600">editar →</span>
    </button>
  )
}
