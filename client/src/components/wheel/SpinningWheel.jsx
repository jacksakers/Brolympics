import { useState } from 'react'

// A cheerful, high-contrast palette that cycles as slices are added.
const COLORS = ['#00d4aa', '#ffd700', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#ec4899']
const SPIN_DURATION_MS = 4200

/**
 * A CSS-driven "wheel of destiny": renders slices as a conic-gradient
 * disc and spins it to a random resting angle, reporting whichever
 * slice lands under the top pointer. See docs/new_features.txt
 * "The Multi-Wheel Engine".
 *
 * @param {{slices: string[], onResult: (label: string, index: number) => void}} props
 */
export default function SpinningWheel({ slices, onResult }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const n = slices.length
  const anglePer = n > 0 ? 360 / n : 0
  const radius = 112

  const gradient =
    n > 0
      ? `conic-gradient(${slices
          .map((_, i) => `${COLORS[i % COLORS.length]} ${i * anglePer}deg ${(i + 1) * anglePer}deg`)
          .join(', ')})`
      : 'var(--bg-card)'

  function spin() {
    if (spinning || n === 0) return
    setSpinning(true)
    const extraSpins = 5 + Math.floor(Math.random() * 3)
    const randomOffset = Math.random() * 360
    const newRotation = rotation + extraSpins * 360 + randomOffset
    setRotation(newRotation)

    setTimeout(() => {
      setSpinning(false)
      // The pointer sits at the top (0deg); after rotating clockwise by
      // `newRotation`, the slice now under it is whichever one started
      // at the equivalent counter-rotated angle.
      const normalized = (360 - (newRotation % 360)) % 360
      const index = Math.floor(normalized / anglePer) % n
      onResult(slices[index], index)
    }, SPIN_DURATION_MS)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-64 w-64">
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 text-3xl drop-shadow-lg">🔻</div>
        <div
          className="h-64 w-64 rounded-full border-4 border-[var(--border-bright)] shadow-2xl transition-transform"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? `${SPIN_DURATION_MS}ms` : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.15, 0.65, 0.25, 1)',
          }}
        />
        {n > 0 && (
          <div className="absolute inset-0">
            {slices.map((label, i) => {
              const midAngle = anglePer * i + anglePer / 2
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-0 w-0"
                  style={{ transform: `rotate(${midAngle}deg)` }}
                >
                  <span
                    className="absolute max-w-[6.5rem] -translate-y-1/2 truncate text-[10px] font-bold text-black"
                    style={{ left: `${radius * 0.32}px` }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--bg-base)] bg-[var(--accent)] shadow-lg" />
      </div>
      <button
        type="button"
        onClick={spin}
        disabled={spinning || n === 0}
        className="min-h-12 rounded-xl bg-[var(--accent)] px-8 text-sm font-black tracking-wide text-black disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors"
      >
        {spinning ? 'SPINNING…' : 'SPIN THE WHEEL'}
      </button>
    </div>
  )
}
