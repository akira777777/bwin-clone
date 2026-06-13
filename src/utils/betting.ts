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

/**
 * Check if a betting selection won based on match score.
 */
export function checkIsSelectionWon(selection: string, score: string | undefined): boolean {
  if (!score) return false;
  const parts = score.split('-');
  if (parts.length !== 2) return false;
  const s1 = parseInt(parts[0].trim());
  const s2 = parseInt(parts[1].trim());
  if (isNaN(s1) || isNaN(s2)) return false;

  if (selection === 'home') return s1 > s2;
  if (selection === 'draw') return s1 === s2;
  if (selection === 'away') return s1 < s2;
  if (selection === 'over25') return (s1 + s2) > 2.5;
  if (selection === 'under25') return (s1 + s2) < 2.5;
  if (selection === 'btts_yes') return s1 > 0 && s2 > 0;
  if (selection === 'btts_no') return s1 === 0 || s2 === 0;
  if (selection === 'dc_1x') return s1 >= s2;
  if (selection === 'dc_x2') return s1 <= s2;
  if (selection === 'dc_12') return s1 !== s2;

  return false;
}

export type OddsFormat = 'decimal' | 'fractional' | 'american';

/**
 * Formats decimal odds into Decimal, Fractional, or American formats.
 */
export function formatOdds(decimal: number, format: OddsFormat = 'decimal'): string {
  if (decimal === 0) return '-';
  if (format === 'decimal') {
    return decimal.toFixed(2);
  }
  if (format === 'fractional') {
    if (decimal <= 1) return '0';
    const val = decimal - 1;
    let bestNumerator = 1;
    let bestDenominator = 1;
    let minError = Math.abs(val - 1);
    for (let d = 1; d <= 20; d++) {
      const n = Math.round(val * d);
      const error = Math.abs(val - n / d);
      if (error < minError) {
        minError = error;
        bestNumerator = n;
        bestDenominator = d;
      }
      if (error < 0.005) break;
    }
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(bestNumerator, bestDenominator);
    const num = bestNumerator / divisor;
    const den = bestDenominator / divisor;
    if (num === 0) return '0';
    return `${num}/${den}`;
  }
  if (format === 'american') {
    if (decimal <= 1) return '0';
    if (decimal >= 2.00) {
      const amt = Math.round((decimal - 1) * 100);
      return `+${amt}`;
    } else {
      const amt = Math.round(-100 / (decimal - 1));
      return `${amt}`;
    }
  }
  return decimal.toFixed(2);
}

