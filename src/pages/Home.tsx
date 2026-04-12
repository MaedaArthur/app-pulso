import { useSaldo } from '../hooks/useSaldo'
import { diasPassadosNoMes, diasTotaisDoMes } from '../lib/datas'
import HeroStatus from '../components/home/HeroStatus'
import RitmoDoMes from '../components/home/RitmoDoMes'
import ResumoEntradaGasto from '../components/home/ResumoEntradaGasto'
import CategoriasGastos from '../components/home/CategoriasGastos'

export default function Home() {
  const {
    saldoReal,
    estado,
    ritmo,
    totalEntradas,
    totalGastos,
    entradas,
    gastos,
    gastosPorCategoria,
    perfil,
    gastosDesatualizados,
    isLoading,
  } = useSaldo()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Carregando...
      </div>
    )
  }

  const semDados = (perfil?.dinheiro_guardado ?? 0) === 0 && totalEntradas === 0 && totalGastos === 0

  return (
    <div className="p-4">
      <HeroStatus
        nome={perfil?.nome ?? null}
        saldoReal={saldoReal}
        estado={estado}
        gastosDesatualizados={gastosDesatualizados}
        semDados={semDados}
      />

      <RitmoDoMes
        ritmo={ritmo}
        estado={estado}
        totalGastos={totalGastos}
        diasPassados={diasPassadosNoMes()}
        diasTotais={diasTotaisDoMes()}
      />

      <ResumoEntradaGasto
        totalEntradas={totalEntradas}
        totalGastos={totalGastos}
        ultimasEntradas={entradas.slice(0, 3)}
        ultimosGastos={gastos.slice(0, 3)}
      />

      <CategoriasGastos
        gastosPorCategoria={gastosPorCategoria}
        totalGastos={totalGastos}
      />
    </div>
  )
}
