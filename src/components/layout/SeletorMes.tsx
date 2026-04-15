import { useState } from 'react'
import { useMesSelecionado } from '../../hooks/useMesSelecionado'

const NOMES_MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

const NOMES_MESES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatarLabel(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  return `${NOMES_MESES_COMPLETO[m - 1]} ${ano}`
}

export default function SeletorMes() {
  const { mes, tipo, isMesAtual, proximoMes, mesAnterior, setMes, voltarAoAtual } = useMesSelecionado()
  const [aberto, setAberto] = useState(false)
  const [ano, setAno] = useState(() => Number(mes.split('-')[0]))

  const badge =
    tipo === 'passado' ? { texto: 'mês fechado', cor: 'bg-slate-700 text-slate-400' }
    : tipo === 'futuro' ? { texto: 'mês futuro', cor: 'bg-indigo-900/60 text-indigo-300' }
    : null

  function escolher(mesNum: number) {
    const novoMes = `${ano}-${String(mesNum).padStart(2, '0')}`
    setMes(novoMes)
    setAberto(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={mesAnterior}
          aria-label="Mês anterior"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          ‹
        </button>

        <button
          onClick={() => { setAno(Number(mes.split('-')[0])); setAberto(a => !a) }}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors"
        >
          <span>{formatarLabel(mes)}</span>
          {badge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.cor}`}>
              {badge.texto}
            </span>
          )}
          <span className="text-slate-500 text-xs">{aberto ? '▲' : '▼'}</span>
        </button>

        <button
          onClick={proximoMes}
          aria-label="Próximo mês"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          ›
        </button>
      </div>

      {!isMesAtual && (
        <button
          onClick={voltarAoAtual}
          className="mt-2 w-full text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ↺ voltar ao mês atual
        </button>
      )}

      {aberto && (
        <div className="mt-2 bg-slate-900 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setAno(a => a - 1)}
              aria-label="Ano anterior"
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-slate-200">{ano}</span>
            <button
              onClick={() => setAno(a => a + 1)}
              aria-label="Próximo ano"
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {NOMES_MESES.map((nome, i) => {
              const mesNum = i + 1
              const mesIso = `${ano}-${String(mesNum).padStart(2, '0')}`
              const selecionado = mesIso === mes
              return (
                <button
                  key={nome}
                  onClick={() => escolher(mesNum)}
                  className={`text-xs py-2 rounded-lg transition-colors ${
                    selecionado
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {nome}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
