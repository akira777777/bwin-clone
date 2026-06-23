import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Poker } from './Poker';

describe('Poker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderPoker = (props = {}) => {
    return render(<Poker {...props} />);
  };

  describe('Rendering', () => {
    it('renders the poker component with default English language', () => {
      renderPoker();
      expect(screen.getByText('Poker')).toBeInTheDocument();
      expect(screen.getByText('Poker Lobby')).toBeInTheDocument();
    });

    it('renders with Russian language translations', () => {
      renderPoker({ language: 'ru' });
      expect(screen.getByText('Покер')).toBeInTheDocument();
      expect(screen.getByText('Покерный лобби')).toBeInTheDocument();
    });

    it('renders promo banner with correct content', () => {
      renderPoker();
      expect(screen.getByText('Cash games and tournaments — Texas Hold\'em, Omaha & PLO')).toBeInTheDocument();
      expect(screen.getByText('Download Client')).toBeInTheDocument();
    });

    it('renders promo banner with Russian content', () => {
      renderPoker({ language: 'ru' });
      expect(screen.getByText('Кэш-игры и турниры — Texas Hold\'em, Omaha и PLO')).toBeInTheDocument();
      expect(screen.getByText('Скачать клиент')).toBeInTheDocument();
    });

    it('renders tab navigation buttons', () => {
      renderPoker();
      expect(screen.getByRole('button', { name: 'Cash Games' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tournaments' })).toBeInTheDocument();
    });

    it('renders Russian tab navigation', () => {
      renderPoker({ language: 'ru' });
      expect(screen.getByRole('button', { name: 'Кэш-игры' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Турниры' })).toBeInTheDocument();
    });
  });

  describe('Cash Games Tab', () => {
    it('displays cash games by default', () => {
      renderPoker();
      expect(screen.getByText('NL Hold\'em')).toBeInTheDocument();
      expect(screen.getByText('Texas Hold\'em')).toBeInTheDocument();
    });

    it('renders all cash game headers', () => {
      renderPoker();
      expect(screen.getByText('Game')).toBeInTheDocument();
      expect(screen.getByText('Variant')).toBeInTheDocument();
      expect(screen.getByText('Stakes')).toBeInTheDocument();
      expect(screen.getByText('Players')).toBeInTheDocument();
      expect(screen.getByText('Avg Pot')).toBeInTheDocument();
    });

    it('renders Russian cash game headers', () => {
      renderPoker({ language: 'ru' });
      expect(screen.getByText('Игра')).toBeInTheDocument();
      expect(screen.getByText('Вариант')).toBeInTheDocument();
      expect(screen.getByText('Ставки')).toBeInTheDocument();
      expect(screen.getByText('Игроков')).toBeInTheDocument();
      expect(screen.getByText('Средний пот')).toBeInTheDocument();
    });

    it('displays correct cash games data', () => {
      renderPoker();
      expect(screen.getByText('$0.01/$0.02')).toBeInTheDocument();
      expect(screen.getByText('$0.05/$0.10')).toBeInTheDocument();
      expect(screen.getByText('$0.25/$0.50')).toBeInTheDocument();
      expect(screen.getByText('6/9')).toBeInTheDocument();
      expect(screen.getByText('$0.35')).toBeInTheDocument();
    });

    it('displays all poker variants', () => {
      renderPoker();
      expect(screen.getByText('PLO')).toBeInTheDocument();
      expect(screen.getByText('Omaha')).toBeInTheDocument();
      expect(screen.getByText('PLO Hi')).toBeInTheDocument();
      expect(screen.getByText('Omaha Hi-Lo')).toBeInTheDocument();
    });

    it('renders sit down buttons for each cash game', () => {
      renderPoker();
      const sitDownButtons = screen.getAllByText('Sit Down');
      expect(sitDownButtons.length).toBeGreaterThan(0);
    });

    it('renders Russian sit down buttons', () => {
      renderPoker({ language: 'ru' });
      const sitDownButtons = screen.getAllByText('Сесть');
      expect(sitDownButtons.length).toBeGreaterThan(0);
    });

    it('shows correct player seating information', () => {
      renderPoker();
      expect(screen.getByText('6/9')).toBeInTheDocument();
      expect(screen.getByText('8/9')).toBeInTheDocument();
      expect(screen.getByText('4/6')).toBeInTheDocument();
      expect(screen.getByText('3/6')).toBeInTheDocument();
    });
  });

  describe('Tournaments Tab', () => {
    it('switches to tournaments tab', async () => {
      const user = userEvent.setup();
      renderPoker();

      const tournamentsButton = screen.getByRole('button', { name: 'Tournaments' });
      await user.click(tournamentsButton);

      expect(screen.getByText('Daily $5K GTD')).toBeInTheDocument();
      expect(screen.getByText('Sunday Special')).toBeInTheDocument();
    });

    it('displays tournament cards with correct information', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('Daily $5K GTD')).toBeInTheDocument();
      expect(screen.getByText('Buy-In')).toBeInTheDocument();
      expect(screen.getByText('Prize Pool')).toBeInTheDocument();
      expect(screen.getByText('Registered')).toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('displays Russian tournament labels', async () => {
      const user = userEvent.setup();
      renderPoker({ language: 'ru' });

      await user.click(screen.getByRole('button', { name: 'Турниры' }));

      expect(screen.getByText('Взнос')).toBeInTheDocument();
      expect(screen.getByText('Призовой')).toBeInTheDocument();
      expect(screen.getByText('Зарег.')).toBeInTheDocument();
      expect(screen.getByText('Старт')).toBeInTheDocument();
    });

    it('shows correct tournament data', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('$11')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('312')).toBeInTheDocument();
      expect(screen.getByText('20:00')).toBeInTheDocument();
    });

    it('displays tournament status badges', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('Registering')).toBeInTheDocument();
      expect(screen.getByText('Starting Soon')).toBeInTheDocument();
      expect(screen.getByText('Late Reg')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('renders register buttons for tournaments', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      const registerButtons = screen.getAllByText('Register');
      expect(registerButtons.length).toBeGreaterThan(0);
    });

    it('disables register button for running tournaments', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      const runningTournament = screen.getByText('High Roller 200').closest('.pk-tournament-card');
      const registerButton = runningTournament?.querySelector('.pk-register-btn') as HTMLButtonElement;

      expect(registerButton).toBeDisabled();
    });

    it('shows in progress text for running tournaments', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('shows Russian in progress text for running tournaments', async () => {
      const user = userEvent.setup();
      renderPoker({ language: 'ru' });

      await user.click(screen.getByRole('button', { name: 'Турниры' }));

      expect(screen.getByText('Идёт игра')).toBeInTheDocument();
    });

    it('displays freeroll tournament', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('Freeroll Opener')).toBeInTheDocument();
      expect(screen.getByText('FREE')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('switches from cash games to tournaments', async () => {
      const user = userEvent.setup();
      renderPoker();

      expect(screen.getByText('$0.01/$0.02')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('Daily $5K GTD')).toBeInTheDocument();
    });

    it('switches from tournaments back to cash games', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));
      expect(screen.getByText('Daily $5K GTD')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cash Games' }));
      expect(screen.getByText('$0.01/$0.02')).toBeInTheDocument();
    });

    it('maintains active state on selected tab', async () => {
      const user = userEvent.setup();
      renderPoker();

      const cashGamesBtn = screen.getByRole('button', { name: 'Cash Games' });
      const tournamentsBtn = screen.getByRole('button', { name: 'Tournaments' });

      expect(cashGamesBtn).toHaveClass('active');
      expect(tournamentsBtn).not.toHaveClass('active');

      await user.click(tournamentsBtn);

      expect(tournamentsBtn).toHaveClass('active');
      expect(cashGamesBtn).not.toHaveClass('active');
    });
  });

  describe('Toast Messages', () => {
    it('shows toast when clicking download client button', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Download Client' }));

      expect(screen.getByText('Download our Poker client to play!')).toBeInTheDocument();
    });

    it('shows Russian toast when clicking download client button', async () => {
      const user = userEvent.setup();
      renderPoker({ language: 'ru' });

      await user.click(screen.getByRole('button', { name: 'Скачать клиент' }));

      expect(screen.getByText('Download our Poker client to play!')).toBeInTheDocument();
    });

    it('shows toast when clicking cash game row', async () => {
      const user = userEvent.setup();
      renderPoker();

      const firstGameRow = screen.getByText('NL Hold\'em').closest('.pk-table-row');
      await user.click(firstGameRow!);

      expect(screen.getByText(/Joining NL Hold'em/)).toBeInTheDocument();
    });

    it('shows toast when clicking sit down button', async () => {
      const user = userEvent.setup();
      renderPoker();

      const sitDownButtons = screen.getAllByText('Sit Down');
      await user.click(sitDownButtons[0]);

      expect(screen.getByText(/Joining/)).toBeInTheDocument();
    });

    it('shows toast when registering for tournament', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      const registerButtons = screen.getAllByText('Register');
      await user.click(registerButtons[0]);

      expect(screen.getByText(/Registered for/)).toBeInTheDocument();
    });

    it('shows in progress message for running tournament', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      const runningTournament = screen.getByText('High Roller 200').closest('.pk-tournament-card');
      const inProgressButton = runningTournament?.querySelector('button') as HTMLButtonElement;

      await user.click(inProgressButton);

      expect(screen.getByText('Tournament already in progress.')).toBeInTheDocument();
    });

    it('removes toast after 3 seconds', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Download Client' }));
      expect(screen.getByText('Download our Poker client to play!')).toBeInTheDocument();

      vi.advanceTimersByTime(3000);
      expect(screen.queryByText('Download our Poker client to play!')).not.toBeInTheDocument();
    });

    it('clears previous toast timeout when showing new toast', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Download Client' }));

      await user.click(screen.getByRole('button', { name: 'Download Client' }));

      vi.advanceTimersByTime(3000);
      expect(screen.queryByText('Download our Poker client to play!')).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('prevents event propagation when clicking sit down button', async () => {
      const user = userEvent.setup();
      renderPoker();

      const sitDownButtons = screen.getAllByText('Sit Down');
      const firstButton = sitDownButtons[0];
      const parentRow = firstButton.closest('.pk-table-row');

      let rowClicked = false;
      let buttonClicked = false;

      if (parentRow) {
        parentRow.addEventListener('click', () => { rowClicked = true; });
      }

      firstButton.addEventListener('click', (e) => {
        buttonClicked = true;
      });

      await user.click(firstButton);

      expect(buttonClicked).toBe(true);
      expect(rowClicked).toBe(false);
    });
  });

  describe('Data Display', () => {
    it('renders all 6 cash games', () => {
      renderPoker();
      const gameNames = screen.getAllByText(/NL Hold'em|PLO Hi|Omaha Hi-Lo/);
      expect(gameNames.length).toBeGreaterThanOrEqual(6);
    });

    it('renders all 6 tournaments', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('Daily $5K GTD')).toBeInTheDocument();
      expect(screen.getByText('Sunday Special')).toBeInTheDocument();
      expect(screen.getByText('Turbo Knockout')).toBeInTheDocument();
      expect(screen.getByText('Micro Series #7')).toBeInTheDocument();
      expect(screen.getByText('High Roller 200')).toBeInTheDocument();
      expect(screen.getByText('Freeroll Opener')).toBeInTheDocument();
    });

    it('displays correct stakes formatting', () => {
      renderPoker();
      expect(screen.getByText('$0.10/$0.25')).toBeInTheDocument();
      expect(screen.getByText('$0.50/$1.00')).toBeInTheDocument();
    });

    it('displays average pot values', () => {
      renderPoker();
      expect(screen.getByText('$0.35')).toBeInTheDocument();
      expect(screen.getByText('$1.80')).toBeInTheDocument();
      expect(screen.getByText('$9.40')).toBeInTheDocument();
      expect(screen.getByText('$4.20')).toBeInTheDocument();
      expect(screen.getByText('$18.50')).toBeInTheDocument();
      expect(screen.getByText('$2.10')).toBeInTheDocument();
    });

    it('displays tournament prize pools', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
      expect(screen.getByText('$20,000')).toBeInTheDocument();
      expect(screen.getByText('$250')).toBeInTheDocument();
    });

    it('displays tournament buy-ins', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      expect(screen.getByText('$11')).toBeInTheDocument();
      expect(screen.getByText('$55')).toBeInTheDocument();
      expect(screen.getByText('$22')).toBeInTheDocument();
      expect(screen.getByText('$3.30')).toBeInTheDocument();
      expect(screen.getByText('$215')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" on toast messages', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Download Client' }));

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Download our Poker client to play!');
    });

    it('buttons are clickable and have correct types', () => {
      renderPoker();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up timeout on unmount', () => {
      const { unmount } = renderPoker();

      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles switching tabs multiple times rapidly', async () => {
      const user = userEvent.setup();
      renderPoker();

      const cashGamesBtn = screen.getByRole('button', { name: 'Cash Games' });
      const tournamentsBtn = screen.getByRole('button', { name: 'Tournaments' });

      await user.click(tournamentsBtn);
      await user.click(cashGamesBtn);
      await user.click(tournamentsBtn);
      await user.click(cashGamesBtn);

      expect(screen.getByText('$0.01/$0.02')).toBeInTheDocument();
    });

    it('handles multiple rapid toast displays', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Download Client' }));
      await user.click(screen.getByRole('button', { name: 'Download Client' }));
      await user.click(screen.getByRole('button', { name: 'Download Client' }));

      expect(screen.getAllByText('Download our Poker client to play!').length).toBe(1);
    });

    it('renders with no props provided', () => {
      const { container } = render(<Poker />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles undefined language prop gracefully', () => {
      render(<Poker language={undefined as any} />);
      expect(screen.getByText('Poker')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('applies correct color styles for tournament statuses', async () => {
      const user = userEvent.setup();
      renderPoker();

      await user.click(screen.getByRole('button', { name: 'Tournaments' }));

      const registeringStatus = screen.getAllByText('Registering')[0];
      const runningStatus = screen.getByText('Running');
      const lateRegStatus = screen.getByText('Late Reg');
      const startingSoonStatus = screen.getByText('Starting Soon');

      expect(registeringStatus).toHaveStyle({ color: '#4caf50' });
      expect(runningStatus).toHaveStyle({ color: '#2196f3' });
      expect(lateRegStatus).toHaveStyle({ color: '#ff9800' });
      expect(startingSoonStatus).toHaveStyle({ color: '#f44336' });
    });
  });
});
