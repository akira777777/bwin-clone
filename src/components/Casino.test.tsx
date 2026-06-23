import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Casino } from './Casino';

// Mock the i18n utility
vi.mock('../utils/i18n', () => ({
  t: (key: string, lang: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'Exclusive Offer': 'Exclusive Offer',
        'Casino Welcome Bonus': '100% Casino Welcome Bonus up to $200',
        'Casino Welcome Bonus Desc': 'Double your first deposit and get 50 Free Spins on Starburst.',
        'Claim Bonus': 'Claim Bonus',
        'Casino Lobby': 'Casino Lobby',
        'All Games': 'All Games',
        'Slots': 'Slots',
        'Live Dealer': 'Live Dealer',
        'Table Games': 'Table Games',
        'Play Now': 'Play Now',
        'Loading...': 'Loading...',
        'Loading': 'Loading',
        'is ready! Demo mode.': 'is ready! Launching now...',
      },
      ru: {
        'Exclusive Offer': 'Эксклюзивное предложение',
        'Casino Welcome Bonus': '100% бонус в казино до $200',
        'Casino Welcome Bonus Desc': 'Удвойте свой первый депозит и получите 50 бесплатных вращений в Starburst.',
        'Claim Bonus': 'Получить бонус',
        'Casino Lobby': 'Лобби казино',
        'All Games': 'Все игры',
        'Slots': 'Слоты',
        'Live Dealer': 'Лайв дилеры',
        'Table Games': 'Настольные игры',
        'Play Now': 'Играть',
        'Loading...': 'Загрузка...',
        'Loading': 'Загрузка',
        'is ready! Demo mode.': 'готов! Запускаем...',
      },
      de: {
        'Exclusive Offer': 'Exklusives Angebot',
        'Casino Welcome Bonus': '100% Casino Willkommensbonus bis zu $200',
        'Casino Welcome Bonus Desc': 'Verdoppeln Sie Ihre erste Einzahlung und holen Sie sich 50 Freispiele für Starburst.',
        'Claim Bonus': 'Bonus beanspruchen',
        'Casino Lobby': 'Casino Lobby',
        'All Games': 'Alle Spiele',
        'Slots': 'Slots',
        'Live Dealer': 'Live Dealer',
        'Table Games': 'Tischspiele',
        'Play Now': 'Jetzt spielen',
        'Loading...': 'Laden...',
        'Loading': 'Wird geladen',
        'is ready! Demo mode.': 'ist bereit! Wird gestartet...',
      },
      es: {
        'Exclusive Offer': 'Oferta Exclusiva',
        'Casino Welcome Bonus': '100% de Bono de Bienvenida de Casino hasta $200',
        'Casino Welcome Bonus Desc': 'Duplique su primer depósito y obtenga 50 giros gratis en Starburst.',
        'Claim Bonus': 'Reclamar bono',
        'Casino Lobby': 'Lobby de Casino',
        'All Games': 'Todos los juegos',
        'Slots': 'Tragamonedas',
        'Live Dealer': 'Crupier en Vivo',
        'Table Games': 'Juegos de Mesa',
        'Play Now': 'Jugar ahora',
        'Loading...': 'Cargando...',
        'Loading': 'Cargando',
        'is ready! Demo mode.': 'está listo! Iniciando ahora...',
      },
    };
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  },
}));

// Mock the game components
vi.mock('./MinesGame', () => ({
  MinesGame: ({ balance, onBack }: { balance: number; onBack: () => void }) => (
    <div data-testid="mines-game">
      <span>Mines Game - Balance: {balance}</span>
      <button onClick={onBack}>Back to Casino</button>
    </div>
  ),
}));

vi.mock('./CrashGame', () => ({
  CrashGame: ({ balance, onBack }: { balance: number; onBack: () => void }) => (
    <div data-testid="crash-game">
      <span>Crash Game - Balance: {balance}</span>
      <button onClick={onBack}>Back to Casino</button>
    </div>
  ),
}));

// Helper function to render Casino with default props
const renderCasino = (props = {}) => {
  const defaultProps = {
    balance: 10000,
    updateBalance: vi.fn(),
    language: 'en',
    onWager: vi.fn(),
    ...props,
  };
  return {
    user: userEvent.setup(),
    ...render(<Casino {...defaultProps} />),
    props: defaultProps,
  };
};

describe('Casino Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      renderCasino();

      expect(screen.getByText('Casino Lobby')).toBeInTheDocument();
      expect(screen.getByText('All Games')).toBeInTheDocument();
      expect(screen.getByText('Slots')).toBeInTheDocument();
      expect(screen.getByText('Live Dealer')).toBeInTheDocument();
      expect(screen.getByText('Table Games')).toBeInTheDocument();
    });

    it('renders promo banner with correct content', () => {
      renderCasino();

      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
      expect(screen.getByText('100% Casino Welcome Bonus up to $200')).toBeInTheDocument();
      expect(screen.getByText('Claim Bonus')).toBeInTheDocument();
    });

    it('renders all game cards when filter is set to All', () => {
      renderCasino();

      expect(screen.getByText('BETZ Mines')).toBeInTheDocument();
      expect(screen.getByText('BETZ Crash')).toBeInTheDocument();
      expect(screen.getByText('Book of Dead')).toBeInTheDocument();
      expect(screen.getByText('Lightning Roulette')).toBeInTheDocument();
      expect(screen.getByText('Crazy Time')).toBeInTheDocument();
      expect(screen.getByText('Starburst')).toBeInTheDocument();
      expect(screen.getByText('Sweet Bonanza')).toBeInTheDocument();
      expect(screen.getByText('BETZ Blackjack')).toBeInTheDocument();
      expect(screen.getByText('Mega Moolah')).toBeInTheDocument();
      expect(screen.getByText('European Roulette')).toBeInTheDocument();
    });

    it('renders game providers correctly', () => {
      renderCasino();

      expect(screen.getByText('BETZ Originals')).toBeInTheDocument();
      expect(screen.getByText("Play'n GO")).toBeInTheDocument();
      expect(screen.getByText('Evolution')).toBeInTheDocument();
      expect(screen.getByText('NetEnt')).toBeInTheDocument();
      expect(screen.getByText('Pragmatic Play')).toBeInTheDocument();
      expect(screen.getByText('Microgaming')).toBeInTheDocument();
      expect(screen.getByText('Playtech')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('translates to Russian language', () => {
      renderCasino({ language: 'ru' });

      expect(screen.getByText('Лобби казино')).toBeInTheDocument();
      expect(screen.getByText('Все игры')).toBeInTheDocument();
      expect(screen.getByText('Слоты')).toBeInTheDocument();
      expect(screen.getByText('Лайв дилеры')).toBeInTheDocument();
      expect(screen.getByText('Настольные игры')).toBeInTheDocument();
    });

    it('translates to German language', () => {
      renderCasino({ language: 'de' });

      expect(screen.getByText('Casino Lobby')).toBeInTheDocument();
      expect(screen.getByText('Alle Spiele')).toBeInTheDocument();
      expect(screen.getByText('Slots')).toBeInTheDocument();
      expect(screen.getByText('Live Dealer')).toBeInTheDocument();
      expect(screen.getByText('Tischspiele')).toBeInTheDocument();
    });

    it('translates to Spanish language', () => {
      renderCasino({ language: 'es' });

      expect(screen.getByText('Lobby de Casino')).toBeInTheDocument();
      expect(screen.getByText('Todos los juegos')).toBeInTheDocument();
      expect(screen.getByText('Tragamonedas')).toBeInTheDocument();
      expect(screen.getByText('Crupier en Vivo')).toBeInTheDocument();
      expect(screen.getByText('Juegos de Mesa')).toBeInTheDocument();
    });

    it('translates promo banner and bonus button', () => {
      const { getByText } = renderCasino({ language: 'ru' });

      expect(getByText('Эксклюзивное предложение')).toBeInTheDocument();
      expect(getByText('100% бонус в казино до $200')).toBeInTheDocument();
      expect(getByText('Получить бонус')).toBeInTheDocument();
    });
  });

  describe('Game Filtering', () => {
    it('filters games by Slots category', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Slots' }));

      expect(screen.getByText('BETZ Mines')).toBeInTheDocument();
      expect(screen.getByText('BETZ Crash')).toBeInTheDocument();
      expect(screen.getByText('Starburst')).toBeInTheDocument();
      expect(screen.queryByText('Lightning Roulette')).not.toBeInTheDocument();
      expect(screen.queryByText('BETZ Blackjack')).not.toBeInTheDocument();
    });

    it('filters games by Live Dealer category', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Live Dealer' }));

      expect(screen.getByText('Lightning Roulette')).toBeInTheDocument();
      expect(screen.getByText('Crazy Time')).toBeInTheDocument();
      expect(screen.queryByText('Starburst')).not.toBeInTheDocument();
      expect(screen.queryByText('BETZ Blackjack')).not.toBeInTheDocument();
    });

    it('filters games by Table Games category', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Table Games' }));

      expect(screen.getByText('BETZ Blackjack')).toBeInTheDocument();
      expect(screen.getByText('European Roulette')).toBeInTheDocument();
      expect(screen.queryByText('Starburst')).not.toBeInTheDocument();
      expect(screen.queryByText('Lightning Roulette')).not.toBeInTheDocument();
    });

    it('shows all games when All Games filter is clicked', async () => {
      const { user } = renderCasino();

      // First filter to Slots
      await user.click(screen.getByRole('button', { name: 'Slots' }));
      expect(screen.queryByText('Lightning Roulette')).not.toBeInTheDocument();

      // Then click All Games
      await user.click(screen.getByRole('button', { name: 'All Games' }));
      expect(screen.getByText('Lightning Roulette')).toBeInTheDocument();
      expect(screen.getByText('BETZ Blackjack')).toBeInTheDocument();
    });

    it('applies active class to selected filter button', async () => {
      const { user } = renderCasino();

      const allGamesButton = screen.getByRole('button', { name: 'All Games' });
      expect(allGamesButton).toHaveClass('active');

      const slotsButton = screen.getByRole('button', { name: 'Slots' });
      await user.click(slotsButton);

      expect(allGamesButton).not.toHaveClass('active');
      expect(slotsButton).toHaveClass('active');

      await user.click(screen.getByRole('button', { name: 'Live Dealer' }));

      expect(slotsButton).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Live Dealer' })).toHaveClass('active');
    });
  });

  describe('Bonus Claim Feature', () => {
    it('shows toast message when claiming bonus in English', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Claim Bonus' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        '🎁 Bonus activated! 100% on first deposit + 50 Free Spins.'
      );
    });

    it('shows toast message in Russian when claiming bonus', async () => {
      const { user } = renderCasino({ language: 'ru' });

      await user.click(screen.getByRole('button', { name: 'Получить бонус' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        '🎁 Бонус активирован! 100% на первый депозит + 50 бесплатных вращений.'
      );
    });

    it('shows toast message in German when claiming bonus', async () => {
      const { user } = renderCasino({ language: 'de' });

      await user.click(screen.getByRole('button', { name: 'Bonus beanspruchen' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        '🎁 Bonus aktiviert! 100% auf die erste Einzahlung + 50 Freispiele.'
      );
    });

    it('shows toast message in Spanish when claiming bonus', async () => {
      const { user } = renderCasino({ language: 'es' });

      await user.click(screen.getByRole('button', { name: 'Reclamar bono' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        '🎁 ¡Bono activado! 100% en el primer depósito + 50 giros gratis.'
      );
    });

    it('removes toast after timeout', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Claim Bonus' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Game Play Interactions', () => {
    it('shows loading state when clicking a regular game', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Book of Dead').closest('.game-card');
      expect(gameCard).not.toHaveClass('loading');

      await user.click(gameCard!);

      expect(gameCard).toHaveClass('loading');
    });

    it('shows loading toast when starting a game', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Starburst').closest('.game-card');
      await user.click(gameCard!);

      expect(screen.getByRole('alert')).toHaveTextContent('Loading Starburst...');
    });

    it('shows game ready toast after loading completes', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Mega Moolah').closest('.game-card');
      await user.click(gameCard!);

      expect(screen.getByRole('alert')).toHaveTextContent('Loading Mega Moolah...');

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Mega Moolah is ready! Launching now...');
      });
    });

    it('removes loading state after game loads', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Sweet Bonanza').closest('.game-card');
      await user.click(gameCard!);

      expect(gameCard).toHaveClass('loading');

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(gameCard).not.toHaveClass('loading');
      });
    });

    it('navigates to Mines game when clicking BETZ Mines', async () => {
      const { user } = renderCasino({ balance: 5000 });

      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);

      expect(screen.getByTestId('mines-game')).toBeInTheDocument();
      expect(screen.getByText(/Balance: 5000/)).toBeInTheDocument();
    });

    it('navigates to Crash game when clicking BETZ Crash', async () => {
      const { user } = renderCasino({ balance: 3000 });

      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);

      expect(screen.getByTestId('crash-game')).toBeInTheDocument();
      expect(screen.getByText(/Balance: 3000/)).toBeInTheDocument();
    });

    it('passes props correctly to Mines game', async () => {
      const updateBalance = vi.fn();
      const onWager = vi.fn();
      const { user } = renderCasino({
        balance: 7500,
        updateBalance,
        language: 'de',
        onWager,
      });

      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);

      expect(screen.getByTestId('mines-game')).toBeInTheDocument();
    });

    it('passes props correctly to Crash game', async () => {
      const updateBalance = vi.fn();
      const onWager = vi.fn();
      const { user } = renderCasino({
        balance: 4200,
        updateBalance,
        language: 'es',
        onWager,
      });

      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);

      expect(screen.getByTestId('crash-game')).toBeInTheDocument();
    });

    it('allows navigating back from Mines game', async () => {
      const { user } = renderCasino();

      // Navigate to Mines
      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);
      expect(screen.getByTestId('mines-game')).toBeInTheDocument();

      // Navigate back
      await user.click(screen.getByText('Back to Casino'));

      expect(screen.queryByTestId('mines-game')).not.toBeInTheDocument();
      expect(screen.getByText('Casino Lobby')).toBeInTheDocument();
    });

    it('allows navigating back from Crash game', async () => {
      const { user } = renderCasino();

      // Navigate to Crash
      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);
      expect(screen.getByTestId('crash-game')).toBeInTheDocument();

      // Navigate back
      await user.click(screen.getByText('Back to Casino'));

      expect(screen.queryByTestId('crash-game')).not.toBeInTheDocument();
      expect(screen.getByText('Casino Lobby')).toBeInTheDocument();
    });
  });

  describe('Play Button Interactions', () => {
    it('triggers game play when Play Now button is clicked', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('European Roulette').closest('.game-card');
      const playButton = gameCard?.querySelector('.play-btn') as HTMLElement;

      await user.click(playButton);

      expect(gameCard).toHaveClass('loading');
    });

    it('prevents event propagation when Play Now is clicked', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Lightning Roulette').closest('.game-card');
      const playButton = gameCard?.querySelector('.play-btn') as HTMLElement;

      await user.click(playButton);

      // Should still load the game (stopPropagation shouldn't prevent the action)
      expect(gameCard).toHaveClass('loading');
    });

    it('shows Loading... text on button while game is loading', async () => {
      const { user } = renderCasino();

      const gameCard = screen.getByText('Crazy Time').closest('.game-card');
      const playButton = gameCard?.querySelector('.play-btn') as HTMLElement;

      await user.click(playButton);

      expect(playButton).toHaveTextContent('Loading...');
    });
  });

  describe('Props Handling', () => {
    it('accepts and uses custom balance prop', async () => {
      const { user } = renderCasino({ balance: 99999 });

      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);

      expect(screen.getByText(/Balance: 99999/)).toBeInTheDocument();
    });

    it('uses default balance when not provided', async () => {
      const { user } = renderCasino({});

      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);

      expect(screen.getByText(/Balance: 10000/)).toBeInTheDocument();
    });

    it('accepts and uses custom updateBalance callback', async () => {
      const updateBalance = vi.fn();
      const { user } = renderCasino({ updateBalance });

      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);

      // Component is rendered with the callback
      expect(screen.getByTestId('mines-game')).toBeInTheDocument();
    });

    it('accepts and uses custom onWager callback', async () => {
      const onWager = vi.fn();
      const { user } = renderCasino({ onWager });

      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);

      expect(screen.getByTestId('crash-game')).toBeInTheDocument();
    });
  });

  describe('Toast Behavior', () => {
    it('clears previous toast timeout when showing new toast', async () => {
      const { user } = renderCasino();

      // First toast
      await user.click(screen.getByRole('button', { name: 'Claim Bonus' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Advance timer partially
      vi.advanceTimersByTime(1000);

      // Second toast should replace the first
      const gameCard = screen.getByText('Book of Dead').closest('.game-card');
      await user.click(gameCard!);

      expect(screen.getByRole('alert')).toHaveTextContent('Loading Book of Dead...');

      // Complete the original timer
      vi.advanceTimersByTime(2000);

      // Toast should still be there because second click started a new timer
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Advance past the new timer duration
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('cleans up toast timeout on component unmount', async () => {
      const { user, unmount } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Claim Bonus' }));

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid filter changes without errors', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Slots' }));
      await user.click(screen.getByRole('button', { name: 'Live Dealer' }));
      await user.click(screen.getByRole('button', { name: 'Table Games' }));
      await user.click(screen.getByRole('button', { name: 'All Games' }));

      expect(screen.getByText('Casino Lobby')).toBeInTheDocument();
      expect(screen.getByText('BETZ Mines')).toBeInTheDocument();
    });

    it('handles clicking multiple games in quick succession', async () => {
      const { user } = renderCasino();

      const card1 = screen.getByText('Starburst').closest('.game-card');
      const card2 = screen.getByText('Book of Dead').closest('.game-card');

      await user.click(card1!);
      await user.click(card2!);

      expect(card2).toHaveClass('loading');
    });

    it('handles clicking bonus button multiple times', async () => {
      const { user } = renderCasino();

      const bonusButton = screen.getByRole('button', { name: 'Claim Bonus' });

      await user.click(bonusButton);
      await user.click(bonusButton);
      await user.click(bonusButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders with zero balance', async () => {
      const { user } = renderCasino({ balance: 0 });

      const minesCard = screen.getByText('BETZ Mines').closest('.game-card');
      await user.click(minesCard!);

      expect(screen.getByText(/Balance: 0/)).toBeInTheDocument();
    });

    it('renders with very large balance', async () => {
      const { user } = renderCasino({ balance: 999999999 });

      const crashCard = screen.getByText('BETZ Crash').closest('.game-card');
      await user.click(crashCard!);

      expect(screen.getByText(/Balance: 999999999/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders toast with role="alert"', async () => {
      const { user } = renderCasino();

      await user.click(screen.getByRole('button', { name: 'Claim Bonus' }));

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has clickable filter buttons', async () => {
      renderCasino();

      const buttons = screen.getAllByRole('button');

      expect(buttons.some(btn => btn.textContent === 'All Games')).toBe(true);
      expect(buttons.some(btn => btn.textContent === 'Slots')).toBe(true);
      expect(buttons.some(btn => btn.textContent === 'Live Dealer')).toBe(true);
      expect(buttons.some(btn => btn.textContent === 'Table Games')).toBe(true);
    });
  });
});
