interface Props {
  onContinuar: () => void
  onFechar: () => void
}

const PASSOS = [
  {
    tipo: 'Cartão de crédito',
    icone: '💳',
    instrucao: 'Abra o Nubank → toque em Cartão → selecione a fatura → "..." → Exportar fatura',
  },
  {
    tipo: 'Pix e débito',
    icone: '📲',
    instrucao: 'Abra o Nubank → toque em Conta → Extrato → escolha o período → Exportar',
  },
]

export default function CsvTutorialModal({ onContinuar, onFechar }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onFechar} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl p-6 pb-10">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5" />

        <h2 className="text-base font-bold mb-1">Como exportar do Nubank</h2>

        <div className="bg-slate-800 rounded-xl p-3 mb-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">O que é esse arquivo?</span>{' '}
            O Nubank permite exportar seus gastos como um arquivo de texto simples (CSV).
            É como uma planilha com data, nome do estabelecimento e valor de cada compra.
          </p>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Você pode importar os dois. Cada um cobre um tipo de gasto.
        </p>

        <div className="space-y-3 mb-5">
          {PASSOS.map(passo => (
            <div key={passo.tipo} className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{passo.icone}</span>
                <span className="text-sm font-semibold">{passo.tipo}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{passo.instrucao}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-slate-800/50 rounded-xl p-3 mb-5">
          <span className="text-sm mt-0.5">🔒</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            O arquivo fica no seu celular. O app lê os valores e nada é enviado para terceiros. Só você tem acesso aos seus dados.
          </p>
        </div>

        <button
          onClick={onContinuar}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-sm font-semibold transition-colors"
        >
          Já tenho o arquivo →
        </button>
      </div>
    </div>
  )
}
