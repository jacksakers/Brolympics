/**
 * Computes leaderboard totals from the raw transactions list. See
 * docs/SDD.md §4.2 "Leaderboard" and docs/implementation_plan.md Phase 5.
 */

/**
 * Sums points per player from transactions targeting that player
 * directly (individual-format games and bonus points).
 *
 * @param {Array<{player_id: number|null, points: number}>} transactions
 * @param {Array<{id: number, name: string, team_id: number|null, image_url?: string|null}>} players
 * @returns {Array<{id: number, name: string, team_id: number|null, image_url: string|null, total: number}>}
 *   Ranked highest total first.
 */
export function calculatePlayerTotals(transactions, players) {
  const totals = players.map((player) => ({
    id: player.id,
    name: player.name,
    team_id: player.team_id,
    image_url: player.image_url ?? null,
    total: transactions
      .filter((t) => t.player_id === player.id)
      .reduce((sum, t) => sum + t.points, 0),
  }))

  return totals.sort((a, b) => b.total - a.total)
}

/**
 * Sums points per team, combining points awarded directly to the team
 * (team-format games and bonus points) with the totals of every player on
 * that team (individual-format games), so a team's score reflects all of
 * its members' contributions.
 *
 * @param {Array<{team_id: number|null, points: number}>} transactions
 * @param {Array<{id: number, name: string}>} teams
 * @param {Array<{id: number, name: string, team_id: number|null, image_url?: string|null}>} players
 * @returns {Array<{id: number, name: string, total: number, memberAvatars: Array<string>}>}
 *   Ranked highest total first. `memberAvatars` holds up to 4 member photo
 *   URLs (teams have no photo of their own) for display in the UI.
 */
export function calculateTeamTotals(transactions, teams, players) {
  const playerTotals = calculatePlayerTotals(transactions, players)

  const totals = teams.map((team) => {
    const directTotal = transactions
      .filter((t) => t.team_id === team.id)
      .reduce((sum, t) => sum + t.points, 0)
    const members = playerTotals.filter((p) => p.team_id === team.id)
    const memberTotal = members.reduce((sum, p) => sum + p.total, 0)
    const memberAvatars = members
      .map((p) => p.image_url)
      .filter(Boolean)
      .slice(0, 4)

    return { id: team.id, name: team.name, total: directTotal + memberTotal, memberAvatars }
  })

  return totals.sort((a, b) => b.total - a.total)
}
