import { useState } from 'react'
import { useSaldo } from '../hooks/useSaldo'
import { useMovimentacoesReserva, useAdicionarMovimentacaoReserva } from '../hooks/useMovimentacoesReserva'
import { formatBRL, formatDataCurta } from '../lib/fmt'

type Acao = 'depositar' | 'retirar' | null

const ESTADO_COR: Record<string, string> = {
  verde:    'bg-emerald-500',
  amarelo:  'bg-amber-500',
  vermelho: 'bg-red-500',
}

const ESTADO_TEXTO: Record<string, string> = {
  verde:    'text-emerald-400',
  amarelo:  'text-amber-400',
  vermelho: 'text-red-400',
}

function formatMeses(meses: number): string {
  if (meses >= 12) {
    const anos = Math.floor(meses / 12)
    const resto = Math.round(meses % 12)
    return resto > 0 ? `${anos}a ${resto}m` : `${anos} ano${anos > 1 ? 's' : ''}`
  }
  return `${meses.toFixed(1).replace('.0', '')} ${meses === 1 ? 'mês' : 'meses'}`
}

export default function Reserva() {
  const { reservaTotal, saudeReserva, saldoReal, isLoading } = useSaldo()
  const { data: movimentacoes = [] } = useMovimentacoesReserva()
  const { mutateAsync: adicionar, isPending } = useAdicionarMovimentacaoReserva()

  const [acao, setAcao] = useState<Acao>(null)
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  const valorNum = parseFloat(valor.replace(',', '.')) || 0

  const maxRetirada = reservaTotal
  const maxDeposito = Math.max(0, saldoReal)

  async function handleConfirmar() {
    if (valorNum <= 0) return
    if (acao === 'depositar' && valorNum > maxDeposito) return
    if (acao === 'retirar' && valorNum > maxRetirada) return

    await adicionar({
      valor: acao === 'depositar' ? valorNum : -valorNum,
      descricao: descricao.trim() || undefined,
    })

    setAcao(null)
    setValor('')
    setDescricao('')
  }

  function handleCancelar() {
    setAcao(null)
    setValor('')
    setDescricao('')
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    )
  }

  const estado = saudeReserva?.estado ?? 'vermelho'
  const mesesCobertos = saudeReserva?.mesesCobertos ?? 0

  return (
    <div className="p-4 pb-8">
      <h1 className="text-lg font-bold mb-4">Reserva de emergência</h1>

      {/* Header card */}
      <div data-tour="reserva-tab" className="bg-slate-900 rounded-2xl p-5 mb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total guardado</p>
            <p className="text-3xl font-bold">{formatBRL(reservaTotal)}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_TEXTO[estado]} bg-slate-800`}>
            {estado === 'verde' ? '✓ Saudável' : estado === 'amarelo' ? '⚠ Atenção' : '✕ Crítico'}
          </span>
        </div>

        {reservaTotal > 0 ? (
          <>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full ${ESTADO_COR[estado]} rounded-full transition-all`}
                style={{ width: `${Math.min(1, mesesCobertos / 6) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Cobre <span className={`font-semibold ${ESTADO_TEXTO[estado]}`}>{formatMeses(mesesCobertos)}</span> de gastos fixos
              {mesesCobertos < 3 && <span className="text-red-400"> · ideal é 3 meses</span>}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-500">Nenhum valor guardado ainda. Deposite para começar.</p>
        )}
      </div>

      {/* Saldo disponível para depósito */}
      <div className="bg-slate-900 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Saldo disponível</p>
        <p className={`text-sm font-semibold ${saldoReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatBRL(saldoReal)}
        </p>
      </div>

      {/* Action buttons or form */}
      {acao === null ? (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setAcao('depositar')}
            disabled={saldoReal <= 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            + Depositar
          </button>
          <button
            onClick={() => setAcao('retirar')}
            disabled={reservaTotal <= 0}
            className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl py-3 text-sm font-semibold text-slate-300 transition-colors"
          >
            − Retirar
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold mb-3">
            {acao === 'depositar' ? '+ Depositar na reserva' : '− Retirar da reserva'}
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">
                Valor {acao === 'depositar'
                  ? `(máx. ${formatBRL(maxDeposito)})`
                  : `(máx. ${formatBRL(maxRetirada)})`}
              </p>
              <input
                type="number"
                inputMode="decimal"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
              {acao === 'depositar' && valorNum > maxDeposito && (
                <p className="text-xs text-red-400 mt-1">Saldo insuficiente</p>
              )}
              {acao === 'retirar' && valorNum > maxRetirada && (
                <p className="text-xs text-red-400 mt-1">Valor maior que a reserva</p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Descrição (opcional)</p>
              <input
                type="text"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder={acao === 'depositar' ? 'Ex: guardando do salário' : 'Ex: emergência médica'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmar}
                disabled={
                  isPending ||
                  valorNum <= 0 ||
                  (acao === 'depositar' && valorNum > maxDeposito) ||
                  (acao === 'retirar' && valorNum > maxRetirada)
                }
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                {isPending ? 'Salvando...' : 'Confirmar'}
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 rounded-xl border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Histórico</p>

      {movimentacoes.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-500">Nenhuma movimentação ainda.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl overflow-hidden">
          {movimentacoes.map((m, i) => {
            const isDeposito = m.valor > 0
            return (
              <div
                key={m.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < movimentacoes.length - 1 ? 'border-b border-slate-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{isDeposito ? '⬆️' : '⬇️'}</span>
                  <div>
                    <p className="text-sm text-slate-300">
                      {m.descricao || (isDeposito ? 'Depósito' : 'Retirada')}
                    </p>
                    <p className="text-xs text-slate-600">{formatDataCurta(m.created_at.split('T')[0])}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${isDeposito ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isDeposito ? '+' : '−'}{formatBRL(Math.abs(m.valor))}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
