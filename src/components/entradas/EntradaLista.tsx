import { useState } from 'react'
import type { Entrada } from '../../types'
import { formatBRL, formatData } from '../../lib/fmt'
import { useEditarEntrada } from '../../hooks/useEditarEntrada'
import { useRemoverEntrada } from '../../hooks/useRemoverEntrada'

interface Props {
  entradas: Entrada[]
  total: number
}

interface EntradaEditandoState {
  id: string
  valor: string
  fonte: string
  data: string
}

function EntradaItem({ entrada }: { entrada: Entrada }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<EntradaEditandoState>({
    id: entrada.id,
    valor: String(entrada.valor),
    fonte: entrada.fonte,
    data: entrada.data,
  })
  const { mutate: editar, isPending: salvando } = useEditarEntrada()
  const { mutate: remover, isPending: removendo } = useRemoverEntrada()

  function salvar() {
    const valorNum = parseFloat(form.valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0 || !form.fonte.trim()) return
    editar(
      { id: entrada.id, valor: valorNum, fonte: form.fonte.trim(), data: form.data },
      { onSuccess: () => setEditando(false) }
    )
  }

  function cancelar() {
    setForm({ id: entrada.id, valor: String(entrada.valor), fonte: entrada.fonte, data: entrada.data })
    setEditando(false)
  }

  if (editando) {
    return (
      <div className="bg-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center bg-slate-950 rounded-lg px-3 py-2 gap-2">
          <span className="text-slate-500 text-xs">R$</span>
          <input
            type="number"
            value={form.valor}
            onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
            className="flex-1 bg-transparent text-base font-bold text-emerald-400 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.fonte}
            onChange={e => setForm(f => ({ ...f, fonte: e.target.value }))}
            className="flex-1 bg-slate-950 rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
          <input
            type="date"
            value={form.data}
            onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
            className="bg-slate-950 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-lg py-2 text-xs font-semibold transition-colors"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={() => remover(entrada.id)}
            disabled={removendo}
            className="bg-red-900/50 hover:bg-red-900 disabled:opacity-50 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors"
          >
            {removendo ? '...' : 'Apagar'}
          </button>
          <button
            onClick={cancelar}
            className="bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditando(true)}
      className="w-full bg-slate-900 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-slate-200">{entrada.fonte}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formatData(entrada.data)}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-emerald-400">{formatBRL(entrada.valor)}</p>
        <span className="text-slate-600 text-xs">✏️</span>
      </div>
    </button>
  )
}

export default function EntradaLista({ entradas, total }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">Total recebido no mês</p>
        <p className="text-lg font-bold text-emerald-400">{formatBRL(total)}</p>
      </div>

      {entradas.length === 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">💰</p>
          <p className="text-sm text-slate-400">Nenhuma entrada registrada este mês.</p>
          <p className="text-xs text-slate-600 mt-1">Use o formulário acima para adicionar.</p>
        </div>
      )}

      <div className="space-y-2">
        {entradas.map(entrada => (
          <EntradaItem key={entrada.id} entrada={entrada} />
        ))}
      </div>
    </div>
  )
}
