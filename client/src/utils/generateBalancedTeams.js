/**
 * Splits players into balanced teams via a "snake draft": rank players
 * by current leaderboard total (highest first), then deal them out in
 * a serpentine pattern (1,2,3,3,2,1,1,2,3,...) so the strongest players
 * are spread evenly across teams instead of stacking one team with all
 * the top scorers. See docs/new_features.txt "Balanced Team Generator".
 *
 * @param {Array<{id: number, name: string}>} players
 * @param {Record<number, number>} totalsById - player id -> current points
 * @param {number} teamCount
 * @returns {Array<Array<{id: number, name: string}>>} one array of
 *   players per team, in draft order
 */
export function snakeDraftTeams(players, totalsById, teamCount) {
  if (teamCount < 1) return []

  const ranked = [...players].sort(
    (a, b) => (totalsById[b.id] ?? 0) - (totalsById[a.id] ?? 0),
  )
  const groups = Array.from({ length: teamCount }, () => [])

  ranked.forEach((player, i) => {
    const round = Math.floor(i / teamCount)
    const posInRound = i % teamCount
    const teamIndex = round % 2 === 0 ? posInRound : teamCount - 1 - posInRound
    groups[teamIndex].push(player)
  })

  return groups
}
