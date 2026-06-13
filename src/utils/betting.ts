import type { Bet } from '../App';

/**
 * Stable bet identifier used across the app.
 * Format: `${matchOrOutrightId}-${selection}`
 */
export function generateBetId(matchOrId: string, selection: string): string {
  return `${matchOrId}-${selection}`;
}

/**
 * Toggle a bet in/out of the current bet slip.
 * Returns a *new* array (immutability).
 */
export function toggleBet(current: Bet[], bet: Bet): Bet[] {
  const exists = current.some(b => b.id === bet.id);
  if (exists) {
    return current.filter(b => b.id !== bet.id);
  }
  return [...current, bet];
}

/**
 * Calculate potential return for a Multi/Accumulator.
 */
export function calculateMultiPotentialReturn(bets: Bet[], stake: number): number {
  if (!bets.length || stake <= 0) return 0;
  const totalOdds = bets.reduce((acc, b) => acc * b.odds, 1);
  return Number((totalOdds * stake).toFixed(2));
}

/**
 * Calculate total potential return for Single bets (each has its own stake).
 */
export function calculateSinglePotentialReturn(
  bets: Bet[],
  stakes: Record<string, string>
): number {
  return bets.reduce((acc, bet) => {
    const s = parseFloat(stakes[bet.id]) || 0;
    return acc + s * bet.odds;
  }, 0);
}

/**
 * Return all combinations of exact `size` from the array.
 * Used for System bets.
 */
export function getCombinations<T>(array: T[], size: number): T[][] {
  if (size < 1 || size > array.length) return [];
  const result: T[][] = [];
  function helper(start: number, combo: T[]) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}
