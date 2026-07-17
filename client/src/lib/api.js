const API_BASE = '/api'

/**
 * Thin wrapper around fetch for JSON APIs. Throws an Error with the
 * server's error message (if any) on non-2xx responses.
 *
 * @param {string} path - path relative to /api, e.g. "/events"
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // response had no JSON body; keep default message
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

/**
 * Creates a new event.
 * @param {string} name
 */
export function createEvent(name) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

/**
 * Looks up an event by its secret code. Returns null if not found instead
 * of throwing, since a missing code is an expected user-input case.
 * @param {string} code
 */
export async function fetchEventByCode(code) {
  try {
    return await request(`/events/code/${encodeURIComponent(code)}`)
  } catch {
    return null
  }
}
