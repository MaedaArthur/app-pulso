import { useState, useRef } from 'react'
import type { Categoria, Gasto } from '../../types'
import type { GastosPorCategoria } from '../../hooks/useSaldo'
import { TODAS_CATEGORIAS } from '../../lib/categories'
import { useAtualizarCategoriaGasto, useSalvarCorrecao, useCategoriasCustom } from '../../hooks/useCategorias'
import { useEditarMesGasto } from '../../hooks/useEditarMesGasto'
import { useEmojis } from '../../hooks/useEmojis'
import { normalizarMerchant } from '../../lib/categories'
import { normalizarMesReferencia } from '../../lib/datas'
import { formatBRL, formatDataCurta } from '../../lib/fmt'
import SeletorMesInline from '../shared/SeletorMesInline'

const NOMES_MES_CURTO = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
function labelMesCurto(mesReferencia: string): string {
  const [, m] = mesReferencia.split('-').map(Number)
  return NOMES_MES_CURTO[m - 1]
}

const EMOJIS_CRIACAO = [
  '🏷️','🍔','🍕','🍣','🥗','🛒','☕','🍺',
  '🚗','🚌','✈️','⛽','🏠','🏡','💡','🔧',
  '💊','🏥','🧴','🏋️','🎮','🎬','🎵','📖',
  '📱','💻','📚','🎓','🛍️','👗','🐾','🎁',
  '💰','💳','⚽','🌿','🧹','🎯','🧃','🎲',
]

const CORES_BARRA_PADRAO: Record<string, string> = {
  alimentacao: 'bg-amber-500',
  transporte:  'bg-blue-500',
  moradia:     'bg-violet-500',
  saude:       'bg-green-500',
  lazer:       'bg-pink-500',
  assinaturas: 'bg-cyan-500',
  educacao:    'bg-orange-500',
  outros:      'bg-slate-500',
}

const CORES_BARRA = new Proxy(CORES_BARRA_PADRAO, {
  get(target, key: string) {
    return target[key] ?? 'bg-slate-600'
  },
})

interface ItemGastoProps {
  gasto: Gasto
}

function ItemGasto({ gasto }: ItemGastoProps) {
  const [editandoCategoria, setEditandoCategoria] = useState(false)
  const [criandoCategoria, setCriandoCategoria] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [novoEmoji, setNovoEmoji] = useState('🏷️')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: atualizarGasto, isPending } = useAtualizarCategoriaGasto()
  const { mutate: salvarCorrecao } = useSalvarCorrecao()
  const { mutate: editarMes, isPending: salvandoMes } = useEditarMesGasto()
  const { data: categoriasCustom, criar: criarCategoriaCustom } = useCategoriasCustom()
  const { getEmoji } = useEmojis()

  const divergente = gasto.mes_referencia !== normalizarMesReferencia(gasto.data)

  function handleMesChange(novo: string) {
    if (novo === gasto.mes_referencia) return
    editarMes({ id: gasto.id, mes_referencia: novo })
  }

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

  async function handleCriarCategoria() {
    const nome = novaCategoria.trim().toLowerCase()
    if (!nome) return
    try {
      await criarCategoriaCustom({ nome, emoji: novoEmoji })
      handleSelecionarCategoria(nome)
      setNovaCategoria('')
      setNovoEmoji('🏷️')
      setCriandoCategoria(false)
    } catch (err) {
      console.error('[categorias-custom] erro ao criar categoria:', err)
      alert('Erro ao criar categoria. Veja o console para detalhes.')
    }
  }

  function handleAbrirCriacao() {
    setCriandoCategoria(true)
    setNovoEmoji('🏷️')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const todasCategorias = [...TODAS_CATEGORIAS, ...categoriasCustom.map(c => c.nome)]

  return (
    <div className="border-b border-slate-800/50 last:border-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setEditandoCategoria(e => !e)}
        disabled={isPending}
      >
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xs text-slate-300 truncate">{gasto.titulo}</p>
          <p className="text-xs text-slate-600 mt-0.5">
            {formatDataCurta(gasto.data)}
            {divergente && (
              <span className="text-amber-400/80"> · conta em {labelMesCurto(gasto.mes_referencia)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-xs font-semibold text-red-400">{formatBRL(gasto.valor)}</p>
          <span className="text-xs text-slate-600">{editandoCategoria ? '▲' : '✏️'}</span>
        </div>
      </button>

      {editandoCategoria && (
        <div className="px-4 pb-3 space-y-3">
          <div className="pt-1">
            <SeletorMesInline
              data={gasto.data}
              mesReferencia={gasto.mes_referencia}
              onChange={handleMesChange}
            />
            {salvandoMes && (
              <p className="text-[10px] text-slate-500 mt-1">Salvando mês...</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
          {todasCategorias.map(cat => (
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
              {getEmoji(cat)} {cat}
            </button>
          ))}

          {criandoCategoria ? (
            <div className="w-full mt-1 space-y-2">
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/60 rounded-xl">
                {EMOJIS_CRIACAO.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNovoEmoji(emoji)}
                    className={`text-base w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      emoji === novoEmoji ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base w-7 text-center shrink-0">{novoEmoji}</span>
                <input
                  ref={inputRef}
                  value={novaCategoria}
                  onChange={e => setNovaCategoria(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCriarCategoria()}
                  placeholder="nome da categoria"
                  className="text-xs px-2.5 py-1 rounded-full border border-indigo-500 bg-slate-800 text-slate-200 outline-none flex-1 min-w-0"
                />
                <button
                  onClick={handleCriarCategoria}
                  disabled={!novaCategoria.trim()}
                  className="text-xs px-2.5 py-1 rounded-full bg-indigo-600 text-white disabled:opacity-40 shrink-0"
                >
                  ✓
                </button>
                <button
                  onClick={() => { setCriandoCategoria(false); setNovaCategoria(''); setNovoEmoji('🏷️') }}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAbrirCriacao}
              className="text-xs px-2.5 py-1 rounded-full border border-dashed border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300 transition-colors"
            >
              + nova categoria
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  grupo: GastosPorCategoria
  totalGeral: number
  isFirst?: boolean
}

export default function CategoriaCard({ grupo, totalGeral, isFirst }: Props) {
  const [expandido, setExpandido] = useState(false)
  const { getEmoji } = useEmojis()
  const cat = grupo.categoria as Categoria
  const porcent = totalGeral > 0 ? (grupo.total / totalGeral) * 100 : 0

  return (
    <div data-tour={isFirst ? 'corrigir-categoria' : undefined} className="bg-slate-900 rounded-2xl overflow-hidden mb-2">
      <button
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
        onClick={() => setExpandido(e => !e)}
      >
        <span className="text-xl">{getEmoji(cat)}</span>
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
