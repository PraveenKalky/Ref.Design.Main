import React, { useState } from 'react';
import { X } from 'lucide-react';
import './SystemBanner.css';

export default function SystemBanner({ 
  status = 'info', 
  message, 
  actionLabel, 
  onAction, 
  dismissible = false,
  onDismiss 
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !message) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={`system-banner status-${status}`}>
      <div className="system-banner-content">
        <div className="system-banner-center">
          <div className="system-banner-icon">
            <div className="system-banner-dot" />
          </div>
          <div className="system-banner-text">
            {message}
          </div>
        </div>
        
        {(actionLabel || dismissible) && (
          <div className="system-banner-right">
            {actionLabel && onAction && (
              <button className="system-banner-action" onClick={onAction}>
                {actionLabel}
              </button>
            )}
            {dismissible && (
              <button 
                className="system-banner-close" 
                onClick={handleDismiss}
                aria-label="Dismiss banner"
              >
                <X />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
