import { useNavigate } from 'react-router-dom'
import type { Categoria } from '../../types'
import type { GastosPorCategoria } from '../../hooks/useSaldo'
import { formatBRL } from '../../lib/fmt'

const ICONES: Record<Categoria, string> = {
  alimentacao: '🍔',
  transporte:  '🚗',
  moradia:     '🏠',
  saude:       '💊',
  lazer:       '🎮',
  assinaturas: '📱',
  educacao:    '📚',
  outros:      '📦',
}

const CORES: Record<Categoria, string> = {
  alimentacao: 'bg-amber-500',
  transporte:  'bg-blue-500',
  moradia:     'bg-violet-500',
  saude:       'bg-green-500',
  lazer:       'bg-pink-500',
  assinaturas: 'bg-cyan-500',
  educacao:    'bg-orange-500',
  outros:      'bg-slate-500',
}

interface Props {
  gastosPorCategoria: GastosPorCategoria[]
  totalGastos: number
}

export default function CategoriasGastos({ gastosPorCategoria, totalGastos }: Props) {
  const navigate = useNavigate()

  if (gastosPorCategoria.length === 0) {
    return (
      <div data-tour="categorias" className="bg-slate-900 rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold mb-2">Onde foi o dinheiro?</p>
        <p className="text-xs text-slate-500">
          Importe um CSV do Nubank na aba Gastos para ver suas categorias.
        </p>
      </div>
    )
  }

  const top4 = gastosPorCategoria.slice(0, 4)
  const outros = gastosPorCategoria.slice(4)
  const totalOutros = outros.reduce((sum, g) => sum + g.total, 0)
  const porcentOutros = totalGastos > 0 ? Math.round((totalOutros / totalGastos) * 100) : 0

  return (
    <div data-tour="categorias" className="bg-slate-900 rounded-2xl p-4 mb-4">
      <p className="text-sm font-semibold mb-4">Onde foi o dinheiro?</p>

      <div className="space-y-3">
        {top4.map(({ categoria, total }) => {
          const porcent = totalGastos > 0 ? (total / totalGastos) * 100 : 0
          const cat = categoria as Categoria
          return (
            <div key={categoria}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">
                  {ICONES[cat]} {categoria}
                </span>
                <span className="text-sm font-medium text-red-400">{formatBRL(total)}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${CORES[cat]} rounded-full transition-all`}
                  style={{ width: `${porcent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {outros.length > 0 && (
        <button
          onClick={() => navigate('/gastos')}
          className="text-xs text-slate-500 hover:text-slate-400 mt-3 block"
        >
          outros {porcentOutros}% · ver completo →
        </button>
      )}
    </div>
  )
}
