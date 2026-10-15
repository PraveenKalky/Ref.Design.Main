import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './modal.css';

/**
 * Global Standard Modal Component
 * Matches the reference Websites -> Delete Website confirmation modal
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'
  maxWidth,
  showCloseButton = false,
  closeOnOverlayClick = true,
  className = '',
  overlayClassName = '',
  role = 'dialog',
  ariaLabelledBy,
  ariaDescribedBy
}) {
  // Body scroll lock and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('has-modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('has-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const sizeClass = size ? `admin-modal-size-${size}` : '';
  const customStyle = maxWidth ? { maxWidth } : {};

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`admin-modal-overlay ${overlayClassName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={closeOnOverlayClick ? onClose : undefined}
          role={role}
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          <motion.div
            className={`admin-modal-content ${sizeClass} ${className}`}
            style={customStyle}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && onClose && (
              <button
                type="button"
                className="admin-modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}

            {title && (
              typeof title === 'string' ? (
                <h3 className="admin-modal-title" id={ariaLabelledBy}>
                  {title}
                </h3>
              ) : title
            )}

            {description && (
              typeof description === 'string' ? (
                <p className="admin-modal-body" id={ariaDescribedBy}>
                  {description}
                </p>
              ) : description
            )}

            {children}

            {actions && (
              <div className="admin-modal-actions">
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Standardized Confirmation Modal Helper
 * For deletes, discards, and confirmations across the entire platform
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message,
  description,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
  loadingText = 'Deleting…',
  confirmIcon,
  size = 'md',
  maxWidth,
  children
}) {
  const bodyText = description || message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      size={size}
      maxWidth={maxWidth}
      closeOnOverlayClick={!isLoading}
    >
      {title && <h3 className="admin-modal-title">{title}</h3>}

      {bodyText && (
        <p className="admin-modal-body">
          {bodyText}
        </p>
      )}

      {children}

      <div className="admin-modal-actions">
        <button
          type="button"
          className="admin-modal-btn admin-modal-btn-cancel"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`admin-modal-btn ${isDanger ? 'admin-modal-btn-danger' : 'admin-modal-btn-primary'}`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            loadingText
          ) : (
            <>
              {confirmIcon}
              <span>{confirmText}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
