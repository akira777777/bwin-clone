import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FooterModal from './FooterModal';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for GDPR export
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Helper function to render FooterModal with default props
const renderFooterModal = (props = {}) => {
  const defaultProps = {
    tab: 'About Us',
    onClose: vi.fn(),
    balance: 1000,
    placedBetsCount: 5,
    depositLimit: 500,
    setDepositLimit: vi.fn(),
    selfExclusionEndTime: 0,
    setSelfExclusionEndTime: vi.fn(),
    onStartLiveChat: vi.fn(),
    triggerToast: vi.fn(),
    language: 'en',
    ...props,
  };

  return render(<FooterModal {...defaultProps} />);
};

describe('FooterModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when tab is null', () => {
      const { container } = render(<FooterModal tab={null} onClose={vi.fn()} balance={0} placedBetsCount={0} depositLimit={0} setDepositLimit={vi.fn()} selfExclusionEndTime={0} setSelfExclusionEndTime={vi.fn()} onStartLiveChat={vi.fn()} triggerToast={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render the modal when tab is provided', () => {
      renderFooterModal();
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('should render the correct tab title for About Us', () => {
      renderFooterModal({ tab: 'About Us' });
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('should render localized title for Russian language', () => {
      renderFooterModal({ tab: 'About Us', language: 'ru' });
      expect(screen.getByText('О нас')).toBeInTheDocument();
    });

    it('should render localized title for German language', () => {
      renderFooterModal({ tab: 'Responsible Gaming', language: 'de' });
      expect(screen.getByText('Verantwortungsbewusstes Spielen')).toBeInTheDocument();
    });

    it('should render localized title for Spanish language', () => {
      renderFooterModal({ tab: 'Privacy Policy', language: 'es' });
      expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
    });
  });

  describe('About Us Tab', () => {
    it('should render About Us content in English', () => {
      renderFooterModal({ tab: 'About Us', language: 'en' });
      expect(screen.getByText(/BETZ is a premier global sports betting brand/)).toBeInTheDocument();
      expect(screen.getByText('1997')).toBeInTheDocument();
      expect(screen.getByText('20M+')).toBeInTheDocument();
      expect(screen.getByText('100+')).toBeInTheDocument();
      expect(screen.getByText('Entain')).toBeInTheDocument();
    });

    it('should render About Us content in Russian', () => {
      renderFooterModal({ tab: 'About Us', language: 'ru' });
      expect(screen.getByText(/BETZ — это ведущий мировой бренд ставок на спорт/)).toBeInTheDocument();
      expect(screen.getByText('Основан')).toBeInTheDocument();
      expect(screen.getByText('Пользователей')).toBeInTheDocument();
    });
  });

  describe('Terms and Conditions Tab', () => {
    it('should render Terms and Conditions content', () => {
      renderFooterModal({ tab: 'Terms and Conditions' });
      expect(screen.getByText('Account Registration')).toBeInTheDocument();
      expect(screen.getByText('Betting Rules & Odds')).toBeInTheDocument();
      expect(screen.getByText('Cash Out Offerings')).toBeInTheDocument();
      expect(screen.getByText('System Abuse & Fraud')).toBeInTheDocument();
    });

    it('should render localized terms in German', () => {
      renderFooterModal({ tab: 'Terms and Conditions', language: 'de' });
      expect(screen.getByText('Registrierung des Kontos')).toBeInTheDocument();
      expect(screen.getByText('Wettregeln & Quoten')).toBeInTheDocument();
    });
  });

  describe('Privacy Policy Tab', () => {
    it('should render Privacy Policy content', () => {
      renderFooterModal({ tab: 'Privacy Policy' });
      expect(screen.getByText('GDPR Data Protection & User Rights')).toBeInTheDocument();
      expect(screen.getByText('Data Rights Summary:')).toBeInTheDocument();
      expect(screen.getByText('Right to access personal records')).toBeInTheDocument();
      expect(screen.getByText('Right to be forgotten')).toBeInTheDocument();
      expect(screen.getByText('Right to data portability')).toBeInTheDocument();
    });

    it('should call handleDataExport and trigger toast when export button is clicked', () => {
      const triggerToast = vi.fn();
      const { container } = renderFooterModal({ tab: 'Privacy Policy', triggerToast });

      const exportButton = screen.getByText(/Request Profile Data Export/);
      fireEvent.click(exportButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(triggerToast).toHaveBeenCalledWith('📥 GDPR profile data export downloaded successfully!');
    });

    it('should show self-excluded status in exported data', () => {
      const triggerToast = vi.fn();
      renderFooterModal({
        tab: 'Privacy Policy',
        triggerToast,
        selfExclusionEndTime: Date.now() + 100000
      });

      const exportButton = screen.getByText(/Request Profile Data Export/);
      fireEvent.click(exportButton);

      expect(triggerToast).toHaveBeenCalledWith('📥 GDPR profile data export downloaded successfully!');
    });
  });

  describe('Cookie Policy Tab', () => {
    it('should render Cookie Policy content', () => {
      renderFooterModal({ tab: 'Cookie Policy' });
      expect(screen.getByText(/Manage your cookie settings below/)).toBeInTheDocument();
      expect(screen.getByText('Essential Cookies (Required)')).toBeInTheDocument();
      expect(screen.getByText('Analytical & Performance Cookies')).toBeInTheDocument();
      expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
    });

    it('should load cookie preferences from localStorage', () => {
      const mockCookies = { essential: true, analytical: false, marketing: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCookies));

      renderFooterModal({ tab: 'Cookie Policy' });

      const analyticalCheckbox = screen.getAllByRole('checkbox')[1];
      expect(analyticalCheckbox).not.toBeChecked();
    });

    it('should toggle cookie preferences', () => {
      renderFooterModal({ tab: 'Cookie Policy' });

      const analyticalCheckbox = screen.getAllByRole('checkbox')[1];
      expect(analyticalCheckbox).toBeChecked();

      fireEvent.click(analyticalCheckbox);
      expect(analyticalCheckbox).not.toBeChecked();
    });

    it('should save cookie preferences and trigger toast', () => {
      const triggerToast = vi.fn();
      renderFooterModal({ tab: 'Cookie Policy', triggerToast });

      const saveButton = screen.getByText('Save Cookie Preferences');
      fireEvent.click(saveButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'betz_cookie_prefs',
        expect.stringContaining('analytical')
      );
      expect(triggerToast).toHaveBeenCalledWith('🍪 Cookie preferences saved successfully!');
    });

    it('should save with legacy key if present', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'bwin_cookie_prefs') return JSON.stringify({ essential: true, analytical: true, marketing: false });
        return null;
      });

      renderFooterModal({ tab: 'Cookie Policy' });

      const marketingCheckbox = screen.getAllByRole('checkbox')[2];
      expect(marketingCheckbox).not.toBeChecked();
    });
  });

  describe('Responsible Gaming Tab', () => {
    it('should render Responsible Gaming content', () => {
      renderFooterModal({ tab: 'Responsible Gaming' });
      expect(screen.getByText(/Set Daily Deposit Limit/)).toBeInTheDocument();
      expect(screen.getByText(/Temporary Account Self-Exclusion/)).toBeInTheDocument();
    });

    it('should update local limit when slider changes', () => {
      renderFooterModal({ tab: 'Responsible Gaming', depositLimit: 500 });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('500');

      fireEvent.change(slider, { target: { value: '1000' } });
      expect(slider).toHaveValue('1000');
    });

    it('should save deposit limit and trigger toast', () => {
      const setDepositLimit = vi.fn();
      const triggerToast = vi.fn();
      renderFooterModal({ tab: 'Responsible Gaming', setDepositLimit, depositLimit: 500 });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '1000' } });

      const saveButton = screen.getByText('Confirm Deposit Limit');
      fireEvent.click(saveButton);

      expect(setDepositLimit).toHaveBeenCalledWith(1000);
      expect(triggerToast).toHaveBeenCalledWith('🛡️ Daily deposit limit set to €1000.00.');
    });

    it('should render self-exclusion form when not excluded', () => {
      renderFooterModal({ tab: 'Responsible Gaming', selfExclusionEndTime: 0 });

      expect(screen.getByText('1 Minute')).toBeInTheDocument();
      expect(screen.getByText('24 Hours')).toBeInTheDocument();
      expect(screen.getByText('7 Days')).toBeInTheDocument();
      expect(screen.getByText('Confirm Self-Exclusion')).toBeInTheDocument();
    });

    it('should show exclusion active indicator when excluded', () => {
      renderFooterModal({
        tab: 'Responsible Gaming',
        selfExclusionEndTime: Date.now() + 60000
      });

      expect(screen.getByText(/Account Locked/)).toBeInTheDocument();
    });

    it('should confirm self-exclusion and trigger toast', () => {
      const setSelfExclusionEndTime = vi.fn();
      const triggerToast = vi.fn();
      renderFooterModal({
        tab: 'Responsible Gaming',
        setSelfExclusionEndTime,
        triggerToast,
        selfExclusionEndTime: 0
      });

      const confirmButton = screen.getByText('Confirm Self-Exclusion');
      fireEvent.click(confirmButton);

      expect(setSelfExclusionEndTime).toHaveBeenCalled();
      expect(triggerToast).toHaveBeenCalledWith(expect.stringContaining('Account self-excluded'));
    });

    it('should show correct time remaining text for exclusion', () => {
      renderFooterModal({
        tab: 'Responsible Gaming',
        selfExclusionEndTime: Date.now() + 30000
      });

      expect(screen.getByText(/30s/)).toBeInTheDocument();
    });

    it('should show minutes for longer exclusion', () => {
      renderFooterModal({
        tab: 'Responsible Gaming',
        selfExclusionEndTime: Date.now() + 120000
      });

      expect(screen.getByText(/2m/)).toBeInTheDocument();
    });
  });

  describe('Help Center Tab', () => {
    it('should render FAQ search and list', () => {
      renderFooterModal({ tab: 'Help Center' });

      expect(screen.getByPlaceholderText(/Search FAQs/)).toBeInTheDocument();
      expect(screen.getByText('How do I withdraw my winnings?')).toBeInTheDocument();
    });

    it('should filter FAQs by search query', () => {
      renderFooterModal({ tab: 'Help Center' });

      const searchInput = screen.getByPlaceholderText(/Search FAQs/);
      fireEvent.change(searchInput, { target: { value: 'withdraw' } });

      expect(screen.getByText('How do I withdraw my winnings?')).toBeInTheDocument();
    });

    it('should show empty state when no FAQs match', () => {
      renderFooterModal({ tab: 'Help Center' });

      const searchInput = screen.getByPlaceholderText(/Search FAQs/);
      fireEvent.change(searchInput, { target: { value: 'nonexistent term xyz' } });

      expect(screen.getByText('No FAQs found matching your query.')).toBeInTheDocument();
    });

    it('should expand FAQ item on click', () => {
      renderFooterModal({ tab: 'Help Center' });

      const firstQuestion = screen.getByText('How do I withdraw my winnings?');
      fireEvent.click(firstQuestion);

      expect(screen.getByText(/Go to your account menu/)).toBeInTheDocument();
    });

    it('should collapse FAQ when clicking again', () => {
      renderFooterModal({ tab: 'Help Center' });

      const firstQuestion = screen.getByText('How do I withdraw my winnings?');
      fireEvent.click(firstQuestion);
      fireEvent.click(firstQuestion);

      expect(screen.queryByText(/Go to your account menu/)).not.toBeInTheDocument();
    });

    it('should render localized FAQs in Russian', () => {
      renderFooterModal({ tab: 'Help Center', language: 'ru' });

      expect(screen.getByText('Как вывести выигрыш?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Поиск FAQ/)).toBeInTheDocument();
    });
  });

  describe('Contact Us Tab', () => {
    it('should render contact form', () => {
      renderFooterModal({ tab: 'Contact Us' });

      expect(screen.getByText('Submit an Email Ticket')).toBeInTheDocument();
      expect(screen.getByLabelText('Subject')).toBeInTheDocument();
      expect(screen.getByLabelText('Your Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Detailed Message')).toBeInTheDocument();
    });

    it('should submit contact form successfully', () => {
      const triggerToast = vi.fn();
      renderFooterModal({ tab: 'Contact Us', triggerToast });

      const emailInput = screen.getByLabelText('Your Email Address');
      const messageTextarea = screen.getByLabelText('Detailed Message');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(messageTextarea, { target: { value: 'Test message content' } });

      const submitButton = screen.getByText('Submit Ticket');
      fireEvent.click(submitButton);

      expect(triggerToast).toHaveBeenCalledWith('📨 Support ticket submitted successfully!');
      expect(emailInput).toHaveValue('');
      expect(messageTextarea).toHaveValue('');
    });

    it('should show validation error when form is incomplete', () => {
      const triggerToast = vi.fn();
      renderFooterModal({ tab: 'Contact Us', triggerToast });

      const submitButton = screen.getByText('Submit Ticket');
      fireEvent.click(submitButton);

      expect(triggerToast).toHaveBeenCalledWith('❌ Please fill in all fields before submitting.');
    });

    it('should start live chat and close modal', () => {
      const onStartLiveChat = vi.fn();
      const onClose = vi.fn();
      renderFooterModal({ tab: 'Contact Us', onStartLiveChat, onClose });

      const chatButton = screen.getByText(/Start Live Support Chat/);
      fireEvent.click(chatButton);

      expect(onStartLiveChat).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should render localized contact form in German', () => {
      renderFooterModal({ tab: 'Contact Us', language: 'de' });

      expect(screen.getByText('E-Mail-Ticket einreichen')).toBeInTheDocument();
      expect(screen.getByLabelText('Betreff')).toBeInTheDocument();
      expect(screen.getByLabelText('Ihre E-Mail-Adresse')).toBeInTheDocument();
    });
  });

  describe('Deposits & Withdrawals Tab', () => {
    it('should render payment methods table', () => {
      renderFooterModal({ tab: 'Deposits & Withdrawals' });

      expect(screen.getByText('Supported Payment Methods')).toBeInTheDocument();
      expect(screen.getByText('Visa / MasterCard')).toBeInTheDocument();
      expect(screen.getByText('PayPal')).toBeInTheDocument();
      expect(screen.getByText('Skrill / Neteller')).toBeInTheDocument();
      expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    });

    it('should render table headers correctly', () => {
      renderFooterModal({ tab: 'Deposits & Withdrawals' });

      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Processing Time')).toBeInTheDocument();
      expect(screen.getByText('Limits (Min/Max)')).toBeInTheDocument();
    });

    it('should render localized payment table in Spanish', () => {
      renderFooterModal({ tab: 'Deposits & Withdrawals', language: 'es' });

      expect(screen.getByText('Métodos de Pago Soportados')).toBeInTheDocument();
      expect(screen.getByText('Método')).toBeInTheDocument();
      expect(screen.getByText('Depósito / Retiro')).toBeInTheDocument();
    });
  });

  describe('Betting Rules Tab', () => {
    it('should render glossary items', () => {
      renderFooterModal({ tab: 'Betting Rules' });

      expect(screen.getByText('Glossary & Betting Guidelines')).toBeInTheDocument();
      expect(screen.getByText('Single Bet')).toBeInTheDocument();
      expect(screen.getByText('Multi Bet (Accumulator)')).toBeInTheDocument();
      expect(screen.getByText('System Bet')).toBeInTheDocument();
      expect(screen.getByText('Cash Out Option')).toBeInTheDocument();
    });

    it('should render localized glossary in Russian', () => {
      renderFooterModal({ tab: 'Betting Rules', language: 'ru' });

      expect(screen.getByText('Глоссарий и правила ставок')).toBeInTheDocument();
      expect(screen.getByText('Ординар (одиночная ставка)')).toBeInTheDocument();
      expect(screen.getByText('Экспресс (комбинированная ставка)')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      renderFooterModal({ onClose });

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      const { container } = renderFooterModal({ onClose });

      const overlay = container.querySelector('.footer-modal-overlay');
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose when card content is clicked', () => {
      const onClose = vi.fn();
      const { container } = renderFooterModal({ onClose });

      const card = container.querySelector('.footer-modal-card');
      fireEvent.click(card);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should stop propagation when card is clicked', () => {
      const onClose = vi.fn();
      const { container } = renderFooterModal({ onClose });

      const card = container.querySelector('.footer-modal-card');
      const overlayClickEvent = new MouseEvent('click', { bubbles: true });

      card?.dispatchEvent(overlayClickEvent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => renderFooterModal({ tab: 'Cookie Policy' })).not.toThrow();
    });

    it('should handle unknown language by defaulting to English', () => {
      renderFooterModal({ tab: 'Help Center', language: 'unknown' });

      expect(screen.getByText('How do I withdraw my winnings?')).toBeInTheDocument();
    });

    it('should handle empty search in FAQ', () => {
      renderFooterModal({ tab: 'Help Center' });

      const searchInput = screen.getByPlaceholderText(/Search FAQs/);
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('How do I withdraw my winnings?')).toBeInTheDocument();
    });

    it('should update activeTab when tab prop changes', () => {
      const { rerender } = render(
        <FooterModal
          tab="About Us"
          onClose={vi.fn()}
          balance={0}
          placedBetsCount={0}
          depositLimit={0}
          setDepositLimit={vi.fn()}
          selfExclusionEndTime={0}
          setSelfExclusionEndTime={vi.fn()}
          onStartLiveChat={vi.fn()}
          triggerToast={vi.fn()}
        />
      );

      expect(screen.getByText('About Us')).toBeInTheDocument();

      rerender(
        <FooterModal
          tab="Contact Us"
          onClose={vi.fn()}
          balance={0}
          placedBetsCount={0}
          depositLimit={0}
          setDepositLimit={vi.fn()}
          selfExclusionEndTime={0}
          setSelfExclusionEndTime={vi.fn()}
          onStartLiveChat={vi.fn()}
          triggerToast={vi.fn()}
        />
      );

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    it('should handle expired self-exclusion time', () => {
      renderFooterModal({
        tab: 'Responsible Gaming',
        selfExclusionEndTime: Date.now() - 1000
      });

      expect(screen.getByText('Confirm Self-Exclusion')).toBeInTheDocument();
      expect(screen.queryByText(/Account Locked/)).not.toBeInTheDocument();
    });

    it('should handle zero balance in data export', () => {
      const triggerToast = vi.fn();
      renderFooterModal({
        tab: 'Privacy Policy',
        triggerToast,
        balance: 0,
        placedBetsCount: 0
      });

      const exportButton = screen.getByText(/Request Profile Data Export/);
      fireEvent.click(exportButton);

      expect(triggerToast).toHaveBeenCalledWith('📥 GDPR profile data export downloaded successfully!');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attributes', () => {
      const { container } = renderFooterModal();

      const overlay = container.querySelector('.footer-modal-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should have close button with text content', () => {
      renderFooterModal();

      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('fm-close-btn');
    });

    it('should have proper form labels', () => {
      renderFooterModal({ tab: 'Contact Us' });

      expect(screen.getByLabelText('Subject')).toBeInTheDocument();
      expect(screen.getByLabelText('Your Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Detailed Message')).toBeInTheDocument();
    });

    it('should have proper slider attributes', () => {
      renderFooterModal({ tab: 'Responsible Gaming' });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '50');
      expect(slider).toHaveAttribute('max', '5000');
      expect(slider).toHaveAttribute('step', '50');
    });
  });
});
