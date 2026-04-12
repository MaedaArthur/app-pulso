import type { ResultadoRitmo } from '../../lib/finance'
import type { EstadoMes } from '../../types'
import { formatBRL } from '../../lib/fmt'

function gerarSugestao(ritmo: ResultadoRitmo, estado: EstadoMes): string {
  if (!ritmo.ritmoOk) {
    return `Você gastou mais do que o esperado pra esse período. Considere segurar os gastos variáveis pelos próximos ${ritmo.diasRestantes} dias.`
  }
  if (estado === 'verde') {
    return `Ritmo ótimo! Você está dentro do esperado. Continue assim pelos próximos ${ritmo.diasRestantes} dias.`
  }
  return `Você está no ritmo certo. Fique atento aos próximos gastos pra fechar o mês bem.`
}

interface Props {
  ritmo: ResultadoRitmo
  estado: EstadoMes
  totalGastos: number
  diasPassados: number
  diasTotais: number
}

export default function RitmoDoMes({ ritmo, estado, totalGastos, diasPassados, diasTotais }: Props) {
  const porcentDias = Math.round(ritmo.porcentagemDias * 100)

  return (
    <div data-tour="ritmo" className="bg-slate-900 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Ritmo do mês</p>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          ritmo.ritmoOk
            ? 'bg-emerald-900/50 text-emerald-400'
            : 'bg-amber-900/50 text-amber-400'
        }`}>
          {ritmo.ritmoOk ? 'ritmo ok ✓' : 'cuidado ⚠'}
        </span>
      </div>

      <div className="mb-1">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Dia {diasPassados}</span>
          <span>Faltam {ritmo.diasRestantes} dias</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${porcentDias}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 mb-3">
        Gastou{' '}
        <span className="text-white font-medium">{formatBRL(totalGastos)}</span>
        {' '}até agora
        {ritmo.gastoVariavel !== totalGastos && (
          <span className="text-slate-500">
            {' '}· {formatBRL(ritmo.gastoVariavel)} variável
          </span>
        )}
      </p>

      <div className="bg-slate-800 rounded-xl px-3 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          💬 {gerarSugestao(ritmo, estado)}
        </p>
      </div>
    </div>
  )
}
