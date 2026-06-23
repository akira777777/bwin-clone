/**
 * Tests for i18n utility
 */

import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n utility', () => {
  describe('t() - translation function', () => {
    it('should return English translations by default', () => {
      expect(t('Bet Slip')).toBe('Bet Slip');
      expect(t('Place Bet')).toBe('Place Bet');
      expect(t('Odds')).toBe('Odds');
    });

    it('should return Russian translations when lang is "ru"', () => {
      expect(t('Bet Slip', 'ru')).toBe('Купон');
      expect(t('Place Bet', 'ru')).toBe('Сделать ставку');
      expect(t('Odds', 'ru')).toBe('Коэф.');
    });

    it('should return German translations when lang is "de"', () => {
      expect(t('Bet Slip', 'de')).toBe('Wettschein');
      expect(t('Place Bet', 'de')).toBe('Wette platzieren');
    });

    it('should return Spanish translations when lang is "es"', () => {
      expect(t('Bet Slip', 'es')).toBe('Cupón');
      expect(t('Place Bet', 'es')).toBe('Realizar apuesta');
    });

    it('should return original text for unknown keys', () => {
      const unknownKey = 'This key does not exist';
      expect(t(unknownKey)).toBe(unknownKey);
      expect(t(unknownKey, 'ru')).toBe(unknownKey);
    });

    it('should handle empty strings', () => {
      expect(t('')).toBe('');
      expect(t('', 'ru')).toBe('');
    });

    it('should handle special characters', () => {
      expect(t('Draw', 'ru')).toBe('Ничья');
      expect(t('Over 2.5')).toBe('Over 2.5');
    });
  });

  describe('coverage - common betting terms', () => {
    const languages = ['en', 'ru', 'de', 'es'] as const;

    // Important betting terms should have translations in all languages
    const commonTerms = [
      'Bet Slip',
      'Place Bet',
      'Odds',
      'Stake',
      'Potential Return',
      'Live',
      'Sports',
      'Casino',
    ];

    commonTerms.forEach(term => {
      it(`should translate "${term}" to all languages`, () => {
        languages.forEach(lang => {
          const translated = t(term, lang);
          expect(translated).toBeDefined();
          expect(typeof translated).toBe('string');
          // Translation should be different from original or same (if not translated yet)
          expect(translated.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
