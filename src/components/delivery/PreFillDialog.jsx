// src/components/delivery/PreFillDialog.jsx
import React, { useState } from 'react';
import { FaWeightHanging } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import FormRow from '../ui/FormRow';
import { agentDeliveriesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';

/**
 * PreFillDialog — records the weight of the cylinder BEFORE it goes to the plant.
 *
 * Sent to POST /delivery/:id/pre-fill-weight
 * Body: { measuredWeight, gpsCoordinates?, photos?, notes? }
 *
 * Effect:
 *   - creates a CylinderWeightRecord (phase: pre_fill)
 *   - updates Delivery.preFillWeight + workflow status
 *   - does NOT credit remnant
 */
const PreFillDialog = ({ delivery, onClose, onSuccess }) => {
  const open = Boolean(delivery);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: showError } = useSnackbar();

  const reset = () => {
    setWeight('');
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    const parsed = parseFloat(weight);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter a positive number for the cylinder weight');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await agentDeliveriesAPI.recordPreFill(delivery._id, {
        measuredWeight: parsed,
        notes: notes.trim() || undefined,
      });
      success(`Pre-fill recorded: ${parsed}kg`);
      reset();
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Failed to record pre-fill weight';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Record Pre-Fill Weight"
      subtitle={
        delivery
          ? `Cylinder: ${delivery.cylinderTag || '—'} — Customer: ${delivery.customerName}`
          : ''
      }
      size="sm"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            leftIcon={<FaWeightHanging />}
          >
            Save Pre-Fill
          </Button>
        </>
      }
    >
      <FormRow cols={1}>
        <FormField
          label="Measured cylinder weight (kg)"
          name="preFillWeight"
          type="number"
          step="0.01"
          min="0"
          value={weight}
          onChange={(e) => { setWeight(e.target.value); setError(''); }}
          required
          error={error}
          help="Weigh the cylinder before leaving the customer. Remnant is credited only after post-fill."
          disabled={loading}
        />
        <FormField
          label="Notes (optional)"
          name="preFillNotes"
          as="textarea"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
        />
      </FormRow>
    </Modal>
  );
};

export default PreFillDialog;