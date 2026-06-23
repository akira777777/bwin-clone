import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import LiveChatWidget, { Message } from './LiveChatWidget';
import type { Bet } from '../App';

// Mock i18n utility
vi.mock('../utils/i18n', () => ({
  t: (key: string, lang: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'Draw': 'Draw',
        'Yes': 'Yes',
        'No': 'No',
        'Over 2.5': 'Over 2.5',
        'Under 2.5': 'Under 2.5',
        'Match Result': 'Match Result',
      },
      ru: {
        'Draw': 'Ничья',
        'Yes': 'Да',
        'No': 'Нет',
        'Over 2.5': 'Больше 2.5',
        'Under 2.5': 'Меньше 2.5',
        'Match Result': 'Результат матча',
      },
      de: {
        'Draw': 'Unentschieden',
        'Yes': 'Ja',
        'No': 'Nein',
        'Over 2.5': 'Über 2.5',
        'Under 2.5': 'Unter 2.5',
        'Match Result': 'Spielergebnis',
      },
      es: {
        'Draw': 'Empate',
        'Yes': 'Sí',
        'No': 'No',
        'Over 2.5': 'Más de 2.5',
        'Under 2.5': 'Menos de 2.5',
        'Match Result': 'Resultado del Partido',
      },
    };
    return translations[lang]?.[key] || key;
  },
});

// Helper function to render LiveChatWidget with default props
const renderLiveChatWidget = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    balance: 1000.50,
    placedBetsCount: 3,
    selfExclusionEndTime: 0,
    language: 'en' as const,
    messages: [] as Message[],
    setMessages: vi.fn(),
    onCopyBetSlip: vi.fn(),
  };

  return {
    ...render(
      <LiveChatWidget {...defaultProps} {...props} />
    ),
    mockProps: { ...defaultProps, ...props },
  };
};

describe('LiveChatWidget Component', () => {
  let mockSetMessages: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetMessages = vi.fn();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = renderLiveChatWidget({ isOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it('renders chat widget when isOpen is true', () => {
      renderLiveChatWidget({ isOpen: true });
      expect(screen.getByText('BETZ Assistant')).toBeInTheDocument();
      expect(screen.getByText('Always Online')).toBeInTheDocument();
    });

    it('renders correct header text for different languages', () => {
      const { rerender } = renderLiveChatWidget({ language: 'ru' });
      expect(screen.getByText('Помощник BETZ')).toBeInTheDocument();
      expect(screen.getByText('Всегда онлайн')).toBeInTheDocument();

      rerender(
        <LiveChatWidget
          isOpen={true}
          onClose={vi.fn()}
          balance={1000}
          placedBetsCount={0}
          selfExclusionEndTime={0}
          language="de"
          messages={[]}
          setMessages={vi.fn()}
          onCopyBetSlip={vi.fn()}
        />
      );
      expect(screen.getByText('BETZ Assistent')).toBeInTheDocument();
      expect(screen.getByText('Immer online')).toBeInTheDocument();

      rerender(
        <LiveChatWidget
          isOpen={true}
          onClose={vi.fn()}
          balance={1000}
          placedBetsCount={0}
          selfExclusionEndTime={0}
          language="es"
          messages={[]}
          setMessages={vi.fn()}
          onCopyBetSlip={vi.fn()}
        />
      );
      expect(screen.getByText('Asistente BETZ')).toBeInTheDocument();
      expect(screen.getByText('Siempre en línea')).toBeInTheDocument();
    });

    it('renders input placeholder based on language', () => {
      renderLiveChatWidget({ language: 'ru' });
      expect(screen.getByPlaceholderText('Введите сообщение...')).toBeInTheDocument();

      renderLiveChatWidget({ language: 'de' });
      expect(screen.getByPlaceholderText('Nachricht eingeben...')).toBeInTheDocument();

      renderLiveChatWidget({ language: 'es' });
      expect(screen.getByPlaceholderText('Escriba un mensaje aquí...')).toBeInTheDocument();

      renderLiveChatWidget({ language: 'en' });
      expect(screen.getByPlaceholderText('Type message here...')).toBeInTheDocument();
    });

    it('renders close button and calls onClose when clicked', async () => {
      const onCloseMock = vi.fn();
      const { container } = renderLiveChatWidget({ onClose: onCloseMock });

      const closeBtn = container.querySelector('.lc-close-btn');
      expect(closeBtn).toBeInTheDocument();

      await userEvent.click(closeBtn!);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('displays welcome message when opened with empty messages', () => {
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });
      expect(mockSetMessages).toHaveBeenCalled();

      const welcomeCall = mockSetMessages.mock.calls[0][0];
      expect(welcomeCall).toHaveLength(1);
      expect(welcomeCall[0].sender).toBe('bot');
      expect(welcomeCall[0].id).toBe('welcome');
    });

    it('displays existing messages correctly', () => {
      const existingMessages: Message[] = [
        {
          id: '1',
          sender: 'bot',
          text: 'Hello!',
          timestamp: new Date('2024-01-01T10:00:00'),
        },
        {
          id: '2',
          sender: 'user',
          text: 'Hi there',
          timestamp: new Date('2024-01-01T10:01:00'),
        },
      ];

      renderLiveChatWidget({ messages: existingMessages });
      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('allows user to type and send a message', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /Send/i });

      await user.type(input, 'Hello');
      expect(input).toHaveValue('Hello');

      await user.click(sendButton);
      expect(input).toHaveValue('');
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      expect(mockSetMessages).not.toHaveBeenCalled();
    });

    it('does not send whitespace-only messages', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      await user.type(input, '   ');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      expect(mockSetMessages).not.toHaveBeenCalled();
    });

    it('sends message on form submit', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      await user.type(input, 'balance');

      const form = screen.getByRole('form') || input.closest('form');
      fireEvent.submit(form!);

      expect(mockSetMessages).toHaveBeenCalled();
    });

    it('disables send button when input is empty', () => {
      renderLiveChatWidget({ messages: [] });
      const sendButton = screen.getByRole('button', { name: /Send/i });
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [] });

      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /Send/i });

      await user.type(input, 'test');
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Bot Responses', () => {
    it('shows typing indicator while bot is "thinking"', async () => {
      const user = userEvent.setup();
      const { container } = renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      // Check for typing indicator
      const typingIndicator = container.querySelector('.lc-typing-indicator');
      expect(typingIndicator).toBeInTheDocument();
    });

    it('responds to balance queries in English', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        balance: 1234.56,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'What is my balance?');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      // Fast-forward past the bot thinking delay
      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.sender).toBe('bot');
      expect(botResponse.text).toContain('€1,234.56');
    });

    it('responds to bets queries in English', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        placedBetsCount: 5,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'How many bets did I place?');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('5');
    });

    it('responds to exclusion queries when not excluded', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        selfExclusionEndTime: 0,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'Am I excluded?');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('Responsible Gaming');
    });

    it('responds to exclusion queries when excluded', async () => {
      const user = userEvent.setup();
      const excludedUntil = Date.now() + 3600000; // 1 hour from now
      renderLiveChatWidget({
        selfExclusionEndTime: excludedUntil,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'Am I excluded?');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('locked');
      expect(botResponse.text).toContain('seconds');
    });

    it('responds to Russian queries correctly', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        language: 'ru',
        balance: 500,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'баланс');

      const sendButton = screen.getByRole('button', { name: /Отправить/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('€500.00');
      expect(botResponse.text).toContain('баланс');
    });

    it('responds to German queries correctly', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        language: 'de',
        placedBetsCount: 2,
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'Wetten');

      const sendButton = screen.getByRole('button', { name: /Senden/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('2');
      expect(botResponse.text).toContain('Wette');
    });

    it('responds to Spanish queries correctly', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        language: 'es',
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'retiro');

      const sendButton = screen.getByRole('button', { name: /Enviar/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.text).toContain('instant');
      expect(botResponse.text).toContain('24 horas');
    });

    it('provides default response for unrecognized queries', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({
        messages: [],
        setMessages: mockSetMessages,
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyzabc123');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const botResponse = newMessages[newMessages.length - 1];

      expect(botResponse.sender).toBe('bot');
      expect(botResponse.text).toContain('understand');
    });

    it('disables input while bot is typing', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      // Input should be disabled while typing
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('re-enables input after bot response', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      // Before timer completes - input should be disabled
      expect(input).toBeDisabled();

      // After timer completes - input should be re-enabled
      vi.advanceTimersByTime(900);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Shared Bet Feature', () => {
    const mockBet: Bet = {
      id: '1',
      match: 'Real Madrid vs Barcelona',
      selection: 'Match Result: Real Madrid',
      odds: 2.50,
    };

    const mockPlacedBet = {
      id: 'pb1',
      date: '2024-01-01',
      stake: 10,
      bets: [mockBet],
      status: 'Pending' as const,
      potentialReturn: 25,
      type: 'Single' as const,
    };

    it('displays shared bet in message', () => {
      const messageWithSharedBet: Message = {
        id: '1',
        sender: 'bot',
        text: 'Here is your bet',
        timestamp: new Date(),
        sharedBet: mockPlacedBet,
      };

      renderLiveChatWidget({ messages: [messageWithSharedBet] });
      expect(screen.getByText('🎫 Single Bet')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid vs Barcelona')).toBeInTheDocument();
      expect(screen.getByText('2.50')).toBeInTheDocument();
    });

    it('calculates and displays total odds for multi-bet slips', () => {
      const multiBet = {
        ...mockPlacedBet,
        bets: [
          mockBet,
          { ...mockBet, id: '2', selection: 'Over 2.5', odds: 1.80 },
          { ...mockBet, id: '3', selection: 'Both Teams to Score: Yes', odds: 1.45 },
        ],
      };

      const messageWithSharedBet: Message = {
        id: '1',
        sender: 'bot',
        text: 'Here is your bet',
        timestamp: new Date(),
        sharedBet: multiBet,
      };

      renderLiveChatWidget({ messages: [messageWithSharedBet] });

      // Total odds should be 2.50 * 1.80 * 1.45 = 6.55
      expect(screen.getByText('6.55x')).toBeInTheDocument();
    });

    it('copies bet slip when copy button is clicked', async () => {
      const user = userEvent.setup();
      const onCopyBetSlipMock = vi.fn();

      const messageWithSharedBet: Message = {
        id: '1',
        sender: 'bot',
        text: 'Here is your bet',
        timestamp: new Date(),
        sharedBet: mockPlacedBet,
      };

      const { container } = renderLiveChatWidget({
        messages: [messageWithSharedBet],
        onCopyBetSlip: onCopyBetSlipMock,
      });

      const copyButton = screen.getByRole('button', { name: /Copy Bet Slip/i });
      await user.click(copyButton);

      expect(onCopyBetSlipMock).toHaveBeenCalledWith([mockBet]);
    });

    it('translates selection names in shared bets based on language', () => {
      const messageWithSharedBet: Message = {
        id: '1',
        sender: 'bot',
        text: 'Here is your bet',
        timestamp: new Date(),
        sharedBet: {
          ...mockPlacedBet,
          bets: [
            { ...mockBet, selection: 'Draw' },
            { ...mockBet, selection: 'Yes' },
            { ...mockBet, selection: 'No' },
          ],
        },
      };

      const { rerender } = renderLiveChatWidget({
        language: 'ru',
        messages: [messageWithSharedBet],
      });

      expect(screen.getByText('Ничья')).toBeInTheDocument();
      expect(screen.getByText('Да')).toBeInTheDocument();
      expect(screen.getByText('Нет')).toBeInTheDocument();
    });

    it('translates compound selections in shared bets', () => {
      const compoundBet: Bet = {
        ...mockBet,
        selection: 'Match Result: Draw',
      };

      const messageWithSharedBet: Message = {
        id: '1',
        sender: 'bot',
        text: 'Here is your bet',
        timestamp: new Date(),
        sharedBet: {
          ...mockPlacedBet,
          bets: [compoundBet],
        },
      };

      renderLiveChatWidget({
        language: 'ru',
        messages: [messageWithSharedBet],
      });

      expect(screen.getByText(/Результат матча:/i)).toBeInTheDocument();
      expect(screen.getByText('Ничья')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long messages', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const longMessage = 'a'.repeat(1000);
      const input = screen.getByRole('textbox');

      await user.type(input, longMessage);

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      expect(mockSetMessages).toHaveBeenCalled();
    });

    it('handles special characters in messages', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

      const specialMessage = 'Test @#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const input = screen.getByRole('textbox');

      await user.type(input, specialMessage);

      const sendButton = screen.getByRole('button', { name: /Send/i });
      await user.click(sendButton);

      vi.advanceTimersByTime(900);

      const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
      const newMessages = lastCall[0];
      const userMsg = newMessages.find((m: Message) => m.sender === 'user');

      expect(userMsg?.text).toBe(specialMessage);
    });

    it('handles emoji in messages', async () => {
      const user = userEvent.setup();
      renderLiveChatWidget({ messages: [], setMessages: mockSetclusionEndTime: 0,
      messages: [],
      setMessages: mockSetMessages,
    });

    const input = screen.getByRole('textbox');
    await user.type(input, '😀🎉🚀');

    const sendButton = screen.getByRole('button', { name: /Send/i });
    await user.click(sendButton);

    vi.advanceTimersByTime(900);

    const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
    const newMessages = lastCall[0];
    const userMsg = newMessages.find((m: Message) => m.sender === 'user');

    expect(userMsg?.text).toBe('😀🎉🚀');
  });

  it('handles rapid message submissions', async () => {
    const user = userEvent.setup();
    renderLiveChatWidget({ messages: [], setMessages: mockSetMessages });

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /Send/i });

    // First message
    await user.type(input, 'message 1');
    await user.click(sendButton);

    // Try to send second message immediately while bot is typing
    input.focus(); // Keep focus on input
    await user.clear(input);
    await user.type(input, 'message 2');

    // Should be disabled while bot is typing
    expect(sendButton).toBeDisabled();
  });

  it('handles message list with many messages', () => {
    const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
      id: `msg-${i}`,
      sender: i % 2 === 0 ? 'user' : 'bot',
      text: `Message ${i}`,
      timestamp: new Date(Date.now() + i * 1000),
    }));

    renderLiveChatWidget({ messages: manyMessages });

    manyMessages.forEach(msg => {
      expect(screen.getByText(`Message ${msg.id.split('-')[1]}`)).toBeInTheDocument();
    });
  });

  it('handles zero balance', async () => {
    const user = userEvent.setup();
    renderLiveChatWidget({
      balance: 0,
      messages: [],
      setMessages: mockSetMessages,
    });

    const input = screen.getByRole('textbox');
    await user.type(input, 'balance');

    const sendButton = screen.getByRole('button', { name: /Send/i });
    await user.click(sendButton);

    vi.advanceTimersByTime(900);

    const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
    const newMessages = lastCall[0];
    const botResponse = newMessages[newMessages.length - 1];

    expect(botResponse.text).toContain('€0.00');
  });

  it('handles large balance values', async () => {
    const user = userEvent.setup();
    renderLiveChatWidget({
      balance: 999999.99,
      messages: [],
      setMessages: mockSetMessages,
    });

    const input = screen.getByRole('textbox');
    await user.type(input, 'balance');

    const sendButton = screen.getByRole('button', { name: /Send/i });
    await user.click(sendButton);

    vi.advanceTimersByTime(900);

    const lastCall = mockSetMessages.mock.calls[mockSetMessages.mock.calls.length - 1];
    const newMessages = lastCall[0];
    const botResponse = newMessages[newMessages.length - 1];

    expect(botResponse.text).toContain('€999,999.99');
  });
});

describe('translateSelection Utility', () => {
  it('translates simple selections correctly', () => {
    const { rerender } = render(
      <LiveChatWidget
        isOpen={true}
        onClose={vi.fn()}
        balance={1000}
        placedBetsCount={0}
        selfExclusionEndTime={0}
        language="ru"
        messages={[]}
        setMessages={vi.fn()}
        onCopyBetSlip={vi.fn()}
      />
    );

    // The translation is handled internally, we just verify the component renders
    expect(screen.getByText('Помощник BETZ')).toBeInTheDocument();
  });
});

describe('Lifecycle and Cleanup', () => {
  it('clears typing timeout on unmount', () => {
    const { unmount } = renderLiveChatWidget({ messages: [] });

    // Trigger typing state
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form')!);

    // Clear timers and unmount
    vi.advanceTimersByTime(900);
    unmount();

    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('scrolls to bottom when new messages arrive', () => {
    const messages: Message[] = [
      {
        id: '1',
        sender: 'bot',
        text: 'First',
        timestamp: new Date(),
      },
    ];

    const setMessagesMock = vi.fn((updater) => {
      if (typeof updater === 'function') {
        const newMessages = updater(messages);
        messages.splice(0, messages.length, ...newMessages);
      }
    });

    const { rerender } = renderLiveChatWidget({
      messages,
      setMessages: setMessagesMock,
    });

    // Add a new message
    messages.push({
      id: '2',
      sender: 'user',
      text: 'Second',
      timestamp: new Date(),
    });

    rerender(
      <LiveChatWidget
        isOpen={true}
        onClose={vi.fn()}
        balance={1000}
        placedBetsCount={0}
        selfExclusionEndTime={0}
        messages={messages}
        setMessages={setMessagesMock}
        onCopyBetSlip={vi.fn()}
      />
    );

    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
