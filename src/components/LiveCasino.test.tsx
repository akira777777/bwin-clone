import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { LiveCasino } from './LiveCasino';

describe('LiveCasino Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default language', () => {
    render(<LiveCasino />);
    expect(screen.getByText('Live Casino')).toBeInTheDocument();
    expect(screen.getByText('Live Tables')).toBeInTheDocument();
    expect(screen.getByText('Lightning Roulette')).toBeInTheDocument();
  });

  it('translates title and promo text when language is Russian', () => {
    render(<LiveCasino language="ru" />);
    expect(screen.getByText('Лайв казино')).toBeInTheDocument();
    expect(screen.getByText('Столы в прямом эфире')).toBeInTheDocument();
  });

  it('filters tables by category', async () => {
    const user = userEvent.setup();
    render(<LiveCasino />);

    // Initially all tables are visible
    expect(screen.getByText('Lightning Roulette')).toBeInTheDocument();
    expect(screen.getByText('Bwin Blackjack VIP')).toBeInTheDocument();

    // Click Blackjack filter
    await user.click(screen.getByRole('button', { name: 'Blackjack' }));

    // Blackjack is visible, Roulette is hidden
    expect(screen.getByText('Bwin Blackjack VIP')).toBeInTheDocument();
    expect(screen.queryByText('Lightning Roulette')).not.toBeInTheDocument();
  });

  it('renders video element with correct videoUrl in the card bg', () => {
    render(<LiveCasino />);
    
    const videoElements = document.querySelectorAll('video');
    expect(videoElements.length).toBeGreaterThan(0);
    expect(videoElements[0]).toHaveAttribute('src', '/videos/roulette.mp4');
  });
});
