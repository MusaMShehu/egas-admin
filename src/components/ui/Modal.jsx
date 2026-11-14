// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal — dialog primitive.
 *
 * Props:
 *   open        — boolean
 *   onClose     — called when user dismisses (Escape, backdrop, X, cancel)
 *   title       — string | ReactNode
 *   subtitle    — string | ReactNode
 *   size        — 'sm' | 'md' | 'lg' | 'xl'
 *   footer      — ReactNode rendered in footer (buttons usually)
 *   closeOnBackdrop — default true
 *   closeOnEsc  — default true
 *   loading     — disables close during save
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer = null,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  loading = false,
  className = '',
}) => {
  const dialogRef = useRef(null);

  // Escape to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose, loading]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus first focusable element
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const first = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus?.();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="ui-modal-overlay"
      onMouseDown={handleBackdrop}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`ui-modal ui-modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ui-modal-title' : undefined}
      >
        {(title || subtitle) && (
          <div className="ui-modal__header">
            <div className="ui-modal__header-text">
              {title && (
                <h2 id="ui-modal-title" className="ui-modal__title">{title}</h2>
              )}
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="ui-modal__body">{children}</div>

        {footer && (
          <div className="ui-modal__footer">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;