import { useState } from 'react'
import { useEnviarReport, type TipoReport } from '../../hooks/useReport'

const TIPOS: { valor: TipoReport; label: string; emoji: string }[] = [
  { valor: 'bug',      label: 'Erro no app',  emoji: '🐛' },
  { valor: 'sugestao', label: 'Sugestão',      emoji: '💡' },
  { valor: 'outro',    label: 'Outro',         emoji: '💬' },
]

interface Props {
  onFechar: () => void
}

export default function ReportSheet({ onFechar }: Props) {
  const [tipo, setTipo] = useState<TipoReport>('bug')
  const [descricao, setDescricao] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const { mutateAsync: enviar, isPending } = useEnviarReport()

  async function handleEnviar() {
    if (!descricao.trim()) return
    setErro(null)
    try {
      await enviar({ tipo, descricao: descricao.trim() })
      setEnviado(true)
    } catch (e) {
      console.error('[report] erro ao enviar:', e)
      setErro('Não foi possível enviar. Verifique sua conexão e tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onFechar} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl pb-10 sheet-in">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        <div className="px-5 pt-3 pb-5">
          {enviado ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-base font-bold mb-1">Recebido, obrigado!</p>
              <p className="text-sm text-slate-400 mb-6">Seu relato vai nos ajudar a melhorar o app.</p>
              <button
                onClick={onFechar}
                className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-sm font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <p className="text-base font-bold mb-4">Relatar problema</p>

              <p className="text-xs text-slate-500 mb-2">Tipo</p>
              <div className="flex gap-2 mb-4">
                {TIPOS.map(t => (
                  <button
                    key={t.valor}
                    onClick={() => setTipo(t.valor)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      tipo === t.valor
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-500 mb-2">Descrição</p>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder={
                  tipo === 'bug'
                    ? 'O que aconteceu? Em qual tela? O que você esperava que acontecesse?'
                    : tipo === 'sugestao'
                    ? 'Qual funcionalidade você gostaria de ver?'
                    : 'Escreva aqui...'
                }
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none"
              />

              {erro && (
                <p className="text-xs text-red-400 mt-3">{erro}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleEnviar}
                  disabled={isPending || !descricao.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 text-sm font-semibold transition-colors"
                >
                  {isPending ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={onFechar}
                  className="px-5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
