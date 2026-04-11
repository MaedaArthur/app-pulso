import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import TabBar from './components/shared/TabBar'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Entradas from './pages/Entradas'
import Gastos from './pages/Gastos'
import Config from './pages/Config'

function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando...</div>
  if (!user) return <Navigate to="/auth" replace />
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
    element: <PrivateRoute />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
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
