// src/components/ui/ConfirmDialog.jsx
import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — small yes/no modal with async support.
 * Blocks close while confirming. Catches errors from onConfirm.
 */
const ConfirmDialog = ({
  open,
  onClose,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // confirm button variant
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm?.();
      onClose?.();
    } catch (err) {
      // Let the parent show a toast — we just stop the spinner
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-relaxed)' }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;