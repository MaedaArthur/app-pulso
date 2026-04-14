import { useState } from 'react'
import type { PreviewImport } from '../../hooks/useImportarCsv'
import { formatBRL } from '../../lib/fmt'
import { useEmojis } from '../../hooks/useEmojis'

interface Props {
  preview: PreviewImport
  temGastosExistentes: boolean
  onConfirmar: (substituir: boolean) => void
  onCancelar: () => void
  isPending: boolean
}

export default function CsvImportSheet({
  preview,
  temGastosExistentes,
  onConfirmar,
  onCancelar,
  isPending,
}: Props) {
  const [substituir, setSubstituir] = useState(false)
  const { getEmoji } = useEmojis()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl p-6 pb-10">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5" />

        <div className="text-center mb-5">
          <p className="text-base font-bold">{preview.gastos.length} gastos deste mês</p>
          <p className="text-sm text-slate-400 mt-0.5">Total: {formatBRL(preview.totalGeral)}</p>
          {preview.ignoradosOutroMes > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              {preview.ignoradosOutroMes} transação{preview.ignoradosOutroMes > 1 ? 'ões' : ''} de outros meses ignorada{preview.ignoradosOutroMes > 1 ? 's' : ''}
            </p>
          )}
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
                {substituir ? '⚠️ Substituir gastos do mês' : 'Substituir gastos do mês'}
              </p>
              <p className={`text-xs mt-0.5 ${substituir ? 'text-amber-400/70' : 'text-slate-600'}`}>
                {substituir
                  ? 'Os gastos importados via CSV serão apagados e refeitos'
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
          onClick={() => onConfirmar(substituir)}
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
