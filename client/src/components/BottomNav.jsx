import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/event', label: 'Leaderboard', icon: '🏅', end: true },
  { to: '/event/games', label: 'Games', icon: '🎮' },
  { to: '/event/bonus', label: 'Bonus', icon: '⭐' },
  { to: '/event/history', label: 'History', icon: '📜' },
  { to: '/event/settings', label: 'Settings', icon: '⚙️' },
]

/**
 * Bottom tab navigation for the main dashboard. See docs/SDD.md §4.2.
 */
export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium ${
              isActive
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <span className="text-lg" aria-hidden="true">
            {tab.icon}
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
