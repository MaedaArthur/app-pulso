import { useState } from 'react'
import { normalizarMesReferencia } from '../../lib/datas'

const NOMES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatarLabel(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number)
  return `${NOMES_COMPLETO[mes - 1]} ${ano}`
}

interface Props {
  // Data física da transação (YYYY-MM-DD). Usada para calcular o default.
  data: string
  // Mês de referência atual (YYYY-MM-DD, 1º dia do mês).
  mesReferencia: string
  onChange: (mesReferencia: string) => void
}

// Accordion "Contar em outro mês?" — fica fechado por padrão quando o mês de
// referência bate com o mês da data. Aberto visivelmente (com badge) quando
// diverge, para que a divergência não fique escondida.
export default function SeletorMesInline({ data, mesReferencia, onChange }: Props) {
  const mesDaData = normalizarMesReferencia(data)
  const divergente = mesReferencia !== mesDaData
  const [aberto, setAberto] = useState(divergente)

  const [ano, mes] = mesReferencia.split('-').map(Number)

  function mudarAno(delta: number) {
    const novoAno = ano + delta
    onChange(`${novoAno}-${String(mes).padStart(2, '0')}-01`)
  }

  function escolherMes(novoMes: number) {
    onChange(`${ano}-${String(novoMes).padStart(2, '0')}-01`)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto(a => !a)}
        className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg transition-colors ${
          divergente
            ? 'bg-amber-900/30 border border-amber-700/50 text-amber-300'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <span>
          {divergente ? `Contando em ${formatarLabel(mesReferencia)}` : 'Contar em outro mês?'}
        </span>
        <span>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div className="mt-2 bg-slate-950 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => mudarAno(-1)}
              className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-slate-300">{ano}</span>
            <button
              type="button"
              onClick={() => mudarAno(1)}
              className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {NOMES_COMPLETO.map((nome, i) => {
              const mesNum = i + 1
              const selecionado = mesNum === mes
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => escolherMes(mesNum)}
                  className={`text-[10px] py-1.5 rounded transition-colors ${
                    selecionado
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {nome.slice(0, 3).toLowerCase()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
