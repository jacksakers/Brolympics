/**
 * Randomly shuffles an array of entrants (players or teams) to produce a
 * turn order, using the Fisher-Yates algorithm. Does not mutate the input.
 *
 * @param {Array} entrants
 * @returns {Array} a new, randomly ordered array
 */
export function generateTurnOrder(entrants) {
  const order = [...entrants]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
