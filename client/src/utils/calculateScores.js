/**
 * Computes leaderboard totals from the raw transactions list. See
 * docs/SDD.md §4.2 "Leaderboard" and docs/implementation_plan.md Phase 5.
 */

/**
 * Sums points per player from transactions targeting that player
 * directly (individual-format games and bonus points).
 *
 * @param {Array<{player_id: number|null, points: number}>} transactions
 * @param {Array<{id: number, name: string, team_id: number|null}>} players
 * @returns {Array<{id: number, name: string, team_id: number|null, total: number}>}
 *   Ranked highest total first.
 */
export function calculatePlayerTotals(transactions, players) {
  const totals = players.map((player) => ({
    id: player.id,
    name: player.name,
    team_id: player.team_id,
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
 * @param {Array<{id: number, name: string, team_id: number|null}>} players
 * @returns {Array<{id: number, name: string, total: number}>} Ranked
 *   highest total first.
 */
export function calculateTeamTotals(transactions, teams, players) {
  const playerTotals = calculatePlayerTotals(transactions, players)

  const totals = teams.map((team) => {
    const directTotal = transactions
      .filter((t) => t.team_id === team.id)
      .reduce((sum, t) => sum + t.points, 0)
    const memberTotal = playerTotals
      .filter((p) => p.team_id === team.id)
      .reduce((sum, p) => sum + p.total, 0)

    return { id: team.id, name: team.name, total: directTotal + memberTotal }
  })

  return totals.sort((a, b) => b.total - a.total)
}
