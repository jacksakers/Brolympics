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

// --- Teams ---------------------------------------------------------------

/** @param {number} eventId */
export function fetchTeams(eventId) {
  return request(`/teams?event_id=${eventId}`)
}

/** @param {{event_id: number, name: string}} data */
export function createTeam(data) {
  return request('/teams', { method: 'POST', body: JSON.stringify(data) })
}

/** @param {number} id @param {{name: string}} data */
export function updateTeam(id, data) {
  return request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

/** @param {number} id */
export function deleteTeam(id) {
  return request(`/teams/${id}`, { method: 'DELETE' })
}

// --- Players ---------------------------------------------------------------

/** @param {number} eventId */
export function fetchPlayers(eventId) {
  return request(`/players?event_id=${eventId}`)
}

/** @param {{event_id: number, name: string, team_id?: number|null}} data */
export function createPlayer(data) {
  return request('/players', { method: 'POST', body: JSON.stringify(data) })
}

/** @param {number} id @param {{name?: string, team_id?: number|null}} data */
export function updatePlayer(id, data) {
  return request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

/** @param {number} id */
export function deletePlayer(id) {
  return request(`/players/${id}`, { method: 'DELETE' })
}

// --- Games ---------------------------------------------------------------

/** @param {number} eventId */
export function fetchGames(eventId) {
  return request(`/games?event_id=${eventId}`)
}

/** @param {{event_id: number, name: string, format: 'team'|'individual', points_config?: object}} data */
export function createGame(data) {
  return request('/games', { method: 'POST', body: JSON.stringify(data) })
}

/** @param {number} id @param {object} data */
export function updateGame(id, data) {
  return request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

/** @param {number} id */
export function deleteGame(id) {
  return request(`/games/${id}`, { method: 'DELETE' })
}

// --- Transactions ----------------------------------------------------------

/** @param {number} eventId */
export function fetchTransactions(eventId) {
  return request(`/transactions?event_id=${eventId}`)
}

/**
 * @param {{event_id: number, player_id?: number|null, team_id?: number|null,
 *   game_id?: number|null, points: number, reason: string}} data
 */
export function createTransaction(data) {
  return request('/transactions', { method: 'POST', body: JSON.stringify(data) })
}

/** @param {number} id */
export function revertTransaction(id) {
  return request(`/transactions/${id}/revert`, { method: 'POST' })
}

// --- Reactions ---------------------------------------------------------------

/** @param {number} eventId */
export function fetchReactions(eventId) {
  return request(`/reactions?event_id=${eventId}`)
}

/** @param {{transaction_id: number, player_id: number, emoji: string}} data */
export function toggleReaction(data) {
  return request('/reactions', { method: 'POST', body: JSON.stringify(data) })
}

// --- Uploads ----------------------------------------------------------------

/** @param {File} file */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

// --- Wheel options -----------------------------------------------------------

/** @param {number} eventId @param {'penalty'|'challenge'|'custom'} [mode] */
export function fetchWheelOptions(eventId, mode) {
  const query = mode ? `event_id=${eventId}&mode=${mode}` : `event_id=${eventId}`
  return request(`/wheel-options?${query}`)
}

/** @param {{event_id: number, mode: 'penalty'|'challenge'|'custom', label: string}} data */
export function createWheelOption(data) {
  return request('/wheel-options', { method: 'POST', body: JSON.stringify(data) })
}

/** @param {number} id */
export function deleteWheelOption(id) {
  return request(`/wheel-options/${id}`, { method: 'DELETE' })
}

/** @param {number} eventId @param {'penalty'|'challenge'|'custom'} mode */
export function resetWheelOptions(eventId, mode) {
  return request('/wheel-options/reset', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId, mode }),
  })
}
