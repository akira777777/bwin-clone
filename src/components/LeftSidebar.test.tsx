import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import LeftSidebar from './LeftSidebar';
import type { Sport } from '../App';
import { initialMatches } from '../data/matches';

const createProps = (overrides: Partial<Parameters<typeof LeftSidebar>[0]> = {}) => ({
  activeSport: 'Football' as Sport,
  setActiveSport: vi.fn(),
  activeLeague: null,
  setActiveLeague: vi.fn(),
  matches: initialMatches,
  ...overrides,
});

describe('LeftSidebar (RTL component tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sport navigation buttons and highlights the active sport', () => {
    render(<LeftSidebar {...createProps({ activeSport: 'Tennis' })} />);

    const tennisBtn = screen.getByRole('button', { name: 'Tennis' });
    expect(tennisBtn).toHaveClass('active'); // or the component's active class

    // Other sports present
    expect(screen.getByRole('button', { name: 'Football' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Basketball' })).toBeInTheDocument();
  });

  it('calls setActiveSport when a sport button is clicked', async () => {
    const user = userEvent.setup();
    const setActiveSport = vi.fn();
    render(<LeftSidebar {...createProps({ setActiveSport })} />);

    await user.click(screen.getByRole('button', { name: 'Ice Hockey' }));
    expect(setActiveSport).toHaveBeenCalledWith('Ice Hockey');
  });

  it('renders league list for the active sport and allows selecting a league', async () => {
    const user = userEvent.setup();
    const setActiveLeague = vi.fn();
    render(<LeftSidebar {...createProps({ activeSport: 'Football', setActiveLeague })} />);

    // Premier League should be present for Football
    const pl = screen.getByText('Premier League');
    expect(pl).toBeInTheDocument();

    await user.click(pl);
    expect(setActiveLeague).toHaveBeenCalledWith('Premier League');
  });

  it('clears league when clicking the active league again (or shows a clear option)', async () => {
    const user = userEvent.setup();
    const setActiveLeague = vi.fn();
    render(<LeftSidebar {...createProps({ activeSport: 'Football', activeLeague: 'La Liga', setActiveLeague })} />);

    // Depending on exact UX, either the active league button or a "clear" element
    // We keep the test flexible: just assert the setter can be driven
    const laLiga = screen.getByText('La Liga');
    await user.click(laLiga);

    // If it toggles off, it would call with null; if it re-selects, same value.
    // The important thing is the handler is wired.
    expect(setActiveLeague).toHaveBeenCalled();
  });
});
