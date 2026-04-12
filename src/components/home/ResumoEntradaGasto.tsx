import { useNavigate } from 'react-router-dom'
import type { Entrada, Gasto } from '../../types'
import { formatBRL, formatDataCurta } from '../../lib/fmt'

interface Props {
  totalEntradas: number
  totalGastos: number
  ultimasEntradas: Entrada[]
  ultimosGastos: Gasto[]
}

export default function ResumoEntradaGasto({
  totalEntradas,
  totalGastos,
  ultimasEntradas,
  ultimosGastos,
}: Props) {
  const navigate = useNavigate()

  return (
    <div data-tour="resumo" className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-slate-900 rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-1">↑ Entrou</p>
        <p className="text-lg font-bold text-emerald-400 mb-3">{formatBRL(totalEntradas)}</p>
        <div className="space-y-2">
          {ultimasEntradas.slice(0, 3).map(e => (
            <div key={e.id} className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-300 truncate max-w-[80px]">{e.fonte}</p>
                <p className="text-xs text-slate-600">{formatDataCurta(e.data)}</p>
              </div>
              <p className="text-xs font-medium text-emerald-400">{formatBRL(e.valor)}</p>
            </div>
          ))}
          {ultimasEntradas.length === 0 && (
            <p className="text-xs text-slate-600">Nenhuma entrada</p>
          )}
        </div>
        <button
          onClick={() => navigate('/entradas')}
          className="text-xs text-indigo-400 hover:text-indigo-300 mt-3 block"
        >
          ver tudo →
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-1">↓ Saiu</p>
        <p className="text-lg font-bold text-red-400 mb-3">{formatBRL(totalGastos)}</p>
        <div className="space-y-2">
          {ultimosGastos.slice(0, 3).map(g => (
            <div key={g.id} className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-300 truncate max-w-[80px]">{g.titulo}</p>
                <p className="text-xs text-slate-600">{formatDataCurta(g.data)}</p>
              </div>
              <p className="text-xs font-medium text-red-400">{formatBRL(g.valor)}</p>
            </div>
          ))}
          {ultimosGastos.length === 0 && (
            <p className="text-xs text-slate-600">Nenhum gasto</p>
          )}
        </div>
        <button
          onClick={() => navigate('/gastos')}
          className="text-xs text-indigo-400 hover:text-indigo-300 mt-3 block"
        >
          ver tudo →
        </button>
      </div>
    </div>
  )
}
