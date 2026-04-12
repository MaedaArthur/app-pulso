// src/contexts/TourContext.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtualizarPerfil } from '../hooks/useAtualizarPerfil'
import { TOUR_STEPS } from '../components/tour/TOUR_STEPS'

interface TourContextValue {
  intro: boolean
  ativo: boolean
  passoAtual: number
  iniciar: () => void
  confirmarTour: () => void
  avancar: () => void
  pular: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [intro, setIntro] = useState(false)
  const [ativo, setAtivo] = useState(false)
  const [passoAtual, setPassoAtual] = useState(0)
  const navigate = useNavigate()
  const { mutate: atualizarPerfil } = useAtualizarPerfil()

  const iniciar = useCallback(() => {
    setIntro(true)
  }, [])

  const confirmarTour = useCallback(() => {
    setIntro(false)
    setPassoAtual(0)
    setAtivo(true)
  }, [])

  const concluir = useCallback(() => {
    setIntro(false)
    setAtivo(false)
    atualizarPerfil({ tutorial_visto: true })
  }, [atualizarPerfil])

  const avancar = useCallback(() => {
    const proximo = passoAtual + 1
    if (proximo >= TOUR_STEPS.length) {
      concluir()
      return
    }
    const stepAtual = TOUR_STEPS[passoAtual]
    const proxStep = TOUR_STEPS[proximo]
    if (proxStep.rota !== stepAtual.rota) {
      navigate(proxStep.rota)
    }
    setPassoAtual(proximo)
  }, [passoAtual, concluir, navigate])

  const pular = useCallback(() => {
    concluir()
  }, [concluir])

  return (
    <TourContext.Provider value={{ intro, ativo, passoAtual, iniciar, confirmarTour, avancar, pular }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour deve ser usado dentro de TourProvider')
  return ctx
}
