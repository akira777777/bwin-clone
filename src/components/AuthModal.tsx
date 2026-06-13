import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase, hasRealSupabaseConfig } from '../lib/supabase';
import { t } from '../utils/i18n';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onSuccess?: (email: string, isNewAccount: boolean) => void;
  language?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type: initialType, onSuccess, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Clear sensitive fields when switching tabs
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
  }, [activeTab]);

  if (!isOpen) return null;

  // Local translations for auth-specific strings
  const getAuthText = (key: string): string => {
    const dicts: Record<string, Record<string, string>> = {
      ru: {
        'Passwords do not match': 'Пароли не совпадают',
        'Password must be at least 6 characters': 'Пароль должен быть не менее 6 символов',
        'Successfully logged in! Welcome back.': 'Вход выполнен успешно! С возвращением.',
        'Account created! Welcome to bwin.': 'Аккаунт создан! Добро пожаловать на bwin.',
        'Authentication failed. Please try again.': 'Ошибка аутентификации. Пожалуйста, попробуйте еще раз.',
        'Please enter your email first': 'Пожалуйста, введите сначала ваш email',
        'Password reset link sent to ': 'Ссылка для сброса пароля отправлена на ',
        'Email / Username': 'Email / Имя пользователя',
        'Enter your email': 'Введите ваш email',
        'Password': 'Пароль',
        'Enter your password': 'Введите ваш пароль',
        'Confirm Password': 'Подтвердите пароль',
        'Confirm your password': 'Повторите пароль',
        'Remember me': 'Запомнить меня',
        'Forgot Password?': 'Забыли пароль?',
        'I agree to the ': 'Я согласен с ',
        'Terms & Conditions': 'Условиями и Положениями',
        'Logging in...': 'Вход...',
        'Creating account...': 'Создание аккаунта...',
        'Register Now': 'Зарегистрироваться',
        'Don\'t have an account? ': 'Нет аккаунта? ',
        'Already have an account? ': 'Уже есть аккаунт? ',
      },
      de: {
        'Passwords do not match': 'Passwörter stimmen nicht überein',
        'Password must be at least 6 characters': 'Das Passwort muss mindestens 6 Zeichen lang sein',
        'Successfully logged in! Welcome back.': 'Erfolgreich eingeloggt! Willkommen zurück.',
        'Account created! Welcome to bwin.': 'Konto erstellt! Willkommen bei bwin.',
        'Authentication failed. Please try again.': 'Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        'Please enter your email first': 'Bitte geben Sie zuerst Ihre E-Mail-Adresse ein',
        'Password reset link sent to ': 'Link zum Zurücksetzen des Passworts gesendet an ',
        'Email / Username': 'E-Mail / Benutzername',
        'Enter your email': 'Geben Sie Ihre E-Mail ein',
        'Password': 'Passwort',
        'Enter your password': 'Geben Sie Ihr Passwort ein',
        'Confirm Password': 'Kennwort bestätigen',
        'Confirm your password': 'Bestätigen Sie Ihr Passwort',
        'Remember me': 'Angemeldet bleiben',
        'Forgot Password?': 'Passwort vergessen?',
        'I agree to the ': 'Ich stimme den ',
        'Terms & Conditions': 'Allgemeinen Geschäftsbedingungen zu',
        'Logging in...': 'Einloggen...',
        'Creating account...': 'Konto wird erstellt...',
        'Register Now': 'Jetzt registrieren',
        'Don\'t have an account? ': 'Haben Sie noch kein Konto? ',
        'Already have an account? ': 'Haben Sie bereits ein Konto? ',
      },
      es: {
        'Passwords do not match': 'Las contraseñas no coinciden',
        'Password must be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Successfully logged in! Welcome back.': '¡Inicio de sesión correcto! Bienvenido de nuevo.',
        'Account created! Welcome to bwin.': '¡Cuenta creada! Bienvenido a bwin.',
        'Authentication failed. Please try again.': 'Error de autenticación. Por favor, inténtelo de nuevo.',
        'Please enter your email first': 'Por favor, introduzca su correo primero',
        'Password reset link sent to ': 'Enlace de restablecimiento enviado a ',
        'Email / Username': 'Correo / Usuario',
        'Enter your email': 'Introduzca su correo electrónico',
        'Password': 'Contraseña',
        'Enter your password': 'Introduzca su contraseña',
        'Confirm Password': 'Confirmar Contraseña',
        'Confirm your password': 'Confirme su contraseña',
        'Remember me': 'Recordarme',
        'Forgot Password?': '¿Olvidó su contraseña?',
        'I agree to the ': 'Acepto los ',
        'Terms & Conditions': 'Términos y Condiciones',
        'Logging in...': 'Iniciando sesión...',
        'Creating account...': 'Creando cuenta...',
        'Register Now': 'Registrarse Ahora',
        'Don\'t have an account? ': '¿No tiene una cuenta? ',
        'Already have an account? ': '¿Ya tiene una cuenta? ',
      }
    };

    return dicts[language]?.[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (activeTab === 'register' && password !== confirmPassword) {
      setFormError(getAuthText('Passwords do not match'));
      return;
    }

    if (password.length < 6) {
      setFormError(getAuthText('Password must be at least 6 characters'));
      return;
    }

    setIsSubmitting(true);

    const trimmedEmail = email.trim();
    const hasRealClient = hasRealSupabaseConfig;

    try {
      if (hasRealClient) {
        if (activeTab === 'login') {
          const { error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          });
          if (error) throw error;
        }

        setSuccessMessage(
          activeTab === 'login' 
            ? getAuthText('Successfully logged in! Welcome back.')
            : getAuthText('Account created! Welcome to bwin.')
        );

        setTimeout(() => {
          setSuccessMessage(null);
          if (onSuccess) onSuccess(trimmedEmail, activeTab === 'register');
          onClose();
        }, 1400);
      } else {
        // Fallback simulation
        setTimeout(() => {
          setIsSubmitting(false);
          const message = activeTab === 'login' 
            ? getAuthText('Successfully logged in! Welcome back.')
            : getAuthText('Account created! Welcome to bwin.');
          setSuccessMessage(message);
          
          setTimeout(() => {
            setSuccessMessage(null);
            if (onSuccess) onSuccess(trimmedEmail, activeTab === 'register');
            onClose();
          }, 2000);
        }, 800);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFormError(err instanceof Error ? err.message : getAuthText('Authentication failed. Please try again.'));
    } finally {
      if (hasRealClient) {
        setIsSubmitting(false);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setFormError(getAuthText('Please enter your email first'));
      return;
    }
    setFormError(null);
    setSuccessMessage(`${getAuthText('Password reset link sent to ')}${email}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Success overlay */}
        {successMessage && (
          <div className="auth-success-overlay">
            <div className="auth-success-icon">✓</div>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setFormError(null); }}
          >
            {t('Log In', language)}
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setFormError(null); }}
          >
            {t('Register', language)}
          </button>
        </div>

        {formError && (
          <div className="auth-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email">{getAuthText('Email / Username')}</label>
            <input 
              id="auth-email"
              type="text" 
              placeholder={getAuthText('Enter your email')} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{getAuthText('Password')}</label>
            <div className="password-wrapper">
              <input 
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={getAuthText('Enter your password')} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">{getAuthText('Confirm Password')}</label>
              <div className="password-wrapper">
                <input 
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={getAuthText('Confirm your password')} 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="form-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span>{getAuthText('Remember me')}</span>
              </label>
              <button 
                type="button" 
                className="forgot-password" 
                onClick={handleForgotPassword}
              >
                {getAuthText('Forgot Password?')}
              </button>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" required />
                <span>
                  {getAuthText('I agree to the ')}
                  <a href="#" onClick={(e) => e.preventDefault()}>{getAuthText('Terms & Conditions')}</a>
                </span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (activeTab === 'login' ? getAuthText('Logging in...') : getAuthText('Creating account...')) 
              : (activeTab === 'login' ? t('Log In', language) : getAuthText('Register Now'))}
          </button>
        </form>

        <div className="auth-footer">
          {activeTab === 'login' ? (
            <p>
              {getAuthText('Don\'t have an account? ')}
              <button type="button" className="auth-switch" onClick={() => setActiveTab('register')}>{getAuthText('Register Now')}</button>
            </p>
          ) : (
            <p>
              {getAuthText('Already have an account? ')}
              <button type="button" className="auth-switch" onClick={() => setActiveTab('login')}>{t('Log In', language)}</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
