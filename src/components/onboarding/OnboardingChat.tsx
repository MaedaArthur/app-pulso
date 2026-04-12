import { useState, useEffect, useRef } from 'react'
import { useOnboarding } from '../../hooks/useOnboarding'

const FAIXAS_RENDA = [
  { label: 'até R$ 1.500',      valor: 750 },
  { label: 'R$ 1.500–3.000',    valor: 2250 },
  { label: 'R$ 3.000–5.000',    valor: 4000 },
  { label: 'acima de R$ 5.000', valor: 6000 },
]

const ONDE_GUARDA = ['💚 Nubank', '🏦 Banco trad.', '💰 Poupança', '💵 Carteira']
const FOCO = ['🛡 Reserva de emergência', '💳 Pagar dívida', '📊 Gastar melhor']
const COMO_RECEBE = ['💼 Salário fixo', '🎨 Freela', '🛵 Plataforma', '🎓 Bolsa', '+ Outro']

type Passo = 'boas-vindas' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'dica'

interface Mensagem {
  de: 'app' | 'usuario'
  texto: string
  subtexto?: string
}

interface Respostas {
  comoRecebe: string[]
  rendaEstimada: number
  gastosFixos: string
  ondeGuarda: string
  foco: string
}

export default function OnboardingChat() {
  const [passo, setPasso] = useState<Passo>('boas-vindas')
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { de: 'app', texto: 'Olá! Vamos configurar o app. 👋', subtexto: 'Leva menos de 1 minuto.' },
  ])
  const [respostas, setRespostas] = useState<Respostas>({
    comoRecebe: [],
    rendaEstimada: 0,
    gastosFixos: '',
    ondeGuarda: '',
    foco: '',
  })
  const [gastosFixosInput, setGastosFixosInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutate: salvarOnboarding, isPending } = useOnboarding()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, passo])

  function adicionarMensagemApp(texto: string, subtexto?: string) {
    setMensagens(prev => [...prev, { de: 'app', texto, subtexto }])
  }

  function adicionarMensagemUsuario(texto: string) {
    setMensagens(prev => [...prev, { de: 'usuario', texto }])
  }

  function toggleComoRecebe(opcao: string) {
    setRespostas(prev => {
      const jaTemOpcao = prev.comoRecebe.includes(opcao)
      return {
        ...prev,
        comoRecebe: jaTemOpcao
          ? prev.comoRecebe.filter(o => o !== opcao)
          : [...prev.comoRecebe, opcao],
      }
    })
  }

  function confirmarP1() {
    if (respostas.comoRecebe.length === 0) return
    adicionarMensagemUsuario(respostas.comoRecebe.join(' + '))
    setTimeout(() => {
      adicionarMensagemApp(
        'Em média, quanto costuma entrar na sua conta por mês? 💸',
        'Uma estimativa já ajuda — você pode ajustar depois em Config'
      )
      setPasso('p2')
    }, 300)
  }

  function confirmarP2(faixa: typeof FAIXAS_RENDA[number]) {
    setRespostas(prev => ({ ...prev, rendaEstimada: faixa.valor }))
    adicionarMensagemUsuario(faixa.label)
    setTimeout(() => {
      adicionarMensagemApp(
        'Quanto você paga de contas fixas todo mês? 🏠',
        'Aluguel, internet, Netflix, academia — o que chega todo mês independente do que você faz'
      )
      setPasso('p3')
    }, 300)
  }

  function confirmarP3() {
    const valor = parseFloat(gastosFixosInput.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setRespostas(prev => ({ ...prev, gastosFixos: gastosFixosInput }))
    adicionarMensagemUsuario(`R$ ${gastosFixosInput}`)
    setTimeout(() => {
      adicionarMensagemApp('Onde fica esse dinheiro? 🏦')
      setPasso('p4')
    }, 300)
  }

  function confirmarP4(opcao: string) {
    setRespostas(prev => ({ ...prev, ondeGuarda: opcao }))
    adicionarMensagemUsuario(opcao)
    setTimeout(() => {
      adicionarMensagemApp('Qual é seu foco agora? 🎯')
      setPasso('p5')
    }, 300)
  }

  function confirmarP5(opcao: string) {
    const novasRespostas = { ...respostas, foco: opcao }
    setRespostas(novasRespostas)
    adicionarMensagemUsuario(opcao)
    setTimeout(() => setPasso('dica'), 300)
  }

  function entrarNoApp() {
    const gastosFixosNum = parseFloat(respostas.gastosFixos.replace(',', '.')) || 0
    salvarOnboarding({
      como_recebe: respostas.comoRecebe.join('+').toLowerCase().replace(/[^a-z+]/g, ''),
      renda_mensal_estimada: respostas.rendaEstimada,
      gastos_fixos_mensais: gastosFixosNum,
      onde_guarda: respostas.ondeGuarda,
      foco: respostas.foco,
    })
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      <div className="flex-1 space-y-4 py-4">
        {mensagens.map((msg, i) => (
          <div key={i} className={`flex ${msg.de === 'usuario' ? 'justify-end' : 'items-end gap-2'}`}>
            {msg.de === 'app' && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                RF
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.de === 'app'
                  ? 'bg-slate-800 rounded-tl-sm'
                  : 'bg-indigo-600 rounded-tr-sm'
              }`}
            >
              <p className="text-sm">{msg.texto}</p>
              {msg.subtexto && (
                <p className="text-xs text-slate-400 mt-1">{msg.subtexto}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="pb-6 space-y-3">
        {passo === 'boas-vindas' && (
          <button
            onClick={() => {
              adicionarMensagemApp('Que tipo de renda você tem? 👋', 'Pode ser mais de um')
              setPasso('p1')
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            Vamos lá →
          </button>
        )}

        {passo === 'p1' && (
          <>
            <div className="flex flex-wrap gap-2">
              {COMO_RECEBE.map(opcao => (
                <button
                  key={opcao}
                  onClick={() => toggleComoRecebe(opcao)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    respostas.comoRecebe.includes(opcao)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
            <button
              onClick={confirmarP1}
              disabled={respostas.comoRecebe.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p2' && (
          <div className="flex flex-wrap gap-2">
            {FAIXAS_RENDA.map(faixa => (
              <button
                key={faixa.label}
                onClick={() => confirmarP2(faixa)}
                className="px-4 py-2 rounded-full text-sm border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
              >
                {faixa.label}
              </button>
            ))}
          </div>
        )}

        {passo === 'p3' && (
          <div className="space-y-2">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 gap-2 focus-within:border-indigo-500 transition-colors">
              <span className="text-slate-400 text-sm">R$</span>
              <input
                type="number"
                value={gastosFixosInput}
                onChange={e => setGastosFixosInput(e.target.value)}
                placeholder="0"
                min="0"
                className="flex-1 bg-transparent text-lg font-semibold focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={confirmarP3}
              disabled={gastosFixosInput === ''}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </div>
        )}

        {passo === 'p4' && (
          <div className="flex flex-wrap gap-2">
            {ONDE_GUARDA.map(opcao => (
              <button
                key={opcao}
                onClick={() => confirmarP4(opcao)}
                className="px-4 py-2 rounded-full text-sm border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
              >
                {opcao}
              </button>
            ))}
          </div>
        )}

        {passo === 'p5' && (
          <div className="flex flex-wrap gap-2">
            {FOCO.map(opcao => (
              <button
                key={opcao}
                onClick={() => confirmarP5(opcao)}
                className="px-4 py-2 rounded-full text-sm border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
              >
                {opcao}
              </button>
            ))}
          </div>
        )}

        {passo === 'dica' && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-2xl p-4 border-l-4 border-indigo-500">
              <p className="text-sm font-semibold mb-1">💡 Dica importante</p>
              <p className="text-sm text-slate-300">
                Importe seu extrato Nubank toda semana pra manter o saldo certinho.
                Leva menos de 1 minuto.
              </p>
            </div>
            <button
              onClick={entrarNoApp}
              disabled={isPending}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              {isPending ? 'Salvando...' : 'Entrar no app →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
