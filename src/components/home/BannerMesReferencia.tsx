import { useNavigate } from 'react-router-dom'
import { useAtualizarPerfil } from '../../hooks/useAtualizarPerfil'

interface Props {
  onFechar?: () => void
}

export default function BannerMesReferencia({ onFechar }: Props) {
  const navigate = useNavigate()
  const { mutate: atualizar } = useAtualizarPerfil()

  function marcarComoVisto() {
    atualizar({ banner_mes_referencia_visto: true })
    onFechar?.()
  }

  function irParaImport() {
    marcarComoVisto()
    navigate('/gastos')
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/60 to-indigo-800/40 border border-indigo-700/50 rounded-2xl p-4 mb-4">
      <p className="text-sm font-semibold text-indigo-100 mb-1">
        ✨ Agora você pode ver gastos mês a mês
      </p>
      <p className="text-xs text-indigo-200/80 leading-relaxed mb-3">
        Faturas de cartão antigas podem estar no mês errado pela regra nova, a fatura conta no mês em que você a paga.
        Se quiser precisão, reimporte as faturas dos últimos meses escolhendo o mês de pagamento no dropdown.
        Imports novos já acertam sozinhos.
      </p>
      <div className="flex gap-2">
        <button
          onClick={irParaImport}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg py-2 text-xs font-semibold transition-colors"
        >
          Importar agora
        </button>
        <button
          onClick={marcarComoVisto}
          className="bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-2 text-xs text-slate-300 transition-colors"
        >
          Depois
        </button>
      </div>
    </div>
  )
}
