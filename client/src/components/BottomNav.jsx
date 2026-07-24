import { NavLink } from 'react-router-dom'
import { Trophy, Gamepad2, Zap, Sparkles, History, Settings } from 'lucide-react'

const TABS = [
  { to: '/event', label: 'Board', Icon: Trophy, end: true },
  { to: '/event/games', label: 'Games', Icon: Gamepad2 },
  { to: '/event/bonus', label: 'Bonus', Icon: Zap },
  { to: '/event/wheel', label: 'Wheel', Icon: Sparkles },
  { to: '/event/history', label: 'History', Icon: History },
  { to: '/event/settings', label: 'Settings', Icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-[var(--border)] bg-[var(--bg-surface)]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <tab.Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="mt-0.5">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
