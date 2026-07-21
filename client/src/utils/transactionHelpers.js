/**
 * Shared helpers for resolving a transaction's related entities to
 * display names. Used by both the on-screen history list and CSV export
 * so the two stay in sync (docs/coding_guidelines.md DRY).
 */

/** @param {{player_id: number|null, team_id: number|null}} tx */
export function getEntrantName(tx, players, teams) {
  if (tx.player_id) return players.find((p) => p.id === tx.player_id)?.name ?? 'Unknown player'
  if (tx.team_id) return teams.find((t) => t.id === tx.team_id)?.name ?? 'Unknown team'
  return 'Unknown'
}

/** @param {{game_id: number|null}} tx */
export function getGameName(tx, games) {
  if (!tx.game_id) return null
  return games.find((g) => g.id === tx.game_id)?.name ?? null
}
