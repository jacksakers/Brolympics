import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import TeamsSection from '../components/settings/TeamsSection.jsx'
import PlayersSection from '../components/settings/PlayersSection.jsx'
import GamesSection from '../components/settings/GamesSection.jsx'

/**
 * Settings tab: CRUD for Players, Teams, and Games, plus the "leave
 * event" action. See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 4.
 *
 * Teams and Players are fetched once here and passed down as props so
 * every section shares the same data instead of holding independent,
 * possibly stale copies (e.g. a team created in TeamsSection must show
 * up immediately in PlayersSection's team-assignment dropdown).
 */
export default function SettingsPage() {
  const { event, leave } = useEvent()
  const teamsState = useTeams(event.id)
  const playersState = usePlayers(event.id)

  return (
    <div className="space-y-6">
      <PlayersSection playersState={playersState} teams={teamsState.teams} />
      <TeamsSection teamsState={teamsState} />
      <GamesSection
        eventId={event.id}
        teams={teamsState.teams}
        players={playersState.players}
      />

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
