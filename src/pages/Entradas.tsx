import { useEntradas } from '../hooks/useEntradas'
import EntradaForm from '../components/entradas/EntradaForm'
import EntradaLista from '../components/entradas/EntradaLista'

export default function Entradas() {
  const { data: entradas = [], isLoading } = useEntradas()
  const total = entradas.reduce((sum, e) => sum + e.valor, 0)

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Entradas</h1>

      <EntradaForm />

      {isLoading ? (
        <p className="text-sm text-slate-500 text-center py-8">Carregando...</p>
      ) : (
        <EntradaLista entradas={entradas} total={total} />
      )}
    </div>
  )
}
