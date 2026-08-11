import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TaskBoard from './pages/TaskBoard'
import Team from './pages/Team'
import LaunchChecklist from './pages/LaunchChecklist'
import { useStore } from './store'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/board', label: 'Task Board', end: false },
  { to: '/checklist', label: 'Launch Checklist', end: false },
  { to: '/team', label: 'Team', end: false },
]

function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Parkland Developers</p>
          <h1 className="text-lg font-semibold text-stone-900">Prana Farms — Launch Dashboard</h1>
        </div>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const { loading } = useStore()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 text-stone-500">
        Loading Prana Farms dashboard…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board" element={<TaskBoard />} />
          <Route path="/checklist" element={<LaunchChecklist />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </main>
    </div>
  )
}
