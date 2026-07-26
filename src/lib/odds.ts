import type { OddsFormat } from '@/types'
import { clamp } from './rng'

const MARGIN = 1.06 // bookmaker margin

/** Convert implied probabilities (sum to 1) to decimal odds with margin */
export function probsToOdds(probs: number[]): number[] {
  const total = probs.reduce((a, b) => a + b, 0) * MARGIN
  return probs.map((p) => roundOdds(total / Math.max(p, 0.01)))
}

/** Round to "bookmaker-like" values */
export function roundOdds(v: number): number {
  const c = clamp(v, 1.01, 500)
  if (c < 2) return Math.round(c * 100) / 100
  if (c < 5) return Math.round(c * 20) / 20
  if (c < 20) return Math.round(c * 10) / 10
  return Math.round(c)
}

function toFraction(d: number): string {
  if (d <= 1.01) return '1/100'
  const target = d - 1
  // find nice fraction
  for (let den = 1; den <= 100; den++) {
    const num = Math.round(target * den)
    if (num >= 1 && Math.abs(num / den - target) < 0.02) {
      return `${num}/${den}`
    }
  }
  return `${Math.round(target * 100)}/100`
}

export function formatOdds(decimal: number, format: OddsFormat): string {
  if (format === 'decimal') return decimal.toFixed(2)
  if (format === 'fractional') return toFraction(decimal)
  // american
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

export function formatMoney(v: number): string {
  return `€${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
