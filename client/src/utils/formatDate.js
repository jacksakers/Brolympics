// Format a UTC timestamp string as Eastern Time (handles DST)
export function formatDateET(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString + (isoString.endsWith('Z') ? '' : 'Z'))
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
