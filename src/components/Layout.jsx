import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Users, Scale, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/graficos', label: 'Gráficos', icon: TrendingUp },
  { to: '/miembros', label: 'Miembros', icon: Users },
  { to: '/registrar', label: 'Registrar', icon: Scale },
]

export default function Layout({ children }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0 md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-800 border-r border-slate-700 min-h-screen fixed top-0 left-0">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="font-bold text-white text-lg">DisciplineMode</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Grupo de pérdida de peso</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56">
        {/* Top header mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <span className="font-bold text-white">DisciplineMode</span>
          </div>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>

        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-20">
        <div className="flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
