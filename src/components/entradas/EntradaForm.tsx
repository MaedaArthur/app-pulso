import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAdicionarEntrada } from '../../hooks/useAdicionarEntrada'

function hojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

export default function EntradaForm() {
  const [valor, setValor] = useState('')
  const [fonte, setFonte] = useState('')
  const [data, setData] = useState(hojeISO())
  const { mutate: adicionar, isPending } = useAdicionarEntrada()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0 || !fonte.trim()) return

    adicionar(
      { valor: valorNum, fonte: fonte.trim(), data },
      {
        onSuccess: () => {
          setValor('')
          setFonte('')
          setData(hojeISO())
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {/* Valor */}
      <div className="flex items-center bg-slate-900 rounded-2xl px-5 py-4 mb-3 gap-2 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
        <span className="text-slate-500 text-base font-medium">R$</span>
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="0,00"
          min="0.01"
          step="0.01"
          required
          className="flex-1 bg-transparent text-3xl font-bold text-emerald-400 focus:outline-none placeholder:text-slate-800 w-0"
        />
      </div>

      {/* Fonte */}
      <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-3 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <p className="text-xs text-slate-600 mb-1">Fonte</p>
        <input
          type="text"
          value={fonte}
          onChange={e => setFonte(e.target.value)}
          placeholder="ex: salário, freela, Nubank"
          required
          className="w-full bg-transparent text-base text-slate-200 focus:outline-none placeholder:text-slate-700"
        />
      </div>

      {/* Data */}
      <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-4 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <p className="text-xs text-slate-600 mb-1">Data</p>
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          required
          className="w-full bg-transparent text-base text-slate-200 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl py-4 text-sm font-semibold transition-colors"
      >
        {isPending ? 'Salvando...' : 'Salvar entrada'}
      </button>
    </form>
  )
}
