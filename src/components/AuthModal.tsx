import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase, hasRealSupabaseConfig } from '../lib/supabase';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onSuccess?: (email: string, isNewAccount: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type: initialType, onSuccess }) => {
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

  // Clear sensitive fields when switching tabs (avoid leaking passwords between login/register).
  // Intentional batch of state resets on user action (tab change). We disable the rule
  // for the whole effect because each set* is a deliberate "reset form for new mode".
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (activeTab === 'register' && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    const trimmedEmail = email.trim();

    // If real Supabase keys are configured, use real auth
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

        // Real auth succeeded — Supabase will fire onAuthStateChange in App.tsx
        setSuccessMessage(
          activeTab === 'login' 
            ? 'Successfully logged in! Welcome back.' 
            : 'Account created! Welcome to bwin.'
        );

        setTimeout(() => {
          setSuccessMessage(null);
          // onSuccess kept for backward compat with any parent simulation
          if (onSuccess) onSuccess(trimmedEmail, activeTab === 'register');
          onClose();
        }, 1400);
      } else {
        // Fallback simulation (no Supabase keys yet)
        setTimeout(() => {
          setIsSubmitting(false);
          const message = activeTab === 'login' 
            ? 'Successfully logged in! Welcome back.' 
            : 'Account created! Welcome to bwin.';
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
      setFormError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      // only turn off submitting in the error path or simulation
      if (!hasRealClient) {
        // simulation already handled inside
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setFormError('Please enter your email first');
      return;
    }
    setFormError(null);
    setSuccessMessage(`Password reset link sent to ${email}`);
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
            Log In
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setFormError(null); }}
          >
            Register
          </button>
        </div>

        {formError && (
          <div className="auth-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email">Email / Username</label>
            <input 
              id="auth-email"
              type="text" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="password-wrapper">
              <input 
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password" 
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
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input 
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password" 
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
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password" 
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" required />
                <span>I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms & Conditions</a></span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (activeTab === 'login' ? 'Logging in...' : 'Creating account...') 
              : (activeTab === 'login' ? 'Log In' : 'Register Now')}
          </button>
        </form>

        <div className="auth-footer">
          {activeTab === 'login' ? (
            <p>Don't have an account? <button type="button" className="auth-switch" onClick={() => setActiveTab('register')}>Register Now</button></p>
          ) : (
            <p>Already have an account? <button type="button" className="auth-switch" onClick={() => setActiveTab('login')}>Log In</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
