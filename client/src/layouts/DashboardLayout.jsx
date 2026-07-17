import { Navigate, Outlet } from 'react-router-dom'
import { useEvent } from '../context/EventContext.jsx'
import BottomNav from '../components/BottomNav.jsx'

/**
 * Layout wrapper for the Main Dashboard. Redirects to the landing page if
 * there is no valid active event, otherwise renders the bottom tab
 * navigation and the active tab's content. See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 3.
 */
export default function DashboardLayout() {
  const { event, isLoading } = useEvent()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading event…</p>
      </div>
    )
  }

  if (!event) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-white pb-16 dark:bg-gray-900">
      <header className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {event.name}
        </h1>
        <p className="text-xs text-gray-400">Code: {event.secret_code}</p>
      </header>

      <main className="p-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
