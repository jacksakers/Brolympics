import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const PlayerIdentityContext = createContext(null)

function storageKey(eventId) {
  return `brolympics_active_player_${eventId}`
}

function dismissedKey(eventId) {
  return `brolympics_identity_dismissed_${eventId}`
}

/**
 * Implements the "Who Am I?" device-identity workaround (see
 * docs/new_features.txt #1): no passwords, just a per-device,
 * per-event choice of which player this phone belongs to, stored in
 * localStorage. Every score/bonus logged from this device is then
 * attributed to that player via `created_by_player_id`, and reactions
 * on the History feed use it as the reacting player.
 */
export function PlayerIdentityProvider({ eventId, players, children }) {
  const [activePlayerId, setActivePlayerIdState] = useState(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Reload identity whenever the active event changes.
  useEffect(() => {
    if (!eventId) return
    const raw = localStorage.getItem(storageKey(eventId))
    setActivePlayerIdState(raw ? Number(raw) : null)
  }, [eventId])

  const setActivePlayerId = useCallback(
    (id) => {
      if (!eventId) return
      if (id == null) {
        localStorage.removeItem(storageKey(eventId))
      } else {
        localStorage.setItem(storageKey(eventId), String(id))
      }
      setActivePlayerIdState(id)
    },
    [eventId],
  )

  // Prompt once per browser session if nobody has claimed this device
  // yet, so returning to the tab doesn't nag repeatedly.
  useEffect(() => {
    if (!eventId || players.length === 0 || activePlayerId) return
    if (sessionStorage.getItem(dismissedKey(eventId))) return
    setIsPickerOpen(true)
  }, [eventId, players.length, activePlayerId])

  function openPicker() {
    setIsPickerOpen(true)
  }

  function closePicker() {
    if (eventId) sessionStorage.setItem(dismissedKey(eventId), '1')
    setIsPickerOpen(false)
  }

  function choosePlayer(id) {
    setActivePlayerId(id)
    setIsPickerOpen(false)
  }

  const activePlayer = players.find((p) => p.id === activePlayerId) ?? null

  return (
    <PlayerIdentityContext.Provider
      value={{ activePlayer, activePlayerId, choosePlayer, openPicker, closePicker, isPickerOpen }}
    >
      {children}
    </PlayerIdentityContext.Provider>
  )
}

/** Reads the current device identity. Must be used within PlayerIdentityProvider. */
export function usePlayerIdentity() {
  const context = useContext(PlayerIdentityContext)
  if (!context) {
    throw new Error('usePlayerIdentity must be used within a PlayerIdentityProvider')
  }
  return context
}
