import { useState } from 'react'
import type { PreviewImport } from '../../hooks/useImportarCsv'
import { formatBRL } from '../../lib/fmt'
import { useEmojis } from '../../hooks/useEmojis'
import SeletorMesInline from '../shared/SeletorMesInline'

interface Props {
  preview: PreviewImport
  temGastosExistentes: boolean
  onConfirmar: (mesReferencia: string, substituir: boolean) => void
  onCancelar: () => void
  isPending: boolean
}

const NOMES_MESES_COMPLETO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function formatarMesLongo(mesReferencia: string): string {
  const [ano, m] = mesReferencia.split('-').map(Number)
  return `${NOMES_MESES_COMPLETO[m - 1]} de ${ano}`
}

export default function CsvImportSheet({
  preview,
  temGastosExistentes,
  onConfirmar,
  onCancelar,
  isPending,
}: Props) {
  const [mesReferencia, setMesReferencia] = useState(preview.mesReferenciaSugerido)
  const [substituir, setSubstituir] = useState(false)
  const { getEmoji } = useEmojis()

  const labelTipo = preview.tipo === 'credito' ? 'fatura' : 'extrato'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5" />

        <div className="text-center mb-5">
          <p className="text-base font-bold">{preview.gastos.length} transações</p>
          <p className="text-sm text-slate-400 mt-0.5">Total: {formatBRL(preview.totalGeral)}</p>
          {preview.aviso && (
            <p className="text-xs text-amber-400 mt-2 bg-amber-900/20 border border-amber-900/40 rounded-lg px-3 py-2">
              ⚠ {preview.aviso}
            </p>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-3 mb-5">
          <p className="text-xs text-slate-400 mb-2">
            Mês da {labelTipo}
            <span className="text-slate-600"> · estes gastos contam em:</span>
          </p>
          <p className="text-sm font-semibold text-slate-200 mb-2 capitalize">
            {formatarMesLongo(mesReferencia)}
          </p>
          <SeletorMesInline
            data={preview.gastos[0]?.data ?? mesReferencia}
            mesReferencia={mesReferencia}
            onChange={setMesReferencia}
          />
        </div>

        <div className="space-y-2 mb-5">
          {preview.porCategoria.map(({ categoria, total, count }) => (
            <div
              key={categoria}
              className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span>{getEmoji(categoria)}</span>
                <span className="text-sm capitalize">{categoria}</span>
                <span className="text-xs text-slate-500">{count} itens</span>
              </div>
              <span className="text-sm font-semibold text-red-400">{formatBRL(total)}</span>
            </div>
          ))}
        </div>

        {temGastosExistentes && (
          <button
            type="button"
            onClick={() => setSubstituir(s => !s)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-5 transition-colors ${
              substituir
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-left">
              <p className="text-sm font-medium">
                {substituir ? '⚠️ Substituir gastos deste mês' : 'Substituir gastos deste mês'}
              </p>
              <p className={`text-xs mt-0.5 ${substituir ? 'text-amber-400/70' : 'text-slate-600'}`}>
                {substituir
                  ? `Apaga gastos CSV de ${formatarMesLongo(mesReferencia)} e refaz`
                  : 'Padrão: adiciona apenas transações novas'}
              </p>
            </div>
            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
              substituir ? 'bg-amber-500 border-amber-500' : 'border-slate-600'
            }`}>
              {substituir && <span className="text-black text-xs font-bold">✓</span>}
            </div>
          </button>
        )}

        <button
          onClick={() => onConfirmar(mesReferencia, substituir)}
          disabled={isPending}
          className={`w-full disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition-colors mb-3 ${
            substituir
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {isPending
            ? 'Importando...'
            : substituir
              ? 'Substituir e importar ⚠️'
              : 'Importar tudo ✓'}
        </button>
        <button
          onClick={onCancelar}
          className="w-full text-sm text-slate-500 hover:text-slate-400 py-2 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
