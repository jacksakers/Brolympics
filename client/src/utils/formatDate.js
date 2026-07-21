// Format a UTC timestamp string as Eastern Time (handles DST). The
// server stores timestamps as SQLite `datetime('now')` strings (UTC,
// no timezone suffix), so we append "Z" only when no timezone
// designator (Z, or a +HH:MM/-HH:MM offset) is already present.
const TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/

export function formatDateET(isoString) {
  if (!isoString) return ''
  const date = new Date(TIMEZONE_PATTERN.test(isoString) ? isoString : `${isoString}Z`)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
