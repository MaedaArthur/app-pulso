import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAdicionarGasto } from '../../hooks/useAdicionarGasto'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useCategoriasCustom } from '../../hooks/useCategorias'
import { useEmojis } from '../../hooks/useEmojis'
import { TODAS_CATEGORIAS } from '../../lib/categories'
import { normalizarMesReferencia } from '../../lib/datas'
import SeletorMesInline from '../shared/SeletorMesInline'

function hojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

export default function GastoForm() {
  const [aberto, setAberto] = useState(false)
  const [valor, setValor] = useState('')
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState<string>('outros')
  const [data, setData] = useState(hojeISO())
  const [mesReferencia, setMesReferencia] = useState(() => normalizarMesReferencia(hojeISO()))
  const [mesManual, setMesManual] = useState(false)
  const { mutate: adicionar, isPending } = useAdicionarGasto()
  const { data: categoriasCustom = [] } = useCategoriasCustom()
  const { getEmoji } = useEmojis()
  const isOnline = useOnlineStatus()

  const todasCategorias = [...TODAS_CATEGORIAS, ...categoriasCustom.map(c => c.nome)]

  function resetar() {
    setValor('')
    setTitulo('')
    setCategoria('outros')
    setData(hojeISO())
    setMesReferencia(normalizarMesReferencia(hojeISO()))
    setMesManual(false)
  }

  function handleDataChange(novaData: string) {
    setData(novaData)
    if (!mesManual) setMesReferencia(normalizarMesReferencia(novaData))
  }

  function handleMesChange(novo: string) {
    setMesReferencia(novo)
    setMesManual(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0 || !titulo.trim()) return

    adicionar(
      {
        valor: valorNum,
        titulo: titulo.trim(),
        categoria,
        data,
        mes_referencia: mesReferencia,
      },
      {
        onSuccess: () => {
          resetar()
          setAberto(false)
        },
      }
    )
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 transition-colors"
      >
        <span>➕ Adicionar gasto manual</span>
        <span className="text-slate-600 text-xs">{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <form onSubmit={handleSubmit} className="mt-2 bg-slate-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center bg-slate-950 rounded-xl px-4 py-3 gap-2 focus-within:ring-1 focus-within:ring-red-500 transition-all">
            <span className="text-slate-500 text-base font-medium">R$</span>
            <input
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
              disabled={!isOnline}
              className="flex-1 bg-transparent text-2xl font-bold text-red-400 focus:outline-none placeholder:text-slate-800 w-0 disabled:opacity-40"
            />
          </div>

          <div className="bg-slate-950 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <p className="text-xs text-slate-600 mb-1">Título</p>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="ex: Café, Uber, Farmácia"
              required
              disabled={!isOnline}
              className="w-full bg-transparent text-sm text-slate-200 focus:outline-none placeholder:text-slate-700 disabled:opacity-40"
            />
          </div>

          <div className="bg-slate-950 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-600 mb-2">Categoria</p>
            <div className="flex flex-wrap gap-1.5">
              {todasCategorias.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    cat === categoria
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getEmoji(cat)} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <p className="text-xs text-slate-600 mb-1">Data</p>
            <input
              type="date"
              value={data}
              onChange={e => handleDataChange(e.target.value)}
              required
              disabled={!isOnline}
              className="w-full bg-transparent text-sm text-slate-200 focus:outline-none disabled:opacity-40"
            />
          </div>

          <SeletorMesInline
            data={data}
            mesReferencia={mesReferencia}
            onChange={handleMesChange}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || !isOnline}
              className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar gasto'}
            </button>
            <button
              type="button"
              onClick={() => { resetar(); setAberto(false) }}
              className="bg-slate-800 hover:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
