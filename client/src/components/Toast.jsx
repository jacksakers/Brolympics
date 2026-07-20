import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

const icons = { success: CheckCircle, error: AlertCircle, info: Info }
const colors = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null
  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-80"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            aria-live={t.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl ${colors[t.type] || colors.info}`}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} aria-label="Dismiss notification">
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
