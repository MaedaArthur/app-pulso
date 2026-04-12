import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePerfil } from './hooks/usePerfil'
import TabBar from './components/shared/TabBar'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Entradas from './pages/Entradas'
import Gastos from './pages/Gastos'
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
  return (
    <div className="max-w-md mx-auto min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <Outlet />
      <TabBar />
    </div>
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
          { path: '/config',   element: <Config /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
