import { useRef, useState } from 'react'
import { useGastos } from '../hooks/useGastos'
import { useImportarCsv, parseFile } from '../hooks/useImportarCsv'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import type { PreviewImport } from '../hooks/useImportarCsv'
import type { GastosPorCategoria } from '../hooks/useSaldo'
import type { Categoria } from '../types'
import { formatBRL, formatDataCurta } from '../lib/fmt'
import CsvTutorialModal from '../components/gastos/CsvTutorialModal'
import CsvImportSheet from '../components/gastos/CsvImportSheet'
import CategoriaCard from '../components/gastos/CategoriaCard'

type EstadoImport = 'idle' | 'tutorial' | 'preview'

function agruparPorCategoria(gastos: ReturnType<typeof useGastos>['data']): GastosPorCategoria[] {
  if (!gastos) return []
  const acc: Record<string, GastosPorCategoria> = {}
  for (const g of gastos) {
    const cat = g.categoria as Categoria
    if (!acc[cat]) acc[cat] = { categoria: cat, total: 0, itens: [] }
    acc[cat].total += g.valor
    acc[cat].itens.push(g)
  }
  return Object.values(acc).sort((a, b) => b.total - a.total)
}

export default function Gastos() {
  const { data: gastos = [], isLoading } = useGastos()
  const { importar } = useImportarCsv()
  const isOnline = useOnlineStatus()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [estadoImport, setEstadoImport] = useState<EstadoImport>('idle')
  const [preview, setPreview] = useState<PreviewImport | null>(null)

  const grupos = agruparPorCategoria(gastos)
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0)
  const temGastos = gastos.length > 0

  const ultimoImport = temGastos
    ? gastos.reduce((max, g) => (g.created_at > max ? g.created_at : max), gastos[0].created_at)
    : null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const resultado = await parseFile(file)
    setPreview(resultado)
    setEstadoImport('preview')
  }

  function abrirSeletorArquivo() {
    fileInputRef.current?.click()
  }

  function handleConfirmarImport(substituir: boolean) {
    if (!preview) return
    importar.mutate({ gastos: preview.gastos, substituir }, {
      onSuccess: () => {
        setEstadoImport('idle')
        setPreview(null)
      },
    })
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">Gastos</h1>
          {isLoading ? (
            <p className="text-xs text-slate-500 mt-0.5">Carregando...</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatBRL(totalGastos)}</p>
              {ultimoImport && (
                <p className="text-xs text-slate-600 mt-0.5">
                  atualizado em {formatDataCurta(ultimoImport.split('T')[0])}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {temGastos && (
            <button
              onClick={abrirSeletorArquivo}
              disabled={!isOnline}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 transition-colors"
            >
              <span>🔄</span>
              <span>Atualizar</span>
            </button>
          )}
          <button
            data-tour="importar-csv"
            onClick={() => setEstadoImport('tutorial')}
            disabled={!isOnline}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 transition-colors"
          >
            <span>📄</span>
            <span>Importar CSV</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {!isLoading && grupos.length === 0 && (
        <div className="bg-slate-900 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-sm font-semibold mb-1">Importe seu extrato Nubank</p>
          <p className="text-xs text-slate-400 mb-4">
            Crédito ou Pix/débito, categorização automática
          </p>
          <button
            onClick={() => setEstadoImport('tutorial')}
            disabled={!isOnline}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Escolher arquivo CSV
          </button>
        </div>
      )}

      {grupos.map((grupo, idx) => (
        <CategoriaCard
          key={grupo.categoria}
          grupo={grupo}
          totalGeral={totalGastos}
          isFirst={idx === 0}
        />
      ))}

      {estadoImport === 'tutorial' && (
        <CsvTutorialModal
          onContinuar={() => {
            setEstadoImport('idle')
            abrirSeletorArquivo()
          }}
          onFechar={() => setEstadoImport('idle')}
        />
      )}

      {estadoImport === 'preview' && preview && (
        <CsvImportSheet
          preview={preview}
          temGastosExistentes={temGastos}
          onConfirmar={handleConfirmarImport}
          onCancelar={() => { setEstadoImport('idle'); setPreview(null) }}
          isPending={importar.isPending}
        />
      )}
    </div>
  )
}
