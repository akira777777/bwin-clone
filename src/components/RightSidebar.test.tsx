import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import RightSidebar from './RightSidebar';
import type { Bet, PlacedBet } from '../App';
import { initialMatches } from '../data/matches';
import type { MatchData } from '../data/matches';

// Helper to create minimal props
const createProps = (overrides: Partial<Parameters<typeof RightSidebar>[0]> = {}) => {
  const defaultBets: Bet[] = [];
  const defaultMatches: MatchData[] = initialMatches.slice(0, 3);

  return {
    betSlip: defaultBets,
    setBetSlip: vi.fn(),
    removeBet: vi.fn(),
    clearBetSlip: vi.fn(),
    placedBets: [] as PlacedBet[],
    onPlaceBet: vi.fn(),
    closeMobileSlip: undefined,
    matches: defaultMatches,
    ...overrides,
  };
};

describe('RightSidebar (component tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty bet slip state when no bets', () => {
    const props = createProps();
    render(<RightSidebar {...props} />);

    expect(screen.getByText(/Your bet slip is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Click on odds to add selections/i)).toBeInTheDocument();
  });

  it('renders bet items when betSlip has selections', () => {
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.45 },
      { id: 'm1-draw', match: 'Arsenal vs Man Utd', selection: 'draw', odds: 4.20 },
    ];
    const props = createProps({ betSlip: bets });

    render(<RightSidebar {...props} />);

    // Use getAllByText because match name appears in multiple bet items + possibly header
    const matchNames = screen.getAllByText('Arsenal vs Man Utd');
    expect(matchNames.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('draw')).toBeInTheDocument();
    expect(screen.getByText('1.45')).toBeInTheDocument();
    expect(screen.getByText('4.20')).toBeInTheDocument();
    // Tab shows count
    expect(screen.getByRole('button', { name: /Bet Slip/i })).toHaveTextContent('2');
  });

  it('shows Multi mode by default and calculates total odds + potential return', async () => {
    const user = userEvent.setup();
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.5 },
      { id: 'm2-away', match: 'Liverpool vs Chelsea', selection: 'away', odds: 2.0 },
    ];
    const props = createProps({ betSlip: bets });

    render(<RightSidebar {...props} />);

    // Default multi tab
    expect(screen.getByText(/Multi Accumulator/i)).toBeInTheDocument();

    // Enter stake
    const stakeInput = screen.getByPlaceholderText('0.00');
    await user.type(stakeInput, '10');

    // Total odds = 1.5 * 2.0 = 3.0
    expect(screen.getByText('3.00')).toBeInTheDocument();
    // Potential = 30.00
    expect(screen.getByText('€30.00')).toBeInTheDocument();
  });

  it('switches to Single mode and shows per-bet stakes + returns', async () => {
    const user = userEvent.setup();
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.5 },
    ];
    const props = createProps({ betSlip: bets });

    render(<RightSidebar {...props} />);

    await user.click(screen.getByRole('button', { name: 'Single' }));

    expect(screen.getByText(/Single Bets/i)).toBeInTheDocument();

    // Stake input per bet appears
    const stakeInputs = screen.getAllByPlaceholderText('Stake');
    expect(stakeInputs).toHaveLength(1);
  });

  it('shows System mode only when 3+ bets and allows size selection', async () => {
    const user = userEvent.setup();
    const bets: Bet[] = [
      { id: 'b1', match: 'A vs B', selection: 'home', odds: 1.5 },
      { id: 'b2', match: 'C vs D', selection: 'away', odds: 2.1 },
      { id: 'b3', match: 'E vs F', selection: 'home', odds: 1.8 },
    ];
    const props = createProps({ betSlip: bets });

    render(<RightSidebar {...props} />);

    expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'System' }));

    // System config appears
    expect(screen.getByText(/System size:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Bets:/i)).toBeInTheDocument();
  });

  it('calls onPlaceBet with correct values in Multi mode', async () => {
    const user = userEvent.setup();
    const onPlaceBet = vi.fn();
    // Use a single-leg "multi" so odds math is trivial and we can easily match the data
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.5 },
    ];
    const consistentMatches = [
      { ...initialMatches[0], odds: { home: 1.5, draw: 4.2, away: 7.5 } },
    ];
    const props = createProps({ betSlip: bets, onPlaceBet, matches: consistentMatches as MatchData[] });

    render(<RightSidebar {...props} />);

    const stakeInput = screen.getByPlaceholderText('0.00');
    await user.type(stakeInput, '10');

    const placeBtn = screen.getByRole('button', { name: /Place Bet/i });
    await user.click(placeBtn);

    // The component has a 1.5s success timeout before calling onPlaceBet
    await waitFor(() => {
      expect(onPlaceBet).toHaveBeenCalledWith(10, 15, 'Multi');
    }, { timeout: 2000 });
  });

  it('disables Place Bet button when no stake or odds changed', async () => {
    const user = userEvent.setup();
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.5 },
    ];
    // Provide matches with *exactly* the same odds as the bets so hasOddsChanged stays false
    const matchingMatches = [
      { ...initialMatches[0], odds: { home: 1.5, draw: 4.2, away: 7.5 } },
    ];
    const props = createProps({ betSlip: bets, matches: matchingMatches as MatchData[] });

    render(<RightSidebar {...props} />);

    const placeBtn = screen.queryByRole('button', { name: /Place Bet|Accept Odds to Bet/i });
    // Without stake it should be disabled
    expect(placeBtn).toBeDisabled();

    const stakeInput = screen.getByPlaceholderText('0.00');
    await user.type(stakeInput, '5');

    // After entering stake it enables
    const enabledBtn = screen.getByRole('button', { name: /Place Bet/i });
    expect(enabledBtn).not.toBeDisabled();
  });

  it('disables Place Bet button and shows Self-Excluded label when isSelfExcluded is true', async () => {
    const user = userEvent.setup();
    const bets: Bet[] = [
      { id: 'm1-home', match: 'Arsenal vs Man Utd', selection: 'home', odds: 1.5 },
    ];
    const matchingMatches = [
      { ...initialMatches[0], odds: { home: 1.5, draw: 4.2, away: 7.5 } },
    ];
    const props = createProps({ 
      betSlip: bets, 
      matches: matchingMatches as MatchData[],
      isSelfExcluded: true 
    });

    render(<RightSidebar {...props} />);

    const stakeInput = screen.getByPlaceholderText('0.00');
    await user.type(stakeInput, '10');

    // Even with stake, it should be disabled and show Self-Excluded
    const placeBtn = screen.getByRole('button', { name: /Self-Excluded/i });
    expect(placeBtn).toBeDisabled();
    expect(screen.getByText(/Account Self-Excluded! Betting is locked/i)).toBeInTheDocument();
  });
});
