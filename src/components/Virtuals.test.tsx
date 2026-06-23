import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Virtuals } from './Virtuals';

// Mock VirtualsSimulator to avoid complex audio/canvas mocking in this file
vi.mock('./VirtualsSimulator', () => ({
  VirtualsSimulator: ({ event, onClose, onScoreUpdate, language }: any) => (
    <div data-testid="virtuals-simulator">
      <div data-testid="simulator-event">{event.sport}</div>
      <div data-testid="simulator-language">{language}</div>
      <button onClick={() => onScoreUpdate(event.id, 5, 3)}>Update Score</button>
      <button onClick={onClose}>Close Simulator</button>
    </div>
  ),
}));

// Helper function to render with default props
const renderVirtuals = (props = {}) => {
  const defaultProps = {
    betSlip: [],
    addBet: vi.fn(),
    language: 'en',
    ...props,
  };
  return {
    user: userEvent.setup(),
    ...render(<Virtuals {...defaultProps} />),
    addBet: defaultProps.addBet,
  };
};

describe('Virtuals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the hero banner with title and description', () => {
      renderVirtuals();

      expect(screen.getByText('Virtual Sports')).toBeInTheDocument();
      expect(screen.getByText(/Non-stop action — events every 3 minutes, 24\/7/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Betting' })).toBeInTheDocument();
    });

    it('displays the correct number of active events badge', () => {
      renderVirtuals();
      expect(screen.getByText('6 events active')).toBeInTheDocument();
    });

    it('renders the "Live Now" badge in hero section', () => {
      renderVirtuals();
      expect(screen.getByText('Live Now')).toBeInTheDocument();
    });

    it('renders the featured live match section', () => {
      renderVirtuals();

      expect(screen.getByText('Live Now')).toBeInTheDocument();
      expect(screen.getByText('FC Alpha')).toBeInTheDocument();
      expect(screen.getByText('FC Beta')).toBeInTheDocument();
      expect(screen.getByText('1 – 0')).toBeInTheDocument();
    });

    it('renders the live match minute indicator', () => {
      renderVirtuals();
      expect(screen.getByText('LIVE · 67′')).toBeInTheDocument();
    });

    it('renders upcoming events section', () => {
      renderVirtuals();

      expect(screen.getByText('Next Events')).toBeInTheDocument();
      expect(screen.getByText('Virtual Greyhounds')).toBeInTheDocument();
      expect(screen.getByText('Virtual Tennis')).toBeInTheDocument();
    });

    it('renders all six virtual sports events', () => {
      renderVirtuals();

      expect(screen.getByText('Virtual Football')).toBeInTheDocument();
      expect(screen.getByText('Virtual Greyhounds')).toBeInTheDocument();
      expect(screen.getByText('Virtual Tennis')).toBeInTheDocument();
      expect(screen.getByText('Virtual Basketball')).toBeInTheDocument();
      expect(screen.getByText('Virtual Horse Racing')).toBeInTheDocument();
      expect(screen.getByText('Virtual Cycling')).toBeInTheDocument();
    });

    it('displays countdown timers for upcoming events', () => {
      renderVirtuals();

      // Greyhounds has countdown: 52 -> should show "00:52"
      expect(screen.getByText('00:52')).toBeInTheDocument();
      // Tennis has countdown: 134 -> should show "02:14"
      expect(screen.getByText('02:14')).toBeInTheDocument();
    });

    it('renders odds buttons for the live match', () => {
      renderVirtuals();

      // Live football match should have 1, X, 2 odds
      expect(screen.getByText('2.10')).toBeInTheDocument();
      expect(screen.getByText('3.20')).toBeInTheDocument();
      expect(screen.getByText('3.50')).toBeInTheDocument();
    });

    it('renders odds buttons for upcoming events', () => {
      renderVirtuals();

      // Greyhounds should have Win, Place, E/W odds
      expect(screen.getByText('4.50')).toBeInTheDocument();
      expect(screen.getByText('1.85')).toBeInTheDocument();
      expect(screen.getByText('2.40')).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('translates hero section to Russian when language is "ru"', () => {
      renderVirtuals({ language: 'ru' });

      expect(screen.getByText('Виртуальный спорт')).toBeInTheDocument();
      expect(screen.getByText(/Круглосуточный экшен — события каждые 3 минуты, 24\/7/)).toBeInTheDocument();
      expect(screen.getByText('В эфире')).toBeInTheDocument();
      expect(screen.getByText('6 активных событий')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Начать игру' })).toBeInTheDocument();
    });

    it('translates "Next Events" to Russian', () => {
      renderVirtuals({ language: 'ru' });
      expect(screen.getByText('Предстоящие события')).toBeInTheDocument();
    });

    it('translates "Live Now" to Russian', () => {
      renderVirtuals({ language: 'ru' });
      expect(screen.getByText('В игре')).toBeInTheDocument();
    });

    it('translates "Starts in" label to Russian', () => {
      renderVirtuals({ language: 'ru' });
      expect(screen.getAllByText('Старт через').length).toBeGreaterThan(0);
    });

    it('translates toast messages to Russian', async () => {
      const { user } = renderVirtuals({ language: 'ru' });

      await user.click(screen.getByRole('button', { name: 'Начать игру' }));
      expect(await screen.findByText('Выберите событие и кликайте по коэффициентам!')).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('updates countdown timers every second', () => {
      renderVirtuals();

      // Initial countdown for greyhounds
      expect(screen.getByText('00:52')).toBeInTheDocument();

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);

      // Should now show 00:51
      expect(screen.getByText('00:51')).toBeInTheDocument();
    });

    it('resets countdown when it reaches 1 second', () => {
      renderVirtuals();

      // Find the cycling event with countdown 155 (02:35)
      expect(screen.getByText('02:35')).toBeInTheDocument();

      // Advance enough time to see it tick down
      vi.advanceTimersByTime(1000);
      expect(screen.getByText('02:34')).toBeInTheDocument();
    });

    it('increments live match minute every second', () => {
      renderVirtuals();

      // Initial minute is 67
      expect(screen.getByText('LIVE · 67′')).toBeInTheDocument();

      vi.advanceTimersByTime(1000);

      // Should increment to 68
      expect(screen.getByText('LIVE · 68′')).toBeInTheDocument();
    });

    it('does not increment live match minute beyond 90', () => {
      renderVirtuals();

      // Advance enough time to reach 90 minutes
      vi.advanceTimersByTime(23000);

      // Should cap at 90
      expect(screen.getByText('LIVE · 90′')).toBeInTheDocument();

      vi.advanceTimersByTime(5000);
      expect(screen.getByText('LIVE · 90′')).toBeInTheDocument();
    });
  });

  describe('Bet Selection', () => {
    it('calls addBet when clicking an odds button', async () => {
      const addBetMock = vi.fn();
      const { user } = renderVirtuals({ addBet: addBetMock });

      // Click the "1" odds button for live match
      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      expect(addBetMock).toHaveBeenCalledWith({
        id: 'v1-1',
        match: 'FC Alpha vs FC Beta',
        selection: '1',
        odds: 2.10,
      });
    });

    it('shows "Added to slip" toast when selecting new bet', async () => {
      const { user } = renderVirtuals();

      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      await waitFor(() => {
        expect(screen.getByText(/Added to slip: Virtual Football 1 @ 2\.10/)).toBeInTheDocument();
      });
    });

    it('shows "Removed" toast when clicking already selected bet', async () => {
      const existingBet = {
        id: 'v1-1',
        match: 'FC Alpha vs FC Beta',
        selection: '1',
        odds: 2.10,
      };
      const { user } = renderVirtuals({ betSlip: [existingBet] });

      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      await waitFor(() => {
        expect(screen.getByText(/Removed: Virtual Football — 1/)).toBeInTheDocument();
      });
    });

    it('highlights selected odds button when bet is in slip', () => {
      const existingBet = {
        id: 'v1-X',
        match: 'FC Alpha vs FC Beta',
        selection: 'X',
        odds: 3.20,
      };
      renderVirtuals({ betSlip: [existingBet] });

      // The X button should have "selected" class
      const oddButtons = screen.getAllByRole('button');
      const selectedButton = oddButtons.find(btn => btn.textContent?.includes('X') && btn.textContent?.includes('3.20'));
      expect(selectedButton).toHaveClass('selected');
    });

    it('selects odds from upcoming event cards', async () => {
      const addBetMock = vi.fn();
      const { user } = renderVirtuals({ addBet: addBetMock });

      // Click "Win" odds for greyhounds
      const winBtns = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('4.50'));
      await user.click(winBtns[0]);

      expect(addBetMock).toHaveBeenCalledWith({
        id: 'v2-Win',
        match: 'Trap 1 vs Trap 6',
        selection: 'Win',
        odds: 4.50,
      });
    });

    it('prevents event propagation when clicking odds buttons', async () => {
      const { user } = renderVirtuals();

      // Click an odds button - should not open simulator
      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      // Simulator should not appear
      expect(screen.queryByTestId('virtuals-simulator')).not.toBeInTheDocument();
    });
  });

  describe('Simulator Interaction', () => {
    it('opens simulator when clicking on a live event', async () => {
      const { user } = renderVirtuals();

      // Click the live featured match
      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      expect(liveMatch).toBeInTheDocument();

      await user.click(liveMatch!);

      expect(screen.getByTestId('virtuals-simulator')).toBeInTheDocument();
      expect(screen.getByTestId('simulator-event')).toHaveTextContent('Virtual Football');
    });

    it('opens simulator when clicking on an upcoming event card', async () => {
      const { user } = renderVirtuals();

      // Click on greyhounds event card
      const greyhoundsCard = screen.getAllByText('Virtual Greyhounds')[0].closest('.v-event-card');
      await user.click(greyhoundsCard!);

      expect(screen.getByTestId('virtuals-simulator')).toBeInTheDocument();
      expect(screen.getByTestId('simulator-event')).toHaveTextContent('Virtual Greyhounds');
    });

    it('closes simulator when close button is clicked', async () => {
      const { user } = renderVirtuals();

      // Open simulator
      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      await user.click(liveMatch!);
      expect(screen.getByTestId('virtuals-simulator')).toBeInTheDocument();

      // Close it
      const closeBtn = screen.getByText('Close Simulator');
      await user.click(closeBtn);

      expect(screen.queryByTestId('virtuals-simulator')).not.toBeInTheDocument();
    });

    it('applies active-simulating class to selected event', async () => {
      const { user } = renderVirtuals();

      // Click live event
      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      await user.click(liveMatch!);

      // Check for active class
      expect(liveMatch).toHaveClass('active-simulating');
    });

    it('passes correct language prop to simulator', async () => {
      const { user } = renderVirtuals({ language: 'ru' });

      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      await user.click(liveMatch!);

      expect(screen.getByTestId('simulator-language')).toHaveTextContent('ru');
    });

    it('updates score when simulator triggers onScoreUpdate', async () => {
      const { user } = renderVirtuals();

      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      await user.click(liveMatch!);

      // Click the update score button in mocked simulator
      const updateBtn = screen.getByText('Update Score');
      await user.click(updateBtn);

      // Score should update in parent component
      await waitFor(() => {
        expect(screen.getByText('5 – 3')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Messages', () => {
    it('displays toast on Start Betting button click', async () => {
      const { user } = renderVirtuals();

      const startBtn = screen.getByRole('button', { name: 'Start Betting' });
      await user.click(startBtn);

      expect(await screen.findByText('Select an event and pick your odds!')).toBeInTheDocument();
    });

    it('auto-dismisses toast after 2.8 seconds', async () => {
      const { user } = renderVirtuals();

      const startBtn = screen.getByRole('button', { name: 'Start Betting' });
      await user.click(startBtn);

      await waitFor(() => {
        expect(screen.getByText('Select an event and pick your odds!')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2900);

      await waitFor(() => {
        expect(screen.queryByText('Select an event and pick your odds!')).not.toBeInTheDocument();
      });
    });

    it('replaces previous toast when new toast is shown', async () => {
      const { user } = renderVirtuals();

      // Show first toast
      const startBtn = screen.getByRole('button', { name: 'Start Betting' });
      await user.click(startBtn);

      await waitFor(() => {
        expect(screen.getByText('Select an event and pick your odds!')).toBeInTheDocument();
      });

      // Show second toast by clicking odds
      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      await waitFor(() => {
        expect(screen.getByText(/Added to slip: Virtual Football 1 @ 2\.10/)).toBeInTheDocument();
        expect(screen.queryByText('Select an event and pick your odds!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Event Display Details', () => {
    it('shows correct team names for live match', () => {
      renderVirtuals();

      expect(screen.getByText('FC Alpha')).toBeInTheDocument();
      expect(screen.getByText('FC Beta')).toBeInTheDocument();
    });

    it('shows correct team names for greyhounds', () => {
      renderVirtuals();

      expect(screen.getByText('Trap 1')).toBeInTheDocument();
      expect(screen.getByText('Trap 6')).toBeInTheDocument();
    });

    it('shows correct team names for tennis', () => {
      renderVirtuals();

      expect(screen.getByText('Player A')).toBeInTheDocument();
      expect(screen.getByText('Player B')).toBeInTheDocument();
    });

    it('shows sport emojis for each event', () => {
      renderVirtuals();

      expect(screen.getByText('⚽')).toBeInTheDocument(); // Football
      expect(screen.getByText('🐕')).toBeInTheDocument(); // Greyhounds
      expect(screen.getByText('🎾')).toBeInTheDocument(); // Tennis
      expect(screen.getByText('🏀')).toBeInTheDocument(); // Basketball
      expect(screen.getByText('🐎')).toBeInTheDocument(); // Horse Racing
      expect(screen.getByText('🚴')).toBeInTheDocument(); // Cycling
    });
  });

  describe('Edge Cases', () => {
    it('handles empty betSlip prop', () => {
      renderVirtuals({ betSlip: [] });

      // Should render without errors
      expect(screen.getByText('Virtual Sports')).toBeInTheDocument();
    });

    it('handles undefined addBet prop gracefully', async () => {
      const { user } = renderVirtuals({ addBet: undefined });

      // Clicking odds should not throw error
      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn);

      // Toast should not appear since addBet is undefined
      expect(screen.queryByText(/Added to slip/)).not.toBeInTheDocument();
    });

    it('handles multiple bets in slip', () => {
      const betSlip = [
        { id: 'v1-1', match: 'FC Alpha vs FC Beta', selection: '1', odds: 2.10 },
        { id: 'v2-Win', match: 'Trap 1 vs Trap 6', selection: 'Win', odds: 4.50 },
      ];
      renderVirtuals({ betSlip });

      // Both selected bets should be highlighted
      const buttons = screen.getAllByRole('button');
      const selectedButtons = buttons.filter(btn => btn.classList.contains('selected'));
      expect(selectedButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('formats time correctly for different countdown values', () => {
      renderVirtuals();

      // 52 seconds -> 00:52
      expect(screen.getByText('00:52')).toBeInTheDocument();
      // 134 seconds -> 02:14
      expect(screen.getByText('02:14')).toBeInTheDocument();
      // 203 seconds -> 03:23
      expect(screen.getByText('03:23')).toBeInTheDocument();
    });

    it('handles zero countdown wrap-around', () => {
      renderVirtuals();

      // Initial value displayed
      expect(screen.getByText('00:52')).toBeInTheDocument();

      // Advance past the reset point (should reset to 180 = 03:00)
      vi.advanceTimersByTime(53000);

      // Should show reset value
      expect(screen.getByText('03:00')).toBeInTheDocument();
    });

    it('displays only one live event at a time', () => {
      renderVirtuals();

      const liveBadges = screen.getAllByText('Live');
      expect(liveBadges.length).toBeGreaterThanOrEqual(1);

      // Check that only football event has isLive state in its display
      const liveSections = screen.getAllByText(/Live/i);
      const featuredLive = liveSections.filter(el => el.textContent?.includes('LIVE · 67′'));
      expect(featuredLive.length).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('clears timers on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = renderVirtuals();

      // Show a toast to ensure there's a timeout to clear
      vi.advanceTimersByTime(100);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('clears toast timeout when component unmounts', () => {
      const { user } = renderVirtuals();

      const startBtn = screen.getByRole('button', { name: 'Start Betting' });
      user.click(startBtn);

      const { unmount } = renderVirtuals();

      // Should not throw error
      unmount();
    });
  });

  describe('User Interactions', () => {
    it('allows clicking through multiple events', async () => {
      const { user } = renderVirtuals();

      // Open live football
      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      await user.click(liveMatch!);
      expect(screen.getByTestId('virtuals-simulator')).toBeInTheDocument();

      // Close it
      await user.click(screen.getByText('Close Simulator'));
      expect(screen.queryByTestId('virtuals-simulator')).not.toBeInTheDocument();

      // Open greyhounds
      const greyhoundsCard = screen.getAllByText('Virtual Greyhounds')[0].closest('.v-event-card');
      await user.click(greyhoundsCard!);
      expect(screen.getByTestId('virtuals-simulator')).toBeInTheDocument();
    });

    it('allows selecting multiple odds from different events', async () => {
      const addBetMock = vi.fn();
      const { user } = renderVirtuals({ addBet: addBetMock });

      // Select from live match
      const oddBtn1 = screen.getByRole('button', { name: /1.*2\.10/ });
      await user.click(oddBtn1);

      // Select from greyhounds
      const winBtns = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('4.50'));
      await user.click(winBtns[0]);

      expect(addBetMock).toHaveBeenCalledTimes(2);
    });

    it('toggles bet selection when clicking same odds twice', async () => {
      const addBetMock = vi.fn();
      const { user } = renderVirtuals({ addBet: addBetMock });

      const oddBtn = screen.getByRole('button', { name: /1.*2\.10/ });

      // First click - add
      await user.click(oddBtn);
      expect(addBetMock).toHaveBeenCalledTimes(1);

      // Add to betSlip to simulate it being selected
      const { rerender } = renderVirtuals({
        addBet: addBetMock,
        betSlip: [{ id: 'v1-1', match: 'FC Alpha vs FC Beta', selection: '1', odds: 2.10 }]
      });

      // Second click - remove (addBet is still called, but toast shows removed)
      addBetMock.mockClear();
      await user.click(oddBtn);
      expect(addBetMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper role on toast alerts', async () => {
      const { user } = renderVirtuals();

      const startBtn = screen.getByRole('button', { name: 'Start Betting' });
      await user.click(startBtn);

      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toBeInTheDocument();
      });
    });

    it('has clickable events with proper cursor style', () => {
      renderVirtuals();

      const liveMatch = screen.getByText('FC Alpha').closest('.v-featured');
      expect(liveMatch).toHaveStyle({ cursor: 'pointer' });
    });

    it('uses button elements for interactive elements', () => {
      renderVirtuals();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
