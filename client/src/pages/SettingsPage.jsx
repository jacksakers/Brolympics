import { useEvent } from '../context/EventContext.jsx'

/**
 * Settings tab: Players/Teams/Games management lands in Phase 4. For now
 * this exposes the "leave event" action.
 */
export default function SettingsPage() {
  const { leave } = useEvent()

  return (
    <div className="space-y-4">
      <p className="text-gray-500 dark:text-gray-400">
        Player, team, and game management coming soon.
      </p>
      <button
        type="button"
        onClick={leave}
        className="min-h-11 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400"
      >
        Leave Event
      </button>
    </div>
  )
}
