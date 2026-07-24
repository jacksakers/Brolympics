import { useMemo, useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { useWheelOptions } from '../hooks/useWheelOptions.js'
import { calculatePlayerTotals } from '../utils/calculateScores.js'
import SpinningWheel from '../components/wheel/SpinningWheel.jsx'
import { Sparkles, Skull, Zap, Scale, Dices, Plus, X, RotateCcw } from 'lucide-react'

const MODES = [
  { id: 'penalty', label: 'Penalty', Icon: Skull },
  { id: 'challenge', label: 'Challenge', Icon: Zap },
  { id: 'tiebreaker', label: 'Tiebreaker', Icon: Scale },
  { id: 'custom', label: 'Custom', Icon: Dices },
]

function findTiedGroups(rankings) {
  const groups = new Map()
  rankings.forEach((r) => {
    const key = r.total
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  })
  return [...groups.values()].filter((g) => g.length > 1)
}

function EditableSliceList({ options, addOption, removeOption, resetToDefaults, placeholder }) {
  const [draft, setDraft] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    addOption(draft)
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {options.map((label, i) => (
          <li
            key={`${label}-${i}`}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] py-1 pl-3 pr-1.5 text-xs text-[var(--text-secondary)]"
          >
            {label}
            <button
              type="button"
              onClick={() => removeOption(i)}
              aria-label={`Remove ${label}`}
              className="rounded-full p-0.5 text-[var(--text-muted)] hover:text-red-400"
            >
              <X size={12} />
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="text-xs text-[var(--text-muted)]">No slices yet — add some below.</li>}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex min-h-10 items-center gap-1 rounded-xl bg-[var(--accent)] px-3 text-sm font-bold text-black disabled:opacity-50"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={resetToDefaults}
          className="flex min-h-10 items-center gap-1 rounded-xl border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <RotateCcw size={12} />
        </button>
      </form>
    </div>
  )
}

export default function WheelPage() {
  const { event } = useEvent()
  const { players } = usePlayers(event.id)
  const { transactions } = useTransactions(event.id)
  const [mode, setMode] = useState('penalty')
  const [winner, setWinner] = useState(null)
  const [tieGroupIndex, setTieGroupIndex] = useState(0)

  const penaltyOptions = useWheelOptions(event.id, 'penalty')
  const challengeOptions = useWheelOptions(event.id, 'challenge')
  const customOptions = useWheelOptions(event.id, 'custom')

  const tiedGroups = useMemo(
    () => findTiedGroups(calculatePlayerTotals(transactions, players)),
    [transactions, players],
  )

  const editableByMode = { penalty: penaltyOptions, challenge: challengeOptions, custom: customOptions }

  const slices =
    mode === 'tiebreaker'
      ? (tiedGroups[tieGroupIndex]?.map((r) => r.name) ?? [])
      : editableByMode[mode].options

  function handleResult(label) {
    setWinner(label)
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setWinner(null)
    setTieGroupIndex(0)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Wheel of Destiny</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleModeChange(id)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === id ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'tiebreaker' ? (
        <div className="space-y-2">
          {tiedGroups.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-muted)]">
              No ties right now — everyone's spread out on the leaderboard!
            </p>
          ) : (
            <>
              <p className="text-xs text-[var(--text-muted)]">Pick which tie to break:</p>
              <select
                value={tieGroupIndex}
                onChange={(e) => setTieGroupIndex(Number(e.target.value))}
                className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)]"
              >
                {tiedGroups.map((group, i) => (
                  <option key={i} value={i}>
                    {group.map((r) => r.name).join(' vs ')} ({group[0].total} pts)
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      ) : (
        <EditableSliceList
          options={editableByMode[mode].options}
          addOption={editableByMode[mode].addOption}
          removeOption={editableByMode[mode].removeOption}
          resetToDefaults={editableByMode[mode].resetToDefaults}
          placeholder={mode === 'custom' ? 'Type a custom option…' : 'Add a slice…'}
        />
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-6">
        <SpinningWheel slices={slices} onResult={handleResult} />
      </div>

      {winner && (
        <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-dim)] px-4 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">The wheel has spoken</p>
          <p className="mt-1 text-xl font-black text-[var(--text-primary)]">{winner}</p>
        </div>
      )}
    </section>
  )
}
