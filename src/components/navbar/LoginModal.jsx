import React, { useState } from 'react';
import { X } from 'lucide-react';
import './login-modal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auth logic placeholder — connect to existing auth when available
  };

  return (
    <div className="lm-backdrop" onClick={onClose}>
      <div className="lm-modal" onClick={(e) => e.stopPropagation()}>

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
          <h2 className="lm-title">Log in</h2>

          <form className="lm-form" onSubmit={handleSubmit}>

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
              <input
                className="lm-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
              <a href="#register" className="lm-register-link" onClick={(e) => e.preventDefault()}>
                Register now
              </a>
            </p>

          </form>

        </div>


      </div>

      {/* Close × button — top or bottom right of the screen */}
      <button className="lm-close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>

    </div>
  );
};

export default LoginModal;
