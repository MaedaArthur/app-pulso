import { createContext, useContext } from 'react'
import { useWhatsNew } from '../hooks/useWhatsNew'
import WhatsNewSheet from '../components/shared/WhatsNewSheet'

interface WhatsNewContextValue {
  forcarAbrir: () => void
}

const WhatsNewContext = createContext<WhatsNewContextValue | null>(null)

export function WhatsNewProvider({ children }: { children: React.ReactNode }) {
  const { visible, dispensar, forcarAbrir } = useWhatsNew()

  return (
    <WhatsNewContext.Provider value={{ forcarAbrir }}>
      {children}
      {visible && <WhatsNewSheet onFechar={dispensar} />}
    </WhatsNewContext.Provider>
  )
}

export function useWhatsNewContext() {
  const ctx = useContext(WhatsNewContext)
  if (!ctx) throw new Error('useWhatsNewContext deve ser usado dentro de WhatsNewProvider')
  return ctx
}
