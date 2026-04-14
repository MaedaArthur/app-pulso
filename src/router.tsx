/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePerfil } from './hooks/usePerfil'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import TabBar from './components/shared/TabBar'
import { usePageTracking } from './hooks/usePageTracking'
import { TourProvider } from './contexts/TourContext'
import TourOverlay from './components/tour/TourOverlay'
import { WhatsNewProvider } from './contexts/WhatsNewContext'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Entradas from './pages/Entradas'
import Gastos from './pages/Gastos'
import Reserva from './pages/Reserva'
import Config from './pages/Config'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
      Carregando...
    </div>
  )
}

/** Exige auth + onboarding completo. Senão, redireciona. */
function AppGuard() {
  const { user, loading: authLoading } = useAuth()
  const { data: perfil, isLoading: perfilLoading } = usePerfil()

  if (authLoading || perfilLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (!perfil?.onboarding_completo) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

/** Exige auth. Se onboarding já feito, vai direto pra home. */
function OnboardingGuard() {
  const { user, loading: authLoading } = useAuth()
  const { data: perfil, isLoading: perfilLoading } = usePerfil()

  if (authLoading || perfilLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (perfil?.onboarding_completo) return <Navigate to="/" replace />
  return <Outlet />
}

function AppLayout() {
  const isOnline = useOnlineStatus()
  usePageTracking()

  return (
    <TourProvider>
      <WhatsNewProvider>
        <div className="max-w-md mx-auto min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))]">
          {!isOnline && (
            <div className="bg-slate-800 text-slate-400 text-xs text-center py-2 px-4">
              Sem conexão — visualização apenas
            </div>
          )}
          <Outlet />
          <TabBar />
        </div>
        <TourOverlay />
      </WhatsNewProvider>
    </TourProvider>
  )
}

export const router = createBrowserRouter([
  { path: '/auth', element: <Auth /> },
  {
    element: <OnboardingGuard />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
    ],
  },
  {
    element: <AppGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/',         element: <Home /> },
          { path: '/entradas', element: <Entradas /> },
          { path: '/gastos',   element: <Gastos /> },
          { path: '/reserva',  element: <Reserva /> },
          { path: '/config',   element: <Config /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
