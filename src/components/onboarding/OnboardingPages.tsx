import { useState } from 'react'
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

const TIPO_RESERVA = [
  { valor: 'buffer',  label: '✅ Sim, conta no saldo do mês', descricao: 'Aparece como dinheiro disponível' },
  { valor: 'reserva', label: '🔒 Não, é minha reserva',       descricao: 'Fica separado, não quero ver no saldo' },
]

type Passo = 'splash' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'done'

interface Respostas {
  comoRecebe: string[]
  rendaEstimada: number
  gastosFixos: string
  ondeGuarda: string[]
  foco: string[]
  dinheiroGuardado: string
  tipoReserva: string
}

const TOTAL_PASSOS = 6 // p7 é condicional

function ProgressBar({ atual }: { atual: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL_PASSOS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < atual ? 'bg-indigo-500' : 'bg-slate-800'
          }`}
        />
      ))}
    </div>
  )
}

function passoParaIndice(passo: Passo): number {
  const ordem: Passo[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']
  const idx = ordem.indexOf(passo)
  // p7 mantém o mesmo índice de p6 visualmente (é condicional)
  return idx === 6 ? 6 : idx + 1
}

export default function OnboardingPages() {
  const [passo, setPasso] = useState<Passo>('splash')
  const [respostas, setRespostas] = useState<Respostas>({
    comoRecebe: [],
    rendaEstimada: 0,
    gastosFixos: '',
    ondeGuarda: [],
    foco: [],
    dinheiroGuardado: '',
    tipoReserva: '',
  })
  const [gastosFixosInput, setGastosFixosInput] = useState('')
  const [dinheiroGuardadoInput, setDinheiroGuardadoInput] = useState('')
  const [rendaSelecionada, setRendaSelecionada] = useState<typeof FAIXAS_RENDA[number] | null>(null)
  const [tipoSelecionado, setTipoSelecionado] = useState('')
  const { mutate: salvarOnboarding, isPending } = useOnboarding()

  function toggleComoRecebe(opcao: string) {
    setRespostas(prev => ({
      ...prev,
      comoRecebe: prev.comoRecebe.includes(opcao)
        ? prev.comoRecebe.filter(o => o !== opcao)
        : [...prev.comoRecebe, opcao],
    }))
  }

  function toggleOndeGuarda(opcao: string) {
    setRespostas(prev => ({
      ...prev,
      ondeGuarda: prev.ondeGuarda.includes(opcao)
        ? prev.ondeGuarda.filter(o => o !== opcao)
        : [...prev.ondeGuarda, opcao],
    }))
  }

  function toggleFoco(opcao: string) {
    setRespostas(prev => ({
      ...prev,
      foco: prev.foco.includes(opcao)
        ? prev.foco.filter(o => o !== opcao)
        : [...prev.foco, opcao],
    }))
  }

  function confirmarP2() {
    if (!rendaSelecionada) return
    setRespostas(prev => ({ ...prev, rendaEstimada: rendaSelecionada.valor }))
    setPasso('p3')
  }

  function confirmarP3() {
    const valor = parseFloat(gastosFixosInput.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setRespostas(prev => ({ ...prev, gastosFixos: gastosFixosInput }))
    setPasso('p4')
  }

  function confirmarP5() {
    if (respostas.foco.length === 0) return
    setPasso('p6')
  }

  function confirmarP6() {
    const valor = parseFloat(dinheiroGuardadoInput.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setRespostas(prev => ({ ...prev, dinheiroGuardado: dinheiroGuardadoInput }))
    if (valor > 0) {
      setPasso('p7')
    } else {
      setPasso('done')
    }
  }

  function confirmarP7() {
    if (!tipoSelecionado) return
    setRespostas(prev => ({ ...prev, tipoReserva: tipoSelecionado }))
    setPasso('done')
  }

  function entrarNoApp() {
    const gastosFixosNum = parseFloat(respostas.gastosFixos.replace(',', '.')) || 0
    const dinheiroGuardadoNum = parseFloat(respostas.dinheiroGuardado.replace(',', '.')) || 0
    salvarOnboarding({
      como_recebe: respostas.comoRecebe.join('|||'),
      renda_mensal_estimada: respostas.rendaEstimada,
      gastos_fixos_mensais: gastosFixosNum,
      onde_guarda: respostas.ondeGuarda.join('|||'),
      foco: respostas.foco.join('|||'),
      dinheiro_guardado: dinheiroGuardadoNum,
      tipo_reserva: respostas.tipoReserva || null,
    })
  }

  if (passo === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center page-in">
        <div className="text-5xl mb-6">💸</div>
        <h1 className="text-2xl font-bold mb-3">Bem-vindo ao Renda Frag</h1>
        <p className="text-slate-400 text-sm mb-3 leading-relaxed">
          Vou te fazer algumas perguntinhas rápidas para personalizar o app pra você. Leva menos de 1 minuto.
        </p>
        <p className="text-slate-600 text-xs mb-10">
          Pode responder sem pressão. Tudo pode ser alterado depois em Configurações.
        </p>
        <button
          onClick={() => setPasso('p1')}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold text-sm transition-colors"
        >
          Vamos lá →
        </button>
      </div>
    )
  }

  const indiceAtual = passoParaIndice(passo)

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
      {passo !== 'done' && (
        <div className="pt-8">
          <ProgressBar atual={indiceAtual} />
        </div>
      )}

      <div key={passo} className="flex-1 flex flex-col justify-between pb-8 page-in">

        {passo === 'p1' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 1 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Que tipo de renda você tem?</h2>
              <p className="text-sm text-slate-400 mb-6">Pode marcar mais de um.</p>
              <div className="flex flex-wrap gap-2">
                {COMO_RECEBE.map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => toggleComoRecebe(opcao)}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                      respostas.comoRecebe.includes(opcao)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => respostas.comoRecebe.length > 0 && setPasso('p2')}
              disabled={respostas.comoRecebe.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p2' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 2 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Quanto entra por mês?</h2>
              <p className="text-sm text-slate-400 mb-6">Uma estimativa já ajuda. Você pode ajustar depois em Configurações.</p>
              <div className="space-y-2">
                {FAIXAS_RENDA.map(faixa => (
                  <button
                    key={faixa.label}
                    onClick={() => setRendaSelecionada(faixa)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors ${
                      rendaSelecionada?.label === faixa.label
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white'
                    }`}
                  >
                    {faixa.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={confirmarP2}
              disabled={!rendaSelecionada}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p3' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 3 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Quanto você paga de contas fixas?</h2>
              <p className="text-sm text-slate-400 mb-6">Aluguel, internet, streaming, academia. O que chega todo mês. Pode ser uma estimativa.</p>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 gap-2 focus-within:border-indigo-500 transition-colors">
                <span className="text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  value={gastosFixosInput}
                  onChange={e => setGastosFixosInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="flex-1 bg-transparent text-2xl font-semibold focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={confirmarP3}
              disabled={gastosFixosInput === ''}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p4' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 4 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Onde fica guardado seu dinheiro?</h2>
              <p className="text-sm text-slate-400 mb-6">Pode marcar mais de um.</p>
              <div className="flex flex-wrap gap-2">
                {ONDE_GUARDA.map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => toggleOndeGuarda(opcao)}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                      respostas.ondeGuarda.includes(opcao)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => respostas.ondeGuarda.length > 0 && setPasso('p5')}
              disabled={respostas.ondeGuarda.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p5' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 5 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Qual é seu foco financeiro agora?</h2>
              <p className="text-sm text-slate-400 mb-6">Pode marcar mais de um.</p>
              <div className="flex flex-wrap gap-2">
                {FOCO.map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => toggleFoco(opcao)}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                      respostas.foco.includes(opcao)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={confirmarP5}
              disabled={respostas.foco.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p6' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pergunta 6 de {TOTAL_PASSOS}</p>
              <h2 className="text-xl font-bold mb-2">Você tem dinheiro guardado?</h2>
              <p className="text-sm text-slate-400 mb-6">Se não tiver, pode colocar 0. Pode ajustar depois em Configurações.</p>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 gap-2 focus-within:border-indigo-500 transition-colors">
                <span className="text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  value={dinheiroGuardadoInput}
                  onChange={e => setDinheiroGuardadoInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="flex-1 bg-transparent text-2xl font-semibold focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={confirmarP6}
              disabled={dinheiroGuardadoInput === ''}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'p7' && (
          <>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Como você vê esse dinheiro?</p>
              <h2 className="text-xl font-bold mb-2">Esse dinheiro conta no seu saldo do mês?</h2>
              <p className="text-sm text-slate-400 mb-6">Isso muda como o app trata essa grana.</p>
              <div className="space-y-2">
                {TIPO_RESERVA.map(tipo => (
                  <button
                    key={tipo.valor}
                    onClick={() => setTipoSelecionado(tipo.valor)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      tipoSelecionado === tipo.valor
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-medium">{tipo.label}</p>
                    <p className={`text-xs mt-0.5 ${tipoSelecionado === tipo.valor ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {tipo.descricao}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={confirmarP7}
              disabled={!tipoSelecionado}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Confirmar →
            </button>
          </>
        )}

        {passo === 'done' && (
          <>
            <div className="flex flex-col items-center text-center pt-4">
              <div className="text-5xl mb-5">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Tudo pronto!</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Agora você tem tudo pra acompanhar seu mês do jeito certo.
              </p>
              <div className="w-full bg-slate-800 rounded-2xl p-4 border-l-4 border-indigo-500 text-left">
                <p className="text-sm font-semibold mb-1">💡 Dica rápida</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Importe seu extrato do Nubank toda semana pra manter o saldo certinho. Leva menos de 1 minuto.
                </p>
              </div>
            </div>
            <button
              onClick={entrarNoApp}
              disabled={isPending}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              {isPending ? 'Salvando...' : 'Entrar no app →'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
