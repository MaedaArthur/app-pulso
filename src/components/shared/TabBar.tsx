import { NavLink } from 'react-router-dom'

const abas = [
  { to: '/',         label: 'Início',   icon: '◉' },
  { to: '/entradas', label: 'Entradas', icon: '💰' },
  { to: '/gastos',   label: 'Gastos',   icon: '📄' },
  { to: '/config',   label: 'Config',   icon: '⚙️' },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex">
      {abas.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
