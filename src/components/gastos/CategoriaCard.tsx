import { useState } from 'react'
import type { Categoria, Gasto } from '../../types'
import type { GastosPorCategoria } from '../../hooks/useSaldo'
import { TODAS_CATEGORIAS } from '../../lib/categories'
import { useAtualizarCategoriaGasto, useSalvarCorrecao } from '../../hooks/useCategorias'
import { normalizarMerchant } from '../../lib/categories'
import { formatBRL, formatDataCurta } from '../../lib/fmt'

export const ICONES: Record<Categoria, string> = {
  alimentacao: '🍔',
  transporte:  '🚗',
  moradia:     '🏠',
  saude:       '💊',
  lazer:       '🎮',
  assinaturas: '📱',
  educacao:    '📚',
  outros:      '📦',
}

const CORES_BARRA: Record<Categoria, string> = {
  alimentacao: 'bg-amber-500',
  transporte:  'bg-blue-500',
  moradia:     'bg-violet-500',
  saude:       'bg-green-500',
  lazer:       'bg-pink-500',
  assinaturas: 'bg-cyan-500',
  educacao:    'bg-orange-500',
  outros:      'bg-slate-500',
}

interface ItemGastoProps {
  gasto: Gasto
}

function ItemGasto({ gasto }: ItemGastoProps) {
  const [editandoCategoria, setEditandoCategoria] = useState(false)
  const { mutate: atualizarGasto, isPending } = useAtualizarCategoriaGasto()
  const { mutate: salvarCorrecao } = useSalvarCorrecao()

  function handleSelecionarCategoria(cat: Categoria) {
    if (cat === gasto.categoria) {
      setEditandoCategoria(false)
      return
    }
    const merchantKey = normalizarMerchant(gasto.titulo)
    atualizarGasto({ id: gasto.id, categoria: cat })
    salvarCorrecao({ merchantKey, categoria: cat })
    setEditandoCategoria(false)
  }

  return (
    <div className="border-b border-slate-800/50 last:border-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setEditandoCategoria(e => !e)}
        disabled={isPending}
      >
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xs text-slate-300 truncate">{gasto.titulo}</p>
          <p className="text-xs text-slate-600 mt-0.5">{formatDataCurta(gasto.data)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-xs font-semibold text-red-400">{formatBRL(gasto.valor)}</p>
          <span className="text-xs text-slate-600">{editandoCategoria ? '▲' : '✏️'}</span>
        </div>
      </button>

      {editandoCategoria && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {TODAS_CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => handleSelecionarCategoria(cat)}
              disabled={isPending}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                cat === gasto.categoria
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {ICONES[cat]} {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  grupo: GastosPorCategoria
  totalGeral: number
}

export default function CategoriaCard({ grupo, totalGeral }: Props) {
  const [expandido, setExpandido] = useState(false)
  const cat = grupo.categoria as Categoria
  const porcent = totalGeral > 0 ? (grupo.total / totalGeral) * 100 : 0

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden mb-2">
      <button
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
        onClick={() => setExpandido(e => !e)}
      >
        <span className="text-xl">{ICONES[cat]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold capitalize">{cat}</span>
            <span className="text-sm font-bold text-red-400">{formatBRL(grupo.total)}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${CORES_BARRA[cat]} rounded-full`}
              style={{ width: `${porcent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {grupo.itens.length} transações · toca para {expandido ? 'fechar' : 'ver'}
          </p>
        </div>
        <span className="text-slate-600 text-xs ml-1">{expandido ? '▲' : '▼'}</span>
      </button>

      {expandido && (
        <div className="border-t border-slate-800">
          {grupo.itens.map(gasto => (
            <ItemGasto key={gasto.id} gasto={gasto} />
          ))}
        </div>
      )}
    </div>
  )
}
