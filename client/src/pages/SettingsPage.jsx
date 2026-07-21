import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { usePresets } from '../hooks/usePresets.js'
import { useSettings } from '../hooks/useSettings.js'
import TeamsSection from '../components/settings/TeamsSection.jsx'
import PlayersSection from '../components/settings/PlayersSection.jsx'
import GamesSection from '../components/settings/GamesSection.jsx'
import { Settings, Bookmark, Plus, X, Sliders, LogOut } from 'lucide-react'

function PresetsSection() {
  const { presets, addPreset, removePreset } = usePresets()
  const [label, setLabel] = useState('')
  const [points, setPoints] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!label.trim() || !points) return
    addPreset(label.trim(), points)
    setLabel('')
    setPoints('')
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Bookmark size={16} className="text-[var(--accent)]" /> Point Presets
      </h2>
      <p className="text-xs text-[var(--text-muted)]">Quick-fill buttons for common bonus point values.</p>
      <ul className="space-y-2">
        {presets.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 break-words text-sm text-[var(--text-primary)]">{p.label}</span>
            <div className="flex items-center justify-between gap-3 sm:justify-normal">
              <span className={`text-sm font-bold ${p.points >= 0 ? 'text-[var(--success)]' : 'text-red-400'}`}>
                {p.points >= 0 ? `+${p.points}` : p.points}
              </span>
              <button onClick={() => removePreset(p.id)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
        {presets.length === 0 && <li className="text-sm text-[var(--text-muted)]">No presets yet.</li>}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Wii Golf Win)"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Pts"
          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] sm:w-20"
        />
        <button
          type="submit"
          disabled={!label.trim() || !points}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50"
        >
          <Plus size={14} /> Add
        </button>
      </form>
    </section>
  )
}

function CustomizationSection() {
  const { settings, updateSetting } = useSettings()
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Sliders size={16} className="text-[var(--accent)]" /> Customization
      </h2>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
        <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Compact Mode</p>
            <p className="text-xs text-[var(--text-muted)]">Smaller cards and tighter spacing</p>
          </div>
          <input
            type="checkbox"
            checked={settings.compactMode}
            onChange={(e) => updateSetting('compactMode', e.target.checked)}
            className="h-5 w-5 rounded accent-[var(--accent)] cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Show Stats</p>
            <p className="text-xs text-[var(--text-muted)]">Display point totals in history</p>
          </div>
          <input
            type="checkbox"
            checked={settings.showStats}
            onChange={(e) => updateSetting('showStats', e.target.checked)}
            className="h-5 w-5 rounded accent-[var(--accent)] cursor-pointer"
          />
        </label>
      </div>
    </section>
  )
}

export default function SettingsPage() {
  const { event, leave } = useEvent()
  const teamsState = useTeams(event.id)
  const playersState = usePlayers(event.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-[var(--accent)]" />
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Settings</h1>
      </div>

      <PlayersSection playersState={playersState} teams={teamsState.teams} />
      <TeamsSection teamsState={teamsState} />
      <GamesSection eventId={event.id} teams={teamsState.teams} players={playersState.players} />
      <PresetsSection />
      <CustomizationSection />

      <button
        type="button"
        onClick={leave}
        className="flex w-full items-center justify-center gap-2 min-h-12 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <LogOut size={16} /> Leave Event
      </button>
    </div>
  )
}
