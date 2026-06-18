import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import MatchRow from './MatchRow';
import type { MatchData } from '../data/matches';
import type { Bet } from '../App';
import { initialMatches } from '../data/matches';

const sampleMatch: MatchData = initialMatches[0]; // Arsenal vs Man Utd, live, has markets

const createProps = (overrides: Partial<Parameters<typeof MatchRow>[0]> = {}) => ({
  match: sampleMatch,
  betSlip: [] as Bet[],
  addBet: vi.fn(),
  onSelectMatch: vi.fn(),
  ...overrides,
});

describe('MatchRow (RTL component tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders league, team names, and time/status correctly for a live match', () => {
    render(<MatchRow {...createProps()} />);

    expect(screen.getByText(sampleMatch.league)).toBeInTheDocument();
    expect(screen.getByText(sampleMatch.team1)).toBeInTheDocument();
    expect(screen.getByText(sampleMatch.team2)).toBeInTheDocument();

    // Live time with icon
    const liveTime = screen.getByText(sampleMatch.time);
    expect(liveTime).toBeInTheDocument();
    expect(liveTime.closest('.live-time')).toBeInTheDocument();
  });

  it('renders upcoming time with Clock icon for non-live matches', () => {
    const upcoming = initialMatches.find(m => !m.isLive)!;
    render(<MatchRow {...createProps({ match: upcoming })} />);

    const timeEl = screen.getByText(upcoming.time);
    expect(timeEl.closest('.upcoming-time')).toBeInTheDocument();
  });

  it('renders live scores next to teams when available', () => {
    const matchWithScore = { ...sampleMatch, score: '2 - 1' };
    render(<MatchRow {...createProps({ match: matchWithScore })} />);

    // Use more specific queries to avoid clashing with odds labels "1"/"2"
    const teams = screen.getByText(sampleMatch.team1).closest('.team')!;
    expect(teams.querySelector('.score')).toHaveTextContent('2');

    const awayTeam = screen.getByText(sampleMatch.team2).closest('.team')!;
    expect(awayTeam.querySelector('.score')).toHaveTextContent('1');
  });

  it('renders three odds buttons (1 / X / 2) with correct values', () => {
    render(<MatchRow {...createProps()} />);

    // Scope from the unique 'X' label (draw) — safe, no score is ever "X"
    const oddsContainer = screen.getByText('X').closest('.match-odds')!;

    // Labels inside
    const labels = oddsContainer.querySelectorAll('.odds-label');
    expect(labels[0]).toHaveTextContent('1');
    expect(labels[1]).toHaveTextContent('X');
    expect(labels[2]).toHaveTextContent('2');

    // Values
    expect(screen.getByText(sampleMatch.odds.home.toFixed(2))).toBeInTheDocument();
    expect(screen.getByText(sampleMatch.odds.draw.toFixed(2))).toBeInTheDocument();
    expect(screen.getByText(sampleMatch.odds.away.toFixed(2))).toBeInTheDocument();
  });

  it('shows "-" for zero odds and does not call addBet when clicked', async () => {
    const user = userEvent.setup();
    const matchWithZero = {
      ...sampleMatch,
      odds: { home: 0, draw: 3.8, away: 5.5 },
    };
    const addBet = vi.fn();
    render(<MatchRow {...createProps({ match: matchWithZero, addBet })} />);

    const zeroBtn = screen.getByText('-');
    expect(zeroBtn).toHaveClass('disabled-odds');

    await user.click(zeroBtn);
    expect(addBet).not.toHaveBeenCalled();
  });

  it('calls addBet with correct Bet object when clicking a non-zero odds button', async () => {
    const user = userEvent.setup();
    const addBet = vi.fn();
    render(<MatchRow {...createProps({ addBet })} />);

    // Click home odds
    const homeBtn = screen.getByText(sampleMatch.odds.home.toFixed(2)).closest('button')!;
    await user.click(homeBtn);

    expect(addBet).toHaveBeenCalledWith({
      id: `${sampleMatch.id}-home`,
      match: `${sampleMatch.team1} vs ${sampleMatch.team2}`,
      selection: sampleMatch.team1,
      odds: sampleMatch.odds.home,
    });
  });

  it('marks button as selected when the corresponding bet is already in betSlip', () => {
    const betSlip: Bet[] = [
      { id: `${sampleMatch.id}-home`, match: 'foo', selection: 'home', odds: 1.45 },
    ];
    render(<MatchRow {...createProps({ betSlip })} />);

    const homeBtn = screen.getByText(sampleMatch.odds.home.toFixed(2)).closest('button')!;
    expect(homeBtn).toHaveClass('selected');
  });

  it('applies trend-up / trend-down classes when match.trend is present', () => {
    const matchWithTrend = {
      ...sampleMatch,
      trend: { home: 'up' as const, draw: null, away: 'down' as const },
    };
    render(<MatchRow {...createProps({ match: matchWithTrend })} />);

    const homeBtn = screen.getByText(sampleMatch.odds.home.toFixed(2)).closest('button')!;
    const awayBtn = screen.getByText(sampleMatch.odds.away.toFixed(2)).closest('button')!;

    expect(homeBtn).toHaveClass('trend-up');
    expect(awayBtn).toHaveClass('trend-down');
  });

  it('calls onSelectMatch when clicking the row (but not when clicking odds buttons)', async () => {
    const user = userEvent.setup();
    const onSelectMatch = vi.fn();
    const addBet = vi.fn();
    render(<MatchRow {...createProps({ onSelectMatch, addBet })} />);

    // Click the row itself
    const row = screen.getByText(sampleMatch.league).closest('.match-row')!;
    await user.click(row);
    expect(onSelectMatch).toHaveBeenCalledWith(sampleMatch.id);

    // Clicking odds should not trigger row selection (stopPropagation)
    onSelectMatch.mockClear();
    const homeBtn = screen.getByText(sampleMatch.odds.home.toFixed(2)).closest('button')!;
    await user.click(homeBtn);

    expect(onSelectMatch).not.toHaveBeenCalled();
    expect(addBet).toHaveBeenCalled(); // but addBet was
  });
});
