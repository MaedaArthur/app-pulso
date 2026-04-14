import { useState, useEffect } from 'react'
import { usePerfil } from '../hooks/usePerfil'
import { useAtualizarPerfil } from '../hooks/useAtualizarPerfil'
import { useAuth } from '../contexts/AuthContext'
import { useTour } from '../contexts/TourContext'
import { useWhatsNewContext } from '../contexts/WhatsNewContext'
import ReportSheet from '../components/config/ReportSheet'
import CampoEditavel from '../components/config/CampoEditavel'
import type { Perfil } from '../types'

const COMO_RECEBE = ['💼 Salário fixo', '🎨 Freela', '🛵 Plataforma', '🎓 Bolsa', '+ Outro']

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

const TIPO_RESERVA = [
  { valor: 'buffer',  label: '✅ Sim, conta no saldo do mês', descricao: 'Aparece como dinheiro disponível' },
  { valor: 'reserva', label: '🔒 Não, é minha reserva',       descricao: 'Fica separado, não quero ver no saldo' },
]

// Usa ||| como separador para não conflitar com o "+" em labels como "+ Outro"
const SEP = '|||'

function parseMulti(valor: string | null): string[] {
  if (!valor) return []
  return valor.split(SEP).map(s => s.trim()).filter(Boolean)
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">{titulo}</p>
      {children}
    </div>
  )
}

function ChipsMulti({
  opcoes,
  selecionados,
  onChange,
}: {
  opcoes: string[]
  selecionados: string[]
  onChange: (novo: string[]) => void
}) {
  function toggle(opcao: string) {
    onChange(
      selecionados.includes(opcao)
        ? selecionados.filter(o => o !== opcao)
        : [...selecionados, opcao]
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map(opcao => (
        <button
          key={opcao}
          type="button"
          onClick={() => toggle(opcao)}
          className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
            selecionados.includes(opcao)
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          {opcao}
        </button>
      ))}
    </div>
  )
}

export default function Config() {
  const { data: perfil, isLoading } = usePerfil()
  const { mutate: atualizar, isPending } = useAtualizarPerfil()
  const { user, signOut } = useAuth()
  const { iniciar } = useTour()
  const { forcarAbrir: abrirWhatsNew } = useWhatsNewContext()
  const [reportAberto, setReportAberto] = useState(false)

  const [comoRecebe, setComoRecebe] = useState<string[]>([])
  const [ondeGuarda, setOndeGuarda] = useState<string[]>([])
  const [foco, setFoco] = useState<string[]>([])
  const [tipoReserva, setTipoReserva] = useState('')
  const [chips_sujos, setChipsSujos] = useState(false)

  useEffect(() => {
    if (!perfil) return
    setComoRecebe(parseMulti(perfil.como_recebe))
    setOndeGuarda(parseMulti(perfil.onde_guarda))
    setFoco(parseMulti(perfil.foco))
    setTipoReserva(perfil.tipo_reserva ?? '')
    setChipsSujos(false)
  }, [perfil])

  function salvarChips() {
    atualizar({
      como_recebe: comoRecebe.join(SEP),
      onde_guarda: ondeGuarda.join(SEP),
      foco: foco.join(SEP),
      tipo_reserva: (tipoReserva as Perfil['tipo_reserva']) || null,
    }, { onSuccess: () => setChipsSujos(false) })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-6">Configurações</h1>

      <Secao titulo="Saldo e metas">
        <div data-tour="config-campos" className="space-y-3">
          <CampoEditavel
            label="Dinheiro guardado"
            subtexto="Afeta seu saldo disponível."
            valor={perfil?.dinheiro_guardado ?? 0}
            corBorda="border-emerald-500"
            salvando={isPending}
            aoSalvar={v => atualizar({ dinheiro_guardado: v })}
          />

          {(perfil?.dinheiro_guardado ?? 0) > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Como você vê esse dinheiro</p>
              <div className="space-y-2">
                {TIPO_RESERVA.map(tipo => (
                  <button
                    key={tipo.valor}
                    type="button"
                    onClick={() => { setTipoReserva(tipo.valor); setChipsSujos(true) }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      tipoReserva === tipo.valor
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{tipo.label}</p>
                    <p className={`text-xs mt-0.5 ${tipoReserva === tipo.valor ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {tipo.descricao}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <CampoEditavel
            label="Meta de poupança / mês"
            subtexto="Reservado antes de calcular o disponível."
            valor={perfil?.meta_poupanca_mensal ?? 0}
            corBorda="border-violet-500"
            salvando={isPending}
            aoSalvar={v => atualizar({ meta_poupanca_mensal: v })}
          />

          <CampoEditavel
            label="Contas fixas / mês"
            subtexto="Aluguel, internet, assinaturas. O que chega todo mês."
            valor={perfil?.gastos_fixos_mensais ?? 0}
            corBorda="border-blue-500"
            salvando={isPending}
            aoSalvar={v => atualizar({ gastos_fixos_mensais: v })}
          />
        </div>
      </Secao>

      <Secao titulo="Renda">
        <div className="space-y-3">
          <CampoEditavel
            label="Renda estimada / mês"
            subtexto="Usado para calcular o ritmo do mês e o estado do saldo."
            valor={perfil?.renda_mensal_estimada ?? 0}
            corBorda="border-indigo-500"
            salvando={isPending}
            aoSalvar={v => atualizar({ renda_mensal_estimada: v })}
          />
          <div>
            <p className="text-xs text-slate-500 mb-2">Como você recebe</p>
            <ChipsMulti
              opcoes={COMO_RECEBE}
              selecionados={comoRecebe}
              onChange={v => { setComoRecebe(v); setChipsSujos(true) }}
            />
          </div>
        </div>
      </Secao>

      <Secao titulo="Onde fica o dinheiro">
        <ChipsMulti
          opcoes={ONDE_GUARDA}
          selecionados={ondeGuarda}
          onChange={v => { setOndeGuarda(v); setChipsSujos(true) }}
        />
      </Secao>

      <Secao titulo="Foco financeiro">
        <ChipsMulti
          opcoes={FOCO}
          selecionados={foco}
          onChange={v => { setFoco(v); setChipsSujos(true) }}
        />
      </Secao>

      {chips_sujos && (
        <button
          onClick={salvarChips}
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-sm transition-colors mb-3"
        >
          {isPending ? 'Salvando...' : 'Salvar preferências'}
        </button>
      )}

      <div className="bg-slate-900 rounded-2xl overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs text-slate-500 mb-0.5">Conta</p>
          <p className="text-sm text-slate-200">{user?.email}</p>
        </div>
        <button
          onClick={() => setReportAberto(true)}
          className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 transition-colors border-b border-slate-800"
        >
          🐛 Relatar problema
        </button>
        <button
          onClick={signOut}
          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-800 transition-colors"
        >
          Sair da conta
        </button>
      </div>

      {reportAberto && <ReportSheet onFechar={() => setReportAberto(false)} />}

      {import.meta.env.DEV && (
        <div className="mt-6">
          <p className="text-xs text-slate-600 uppercase tracking-wide mb-3">Desenvolvimento</p>
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <button
              onClick={iniciar}
              className="w-full px-4 py-3 text-left text-sm text-slate-400 hover:bg-slate-800 transition-colors border-b border-slate-800"
            >
              🗺️ Reiniciar tour
            </button>
            <button
              onClick={abrirWhatsNew}
              className="w-full px-4 py-3 text-left text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              🎉 Ver novidades
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
