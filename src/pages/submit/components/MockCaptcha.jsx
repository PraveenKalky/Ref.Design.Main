import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function MockCaptcha({ onVerify }) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    setIsVerified(true);
    onVerify(true);
  };

  return (
    <div className="form-field-group">
      <label className="form-field-label">CAPTCHA verification<span className="form-field-required">*</span></label>
      
      <div className={`mock-captcha-box ${isVerified ? 'verified' : ''}`} onClick={!isVerified ? handleVerify : undefined}>
        <div className="mock-captcha-left">
          <div className={`mock-captcha-checkbox ${isVerified ? 'checked' : ''}`}>
            {isVerified && <Check size={16} strokeWidth={3} />}
          </div>
          <span className="mock-captcha-text">
            {isVerified ? 'Success!' : 'Verify you are human'}
          </span>
        </div>
        <div className="mock-captcha-right">
          <div className="mock-captcha-logo">cloudflare</div>
          <div className="mock-captcha-links">
            <span>Privacy</span> • <span>Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
