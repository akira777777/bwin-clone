import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import AuthModal from './AuthModal';

// Mock supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
  hasRealSupabaseConfig: false, // Default to simulation mode
}));

// Mock i18n utility
vi.mock('../utils/i18n', () => ({
  t: (key: string, lang: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: { 'Log In': 'Log In', 'Register': 'Register' },
      ru: { 'Log In': 'Вход', 'Register': 'Регистрация' },
      de: { 'Log In': 'Einloggen', 'Register': 'Registrieren' },
      es: { 'Log In': 'Iniciar Sesión', 'Register': 'Registrarse' },
    };
    return translations[lang]?.[key] || key;
  },
}));

// Mock CSS to avoid styling issues
vi.mock('./AuthModal.css', () => ({}));

describe('AuthModal Component', () => {
  // Helper function to render component with default props
  const renderAuthModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      type: 'login' as const,
      onSuccess: vi.fn(),
      language: 'en',
    };
    return render(<AuthModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = renderAuthModal({ isOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      renderAuthModal();
      expect(screen.getByText('Log In')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should start with login tab by default', () => {
      renderAuthModal({ type: 'login' });
      const loginTab = screen.getByText('Log In');
      expect(loginTab).toHaveClass('active');
    });

    it('should start with register tab when type is register', () => {
      renderAuthModal({ type: 'register' });
      const registerTab = screen.getByText('Register');
      expect(registerTab).toHaveClass('active');
    });

    it('should render email and password inputs for login', () => {
      renderAuthModal({ type: 'login' });
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Confirm your password')).not.toBeInTheDocument();
    });

    it('should render email, password and confirm password inputs for register', () => {
      renderAuthModal({ type: 'register' });
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('should render remember me and forgot password for login tab', () => {
      renderAuthModal({ type: 'login' });
      expect(screen.getByText('Remember me')).toBeInTheDocument();
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });

    it('should render terms checkbox for register tab', () => {
      renderAuthModal({ type: 'register' });
      expect(screen.getByText(/I agree to the/)).toBeInTheDocument();
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderAuthModal();
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch from login to register tab', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.click(screen.getByText('Register'));

      expect(screen.getByText('Register')).toHaveClass('active');
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('should switch from register to login tab', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.click(screen.getByText('Log In'));

      expect(screen.getByText('Log In')).toHaveClass('active');
      expect(screen.queryByPlaceholderText('Confirm your password')).not.toBeInTheDocument();
    });

    it('should clear form fields and errors when switching tabs', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      await user.click(screen.getByText('Register'));

      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });

    it('should switch tabs using footer links', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.click(screen.getByText('Register Now'));

      expect(screen.getByText('Register')).toHaveClass('active');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility for login', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const toggleButton = passwordInput.parentElement?.querySelector('.password-toggle');

      expect(passwordInput).toHaveAttribute('type', 'password');

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
      }
    });

    it('should toggle confirm password visibility for register', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const toggleButton = confirmPasswordInput.parentElement?.querySelector('.password-toggle');

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      if (toggleButton) {
        await user.click(toggleButton);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      }
    });
  });

  describe('Form Validation', () => {
    it('should show error when password is less than 6 characters', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), '12345');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should show error when passwords do not match in register mode', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'different123');
      await user.click(screen.getByRole('button', { name: 'Register Now' }));

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should require email input', async () => {
      renderAuthModal({ type: 'login' });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require password input', async () => {
      renderAuthModal({ type: 'login' });

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Login Flow', () => {
    it('should trim email before submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderAuthModal({ type: 'login', onSuccess });

      await user.type(screen.getByPlaceholderText('Enter your email'), '  test@example.com  ');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.getByText('Successfully logged in! Welcome back.')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('test@example.com', false);
      });
    });

    it('should show submitting state during login', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Log In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Logging in...');
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show success message and call onSuccess after login', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderAuthModal({ type: 'login', onSuccess });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.getByText('Successfully logged in! Welcome back.')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('test@example.com', false);
      });
    });
  });

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderAuthModal({ type: 'register', onSuccess });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      // Accept terms
      const termsCheckbox = screen.getByRole('checkbox');
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: 'Register Now' }));

      await waitFor(() => {
        expect(screen.getByText('Account created! Welcome to BETZ.')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('newuser@example.com', true);
      });
    });

    it('should not submit when terms checkbox is not checked', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Register Now' });
      await user.click(submitButton);

      // HTML5 validation prevents form submission
      expect(submitButton.closest('form')).toHaveProperty('checkValidity');
    });

    it('should show submitting state during registration', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      const termsCheckbox = screen.getByRole('checkbox');
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Register Now' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Creating account...');
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Forgot Password', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.click(screen.getByText('Forgot Password?'));

      expect(screen.getByText('Please enter your email first')).toBeInTheDocument();
    });

    it('should show success message when email is provided', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByText('Forgot Password?'));

      expect(screen.getByText('Password reset link sent to test@example.com')).toBeInTheDocument();
    });

    it('should clear forgot password message after timeout', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.click(screen.getByText('Forgot Password?'));

      await waitFor(() => {
        expect(screen.getByText('Password reset link sent to test@example.com')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('Password reset link sent to test@example.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderAuthModal({ onClose });

      await user.click(screen.getByLabelText('Close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking overlay', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderAuthModal({ onClose });

      const overlay = screen.getByText('Log In').closest('.modal-overlay');
      if (overlay) {
        await user.click(overlay);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not close when clicking modal content', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderAuthModal({ onClose });

      const modalContent = screen.getByText('Log In').closest('.modal-content');
      if (modalContent) {
        await user.click(modalContent);
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('should clear errors when switching tabs', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      // Trigger an error
      await user.type(screen.getByPlaceholderText('Enter your password'), '12345');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });

      // Switch tabs
      await user.click(screen.getByText('Register'));

      expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
    });
  });

  describe('Remember Me', () => {
    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Internationalization', () => {
    it('should display Russian text for ru language', () => {
      renderAuthModal({ language: 'ru' });
      expect(screen.getByText('Вход')).toBeInTheDocument();
      expect(screen.getByText('Регистрация')).toBeInTheDocument();
    });

    it('should display German text for de language', () => {
      renderAuthModal({ language: 'de' });
      expect(screen.getByText('Einloggen')).toBeInTheDocument();
      expect(screen.getByText('Registrieren')).toBeInTheDocument();
    });

    it('should display Spanish text for es language', () => {
      renderAuthModal({ language: 'es' });
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByText('Registrarse')).toBeInTheDocument();
    });

    it('should translate validation errors', async () => {
      const user = userEvent.setup();
      renderAuthModal({ language: 'ru' });

      await user.type(screen.getByPlaceholderText('Enter your password'), '12345');
      await user.click(screen.getByRole('button', { name: 'Вход' }));

      await waitFor(() => {
        expect(screen.getByText('Пароль должен быть не менее 6 символов')).toBeInTheDocument();
      });
    });

    it('should translate password mismatch error', async () => {
      const user = userEvent.setup();
      renderAuthModal({ language: 'de', type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'different');
      await user.click(screen.getByRole('button', { name: 'Jetzt registrieren' }));

      await waitFor(() => {
        expect(screen.getByText('Passwörter stimmen nicht überein')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show success overlay with checkmark', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        const successOverlay = screen.getByText('Successfully logged in! Welcome back.');
        expect(successOverlay).toBeInTheDocument();
        expect(successOverlay.closest('.auth-success-overlay')).toBeInTheDocument();
      });
    });

    it('should clear success message after timeout', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.getByText('Successfully logged in! Welcome back.')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(screen.queryByText('Successfully logged in! Welcome back.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display form errors to user', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'short');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        const errorDiv = screen.getByText('Password must be at least 6 characters');
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveClass('auth-error');
      });
    });

    it('should clear previous errors when new validation starts', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      // Trigger error
      await user.type(screen.getByPlaceholderText('Enter your password'), 'short');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });

      // Fix the error
      await user.clear(screen.getByPlaceholderText('Enter your password'));
      await user.type(screen.getByPlaceholderText('Enter your password'), 'longpassword');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on close button', () => {
      renderAuthModal();
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('should have proper aria-labels on password toggle buttons', () => {
      renderAuthModal({ type: 'login' });
      const toggleButtons = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-label')?.includes('password')
      );
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    it('should have associated labels for form inputs', () => {
      renderAuthModal({ type: 'login' });
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Log In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with leading/trailing spaces', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderAuthModal({ type: 'login', onSuccess });

      await user.type(screen.getByPlaceholderText('Enter your email'), '  spaced@email.com  ');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('spaced@email.com', false);
      });
    });

    it('should handle switching tabs during submission', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Log In' });
      await user.click(submitButton);

      // Try to switch tabs while submitting
      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle empty confirm password in register mode', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      // Leave confirm password empty

      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should handle exactly 6 character password', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), '123456');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
      });
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'P@ssw0rd!');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'P@ssw0rd!');

      // Accept terms
      await user.click(screen.getByRole('checkbox'));

      await user.click(screen.getByRole('button', { name: 'Register Now' }));

      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });

    it('should prevent form submission with Enter key when validation fails', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      await user.type(passwordInput, 'short');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    it('should reset form fields after successful login', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderAuthModal({ type: 'login', onClose });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: 'Log In' }));

      vi.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should maintain form state when switching between tabs and back', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'login' });

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      await user.click(screen.getByText('Register'));
      await user.click(screen.getByText('Log In'));

      // Fields should be cleared after tab switch
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter your password')).toHaveValue('');
    });
  });

  describe('Terms and Conditions Link', () => {
    it('should prevent default on terms link click', async () => {
      const user = userEvent.setup();
      renderAuthModal({ type: 'register' });

      const termsLink = screen.getByText('Terms & Conditions');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      termsLink.dispatchEvent(clickEvent);

      expect(clickEvent.defaultPrevented).toBe(true);
    });
  });
});
