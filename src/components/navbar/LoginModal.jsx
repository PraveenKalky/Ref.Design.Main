import React, { useState, useEffect } from 'react';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './login-modal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regEmailPhone, setRegEmailPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [regErrors, setRegErrors] = useState({});

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  if (!isOpen && toasts.length === 0) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Login failed. Please check your credentials.', 'error');
    } else {
      addToast('You have been logged in successfully.', 'success');
      onClose();
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'This field is required';
    } else if (name === 'regEmailPhone') {
      if (value.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Enter a valid email address';
      } else {
        const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
        if (!phoneRegex.test(value)) error = 'Enter a valid phone number';
      }
    }
    setRegErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name, value) => {
    validateField(name, value);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const isUserValid = validateField('regUsername', regUsername);
    const isEmailPhoneValid = validateField('regEmailPhone', regEmailPhone);
    const isPassValid = validateField('regPassword', regPassword);

    if (isUserValid && isEmailPhoneValid && isPassValid) {
      addToast('You have been registered successfully.', 'success');
      onClose();
      setTimeout(() => setIsRegisterView(false), 500); 
    } else {
      addToast('Registration failed. Please try again.', 'error');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="lm-backdrop" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="lm-modal" 
              onClick={(e) => e.stopPropagation()}
              layout
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >

        {/* ── LEFT PANEL ── */}
        <div className="lm-left">
          <p className="lm-welcome">Welcome!</p>

          <div className="lm-brand-center">
            {/* Brand logotype */}
            <span className="lm-wordmark">RF</span>

            {/* Smiley face circle */}
            <div className="lm-smiley">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" fill="#B8F5C8" stroke="#3B3BD6" strokeWidth="5"/>
                {/* Eyes */}
                <circle cx="34" cy="40" r="5.5" fill="#3B3BD6"/>
                <circle cx="66" cy="40" r="5.5" fill="#3B3BD6"/>
                {/* Smile */}
                <path d="M30 60 Q50 78 70 60" fill="none" stroke="#3B3BD6" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lm-right">
          <AnimatePresence mode="popLayout" initial={false}>
            {!isRegisterView ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="lm-view-container"
              >
                <h2 className="lm-title">Log in</h2>

                <form className="lm-form" onSubmit={handleLoginSubmit}>
                  <div className="lm-field">
                    <label className="lm-label">EMAIL OR USERNAME</label>
                    <input
                      className="lm-input"
                      type="text"
                      placeholder="Email or Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="lm-field">
                    <label className="lm-label">PASSWORD</label>
                    <div className="lm-input-wrap">
                      <input
                        className="lm-input"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="lm-eye-btn" 
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="lm-checkbox-label">
                    <input
                      type="checkbox"
                      className="lm-checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    />
                    Keep me logged in
                  </label>

                  <button type="submit" className="lm-submit">
                    Log in now
                  </button>

                  <div className="lm-forgot-wrap">
                    <a href="#forgot" className="lm-forgot" onClick={(e) => e.preventDefault()}>
                      Forgot your password?
                    </a>
                  </div>

                  <p className="lm-register" style={{ marginTop: '4px' }}>
                    Not a member yet?{' '}
                    <a href="#register" className="lm-register-link" onClick={(e) => { e.preventDefault(); setIsRegisterView(true); }}>
                      Register now
                    </a>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="lm-view-container"
              >
                <h2 className="lm-title">Register with your e-mail</h2>

                <form className="lm-form" onSubmit={handleRegisterSubmit}>
                  <div className="lm-field">
                    <label className="lm-label">USERNAME</label>
                    <input
                      className={`lm-input ${regErrors.regUsername ? 'lm-input--error' : ''}`}
                      type="text"
                      placeholder="Username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      onBlur={(e) => handleBlur('regUsername', e.target.value)}
                    />
                    {regErrors.regUsername && <span className="lm-error-msg">{regErrors.regUsername}</span>}
                  </div>

                  <div className="lm-field">
                    <label className="lm-label">EMAIL OR PHONE NUMBER</label>
                    <input
                      className={`lm-input ${regErrors.regEmailPhone ? 'lm-input--error' : ''}`}
                      type="text"
                      placeholder="Email or phone number"
                      value={regEmailPhone}
                      onChange={(e) => setRegEmailPhone(e.target.value)}
                      onBlur={(e) => handleBlur('regEmailPhone', e.target.value)}
                    />
                    {regErrors.regEmailPhone && <span className="lm-error-msg">{regErrors.regEmailPhone}</span>}
                  </div>

                  <div className="lm-field">
                    <label className="lm-label">PASSWORD</label>
                    <div className="lm-input-wrap">
                      <input
                        className={`lm-input ${regErrors.regPassword ? 'lm-input--error' : ''}`}
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        onBlur={(e) => handleBlur('regPassword', e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="lm-eye-btn" 
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {regErrors.regPassword && <span className="lm-error-msg">{regErrors.regPassword}</span>}
                  </div>

                  <button type="submit" className="lm-submit" style={{ marginTop: '4px' }}>
                    Create Account
                  </button>

                  <p className="lm-register" style={{ marginTop: '4px' }}>
                    Are you a member?{' '}
                    <a href="#login" className="lm-register-link" onClick={(e) => { e.preventDefault(); setIsRegisterView(false); }}>
                      Log in now
                    </a>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

            </motion.div>

            {/* Close × button */}
            <button className="lm-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts Container */}
      <div className="lm-toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              className="lm-toast"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <div className={`lm-toast-icon lm-toast-${toast.type}`}>
                {toast.type === 'success' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </div>
              <span className="lm-toast-msg">{toast.message}</span>
              <button className="lm-toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LoginModal;
