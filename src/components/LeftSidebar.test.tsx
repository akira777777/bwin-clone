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

  it('renders sport navigation items and highlights the active sport', () => {
    render(<LeftSidebar {...createProps({ activeSport: 'Tennis' })} />);

    const tennisItem = screen.getByText('Tennis').closest('li');
    expect(tennisItem).toHaveClass('active');

    // Other sports present as list items
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
  });

  it('calls setActiveSport when a sport item is clicked', async () => {
    const user = userEvent.setup();
    const setActiveSport = vi.fn();
    render(<LeftSidebar {...createProps({ setActiveSport })} />);

    await user.click(screen.getByText('Ice Hockey'));
    expect(setActiveSport).toHaveBeenCalledWith('Ice Hockey');
  });

  it('renders league list for the active sport and allows selecting a league', async () => {
    const user = userEvent.setup();
    const setActiveLeague = vi.fn();
    render(<LeftSidebar {...createProps({ activeSport: 'Football', setActiveLeague })} />);

    // Premier League should be present for Football (use getAllByText and pick one)
    const pls = screen.getAllByText('Premier League');
    expect(pls.length).toBeGreaterThan(0);

    await user.click(pls[0]);
    expect(setActiveLeague).toHaveBeenCalledWith('Premier League');
  });

  it('toggles activeLeague when clicking a league item (deselects if already active)', async () => {
    const user = userEvent.setup();
    const setActiveLeague = vi.fn();
    render(<LeftSidebar {...createProps({ activeSport: 'Football', activeLeague: 'La Liga', setActiveLeague })} />);

    const laLigas = screen.getAllByText('La Liga');
    await user.click(laLigas[0]);

    // The handler toggles: if same, calls with null
    expect(setActiveLeague).toHaveBeenCalledWith(null);
  });
});
