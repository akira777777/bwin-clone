import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import MainContent from './MainContent';
import type { Bet, Category, Sport, MatchData } from '../App';
import { initialMatches, getDynamicizedMatches } from '../data/matches';
import * as api from '../services/api';

// Mock the service
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    fetchLiveMatches: vi.fn(),
  };
});

const mockFetchLiveMatches = api.fetchLiveMatches as ReturnType<typeof vi.fn>;

const createProps = (overrides: Partial<Parameters<typeof MainContent>[0]> = {}) => ({
  betSlip: [] as Bet[],
  addBet: vi.fn(),
  activeCategory: 'Sports' as Category,
  activeSport: 'Football' as Sport,
  setActiveSport: vi.fn(),
  activeLeague: null,
  setActiveLeague: vi.fn(),
  selectedMatchId: null,
  setSelectedMatchId: vi.fn(),
  matches: initialMatches,
  setMatches: vi.fn(),
  ...overrides,
});

// Helper to clear localStorage between tests
const originalLocalStorage = { ...global.localStorage };

describe('MainContent (RTL component + integration tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLiveMatches.mockReset();
    // Reset localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('shows API key modal when no key in localStorage or env', () => {
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    // Simulate no env key
    vi.stubEnv('VITE_ODDS_API_KEY', '');

    render(<MainContent {...createProps()} />);

    expect(screen.getByText(/Live Match Data Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/To view real, live matches instead of mock data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip \(Use Mock Data\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect Live Data/i })).toBeInTheDocument();
  });

  it('skips API key modal and uses mock data when clicking Skip', async () => {
    const user = userEvent.setup();
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const setMatches = vi.fn();

    render(<MainContent {...createProps({ setMatches })} />);

    await user.click(screen.getByRole('button', { name: /Skip \(Use Mock Data\)/i }));

    // Modal should be gone
    expect(screen.queryByText(/Live Match Data Setup/i)).not.toBeInTheDocument();

    // Should show sports nav (indicates mock data mode)
    expect(screen.getByRole('navigation', { name: /Sports Categories/i })).toBeInTheDocument();
    // And live/upcoming sections based on initial data
    expect(screen.getByText(/Live Now/i)).toBeInTheDocument();
  });

  it('connects with API key: saves to localStorage, calls fetchLiveMatches, updates matches on success', async () => {
    const user = userEvent.setup();
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const setMatches = vi.fn();
    const fakeMatches: MatchData[] = [{ ...initialMatches[0], id: 'real-1' }];

    mockFetchLiveMatches.mockResolvedValue(fakeMatches);

    render(<MainContent {...createProps({ setMatches })} />);

    // Fill the input (it uses ref, so we type into the visible input)
    const keyInput = screen.getByPlaceholderText(/Paste your API key here/i);
    await user.type(keyInput, 'test-api-key-123');

    await user.click(screen.getByRole('button', { name: /Connect Live Data/i }));

    // localStorage set
    expect(global.localStorage.setItem).toHaveBeenCalledWith('odds_api_key', 'test-api-key-123');

    // Service called
    await waitFor(() => {
      expect(mockFetchLiveMatches).toHaveBeenCalledWith('test-api-key-123');
    });

    // setMatches called with real data
    await waitFor(() => {
      expect(setMatches).toHaveBeenCalledWith(fakeMatches);
    });
  });

  it('shows loading state while fetching real matches', async () => {
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('existing-key');
    mockFetchLiveMatches.mockImplementation(() => new Promise(() => {})); // never resolves

    render(<MainContent {...createProps()} />);

    // It auto-loads on mount if key present and not using mock
    await waitFor(() => {
      expect(screen.getByText(/Loading live matches.../i)).toBeInTheDocument();
    });
  });

  it('falls back to mock data and shows error when fetchLiveMatches fails', async () => {
    const user = userEvent.setup();
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const setMatches = vi.fn();
    mockFetchLiveMatches.mockRejectedValue(new Error('Rate limit exceeded'));

    render(<MainContent {...createProps({ setMatches })} />);

    const keyInput = screen.getByPlaceholderText(/Paste your API key here/i);
    await user.type(keyInput, 'bad-key');
    await user.click(screen.getByRole('button', { name: /Connect Live Data/i }));

    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
    });

    // Falls back
    expect(setMatches).toHaveBeenCalledWith(getDynamicizedMatches(initialMatches));
  });

  it('shows league tabs (Matches, Standings, Outrights, Stats) when activeLeague is provided', () => {
    // Ensure a key is present so the modal is skipped and we reach the league header + tabs
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dummy-key-for-tabs');

    render(<MainContent {...createProps({ activeLeague: 'Premier League' })} />);

    expect(screen.getByRole('button', { name: /Matches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Standings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Outrights/i })).toBeInTheDocument();
    // Stats only if data exists for the league
    expect(screen.getByRole('button', { name: /Stats/i })).toBeInTheDocument();
  });

  it('switches internal activeTab when clicking league tabs', async () => {
    const user = userEvent.setup();
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dummy-key-for-tabs');

    render(<MainContent {...createProps({ activeLeague: 'Premier League' })} />);

    await user.click(screen.getByRole('button', { name: /Standings/i }));
    // We can check that standings content appears (table or empty state)
    // Since standings data exists, we should see the table
    expect(screen.getByRole('table')).toBeInTheDocument(); // rough check for standings table
  });
});
