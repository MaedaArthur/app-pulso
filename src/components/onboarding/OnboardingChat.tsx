import { useState, useEffect, useRef } from 'react'
import { useOnboarding } from '../../hooks/useOnboarding'

const FAIXAS_RENDA = [
  { label: 'até R$ 1.500',      valor: 750 },
  { label: 'R$ 1.500–3.000',    valor: 2250 },
  { label: 'R$ 3.000–5.000',    valor: 4000 },
  { label: 'acima de R$ 5.000', valor: 6000 },
]

const ONDE_GUARDA = [
  '💚 Nubank',
  '🏦 Banco tradicional',
  '💛 Outro banco digital',
  '💰 Poupança',
  '💵 Dinheiro em espécie',
]

const FOCO = [
  '🛡 Reserva de emergência',
  '💳 Pagar dívida',
  '📊 Gastar melhor',
  '📈 Acumular patrimônio',
]

const COMO_RECEBE = ['💼 Salário fixo', '🎨 Freela', '🛵 Plataforma', '🎓 Bolsa', '+ Outro']

type Passo = 'splash' | 'boas-vindas' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'dica'

interface Mensagem {
  de: 'app' | 'usuario'
  texto: string
  subtexto?: string
}

interface Respostas {
  comoRecebe: string[]
  rendaEstimada: number
  gastosFixos: string
  ondeGuarda: string[]
  foco: string
}

function DigitandoIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
        RF
      </div>
      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default function OnboardingChat() {
  const [passo, setPasso] = useState<Passo>('splash')
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [digitando, setDigitando] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const [respostas, setRespostas] = useState<Respostas>({
    comoRecebe: [],
    rendaEstimada: 0,
    gastosFixos: '',
    ondeGuarda: [],
    foco: '',
  })
  const [gastosFixosInput, setGastosFixosInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutate: salvarOnboarding, isPending } = useOnboarding()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, digitando, passo])

  function adicionarMensagemUsuario(texto: string) {
    setMensagens(prev => [...prev, { de: 'usuario', texto }])
  }

  // Mostra "digitando..." por `delay` ms e depois adiciona a mensagem
  function enviarMensagemApp(texto: string, subtexto?: string, delay = 1800): Promise<void> {
    return new Promise(resolve => {
      setDigitando(true)
      setTimeout(() => {
        setDigitando(false)
        setMensagens(prev => [...prev, { de: 'app', texto, subtexto }])
        resolve()
      }, delay)
    })
  }

  // Sequência: confirmação + próxima pergunta, bloqueando input no meio tempo
  async function avancar(
    respostaTexto: string,
    confirmacao: string,
    proximaPergunta: string,
    proximoSubtexto: string | undefined,
    proximoPasso: Passo
  ) {
    setBloqueado(true)
    adicionarMensagemUsuario(respostaTexto)
    await enviarMensagemApp(confirmacao, undefined, 1200)
    await enviarMensagemApp(proximaPergunta, proximoSubtexto, 1600)
    setPasso(proximoPasso)
    setBloqueado(false)
  }

  function toggleComoRecebe(opcao: string) {
    if (bloqueado) return
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

  function toggleOndeGuarda(opcao: string) {
    if (bloqueado) return
    setRespostas(prev => {
      const jaTemOpcao = prev.ondeGuarda.includes(opcao)
      return {
        ...prev,
        ondeGuarda: jaTemOpcao
          ? prev.ondeGuarda.filter(o => o !== opcao)
          : [...prev.ondeGuarda, opcao],
      }
    })
  }

  function confirmarP1() {
    if (respostas.comoRecebe.length === 0 || bloqueado) return
    avancar(
      respostas.comoRecebe.join(' + '),
      'Faz sentido! Renda que varia é mais comum do que parece. 👍',
      'Em média, quanto costuma entrar na sua conta por mês? 💸',
      'Uma estimativa já ajuda — você pode ajustar depois em Config',
      'p2'
    )
  }

  function confirmarP2(faixa: typeof FAIXAS_RENDA[number]) {
    if (bloqueado) return
    setRespostas(prev => ({ ...prev, rendaEstimada: faixa.valor }))
    avancar(
      faixa.label,
      'Boa referência! Vou usar isso pra calcular seus limites. 📊',
      'Quanto você paga de contas fixas todo mês? 🏠',
      'Aluguel, internet, Netflix, academia — o que chega todo mês independente do que você faz',
      'p3'
    )
  }

  function confirmarP3() {
    if (bloqueado) return
    const valor = parseFloat(gastosFixosInput.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setRespostas(prev => ({ ...prev, gastosFixos: gastosFixosInput }))
    avancar(
      `R$ ${gastosFixosInput}`,
      'Anotado! Vou separar esse valor do seu orçamento variável. 🧮',
      'Onde fica guardado esse dinheiro? 🏦',
      'Pode marcar mais de um',
      'p4'
    )
  }

  function confirmarP4() {
    if (respostas.ondeGuarda.length === 0 || bloqueado) return
    avancar(
      respostas.ondeGuarda.join(' + '),
      'Ótimo, já sei onde seu dinheiro mora. 🏠',
      'Qual é seu foco financeiro agora? 🎯',
      undefined,
      'p5'
    )
  }

  async function confirmarP5(opcao: string) {
    if (bloqueado) return
    const novasRespostas = { ...respostas, foco: opcao }
    setRespostas(novasRespostas)
    setBloqueado(true)
    adicionarMensagemUsuario(opcao)
    await enviarMensagemApp('Perfeito, vou adaptar as sugestões pro seu objetivo. 🎯', undefined, 1200)
    await enviarMensagemApp(
      'Obrigado pelas informações! Já tenho tudo que preciso. 🙏',
      undefined,
      1600
    )
    await enviarMensagemApp(
      'Bem-vindo ao app! Agora você tem tudo pra acompanhar seu mês. 🚀',
      undefined,
      1800
    )
    setPasso('dica')
    setBloqueado(false)
  }

  function entrarNoApp() {
    const gastosFixosNum = parseFloat(respostas.gastosFixos.replace(',', '.')) || 0
    salvarOnboarding({
      como_recebe: respostas.comoRecebe.join('+').toLowerCase().replace(/[^a-z+]/g, ''),
      renda_mensal_estimada: respostas.rendaEstimada,
      gastos_fixos_mensais: gastosFixosNum,
      onde_guarda: respostas.ondeGuarda.join('+'),
      foco: respostas.foco,
    })
  }

  if (passo === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">💸</div>
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Renda Frag</h1>
        <p className="text-slate-400 text-sm mb-2">
          Antes de começar, vou te fazer algumas perguntinhas rápidas para personalizar o app pra você.
        </p>
        <p className="text-slate-600 text-xs mb-10">Leva menos de 1 minuto.</p>
        <button
          onClick={() => {
            setMensagens([{ de: 'app', texto: 'Olá! Vamos configurar o app rapidinho. 👋' }])
            setBloqueado(true)
            setPasso('boas-vindas')
            enviarMensagemApp('Que tipo de renda você tem? 👋', 'Pode marcar mais de um', 1600).then(() => {
              setPasso('p1')
              setBloqueado(false)
            })
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold text-sm transition-colors"
        >
          Vamos lá →
        </button>
      </div>
    )
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

        {digitando && <DigitandoIndicator />}

        <div ref={bottomRef} />
      </div>

      <div className="pb-6 space-y-3">
        {passo === 'p1' && (
          <>
            <div className="flex flex-wrap gap-2">
              {COMO_RECEBE.map(opcao => (
                <button
                  key={opcao}
                  onClick={() => toggleComoRecebe(opcao)}
                  disabled={bloqueado}
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
              disabled={respostas.comoRecebe.length === 0 || bloqueado}
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
                disabled={bloqueado}
                className="px-4 py-2 rounded-full text-sm border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white disabled:opacity-40 transition-colors"
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
                disabled={bloqueado}
                className="flex-1 bg-transparent text-lg font-semibold focus:outline-none disabled:opacity-40"
                autoFocus
              />
            </div>
            <button
              onClick={confirmarP3}
              disabled={gastosFixosInput === '' || bloqueado}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </div>
        )}

        {passo === 'p4' && (
          <>
            <div className="flex flex-wrap gap-2">
              {ONDE_GUARDA.map(opcao => (
                <button
                  key={opcao}
                  onClick={() => toggleOndeGuarda(opcao)}
                  disabled={bloqueado}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    respostas.ondeGuarda.includes(opcao)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
            <button
              onClick={confirmarP4}
              disabled={respostas.ondeGuarda.length === 0 || bloqueado}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p5' && (
          <div className="flex flex-wrap gap-2">
            {FOCO.map(opcao => (
              <button
                key={opcao}
                onClick={() => confirmarP5(opcao)}
                disabled={bloqueado}
                className="px-4 py-2 rounded-full text-sm border border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-white disabled:opacity-40 transition-colors"
              >
                {opcao}
              </button>
            ))}
          </div>
        )}

        {passo === 'dica' && !bloqueado && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-2xl p-4 border-l-4 border-indigo-500">
              <p className="text-sm font-semibold mb-1">💡 Dica rápida</p>
              <p className="text-sm text-slate-300">
                Importe seu extrato Nubank toda semana pra manter o saldo certinho. Leva menos de 1 minuto.
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
