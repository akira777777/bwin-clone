import { describe, it, expect } from 'vitest';
import {
  generateBetId,
  toggleBet,
  calculateMultiPotentialReturn,
  calculateSinglePotentialReturn,
  getCombinations,
} from './betting';
import type { Bet } from '../App';

const sampleBets: Bet[] = [
  { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.45 },
  { id: 'm1-draw', match: 'Arsenal vs Man Utd', selection: 'draw', odds: 4.20 },
];

describe('betting utils (pure logic)', () => {
  describe('generateBetId', () => {
    it('produces stable id from matchId + selection', () => {
      expect(generateBetId('m42', 'home')).toBe('m42-home');
      expect(generateBetId('t7', 'over25')).toBe('t7-over25');
    });
  });

  describe('toggleBet', () => {
    it('adds a new bet when not present', () => {
      const result = toggleBet([], sampleBets[0]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleBets[0]);
    });

    it('removes the bet when it already exists (toggle off)', () => {
      const result = toggleBet(sampleBets, sampleBets[0]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('m1-draw');
    });

    it('returns a new array (immutability)', () => {
      const original = [...sampleBets];
      const result = toggleBet(original, sampleBets[0]);
      expect(result).not.toBe(original);
      expect(original).toHaveLength(2); // original untouched
    });
  });

  describe('calculateMultiPotentialReturn', () => {
    it('multiplies all odds and then by stake', () => {
      const total = calculateMultiPotentialReturn(sampleBets, 10);
      // 1.45 * 4.20 * 10 = 60.9
      expect(total).toBeCloseTo(60.9, 2);
    });

    it('returns 0 when stake is 0 or negative', () => {
      expect(calculateMultiPotentialReturn(sampleBets, 0)).toBe(0);
      expect(calculateMultiPotentialReturn(sampleBets, -5)).toBe(0);
    });
  });

  describe('calculateSinglePotentialReturn', () => {
    it('sums (stake * odds) for each bet using provided stake map', () => {
      const stakes = { 'm1-home': '10', 'm1-draw': '5' };
      const total = calculateSinglePotentialReturn(sampleBets, stakes);
      // 1.45*10 + 4.20*5 = 14.5 + 21 = 35.5
      expect(total).toBeCloseTo(35.5, 2);
    });
  });

  describe('getCombinations', () => {
    it('returns all combinations of exact size', () => {
      const items = [1, 2, 3, 4];
      const combos = getCombinations(items, 2);
      expect(combos).toHaveLength(6);
      expect(combos).toContainEqual([1, 2]);
      expect(combos).toContainEqual([3, 4]);
    });

    it('returns empty for size larger than array or < 1', () => {
      expect(getCombinations([1, 2], 3)).toHaveLength(0);
      expect(getCombinations([1, 2, 3], 0)).toHaveLength(0);
    });
  });
});
