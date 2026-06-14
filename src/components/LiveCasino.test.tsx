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

  it('renders iframe element with correct youtube embed URL in the card bg', () => {
    render(<LiveCasino />);
    
    const iframeElements = document.querySelectorAll('iframe');
    expect(iframeElements.length).toBeGreaterThan(0);
    expect(iframeElements[0]).toHaveAttribute('src', expect.stringContaining('https://www.youtube.com/embed/83PKonTnHoA'));
  });

  it('does not render iframe or video elements for Speed Baccarat A, Mega Ball, and Crazy Time', () => {
    render(<LiveCasino />);
    
    const baccaratCard = screen.getByText('Speed Baccarat A').closest('.lc-table-card');
    const megaBallCard = screen.getByText('Mega Ball').closest('.lc-table-card');
    const crazyTimeCard = screen.getByText('Crazy Time').closest('.lc-table-card');

    expect(baccaratCard?.querySelector('iframe')).toBeNull();
    expect(baccaratCard?.querySelector('video')).toBeNull();
    
    expect(megaBallCard?.querySelector('iframe')).toBeNull();
    expect(megaBallCard?.querySelector('video')).toBeNull();
    
    expect(crazyTimeCard?.querySelector('iframe')).toBeNull();
    expect(crazyTimeCard?.querySelector('video')).toBeNull();
  });
});
