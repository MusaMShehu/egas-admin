// src/components/delivery/PostFillDialog.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FaBalanceScale } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import FormRow from '../ui/FormRow';
import { agentDeliveriesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';

/**
 * PostFillDialog — records the weight of the cylinder AFTER refill at the plant.
 *
 * Sent to POST /delivery/:id/post-fill-weight
 * Body: { measuredWeight, gpsCoordinates?, photos?, notes? }
 *
 * Effect (backend-computed):
 *   refilledKg    = postFillWeight - preFillWeight
 *   purchasedKg   = delivery.requestedKg ?? planDetails.size ?? subscription.size
 *   remnantDeltaKg = max(0, purchasedKg - refilledKg)
 *
 *   → credits CylinderRemnantLedger (append-only)
 *   → updates Delivery.remnantDeltaKg + remnantLedgerEntryId
 *   → sets plantWorkflowStatus = 'remnant_credited'
 */
const PostFillDialog = ({ delivery, onClose, onSuccess }) => {
  const open = Boolean(delivery);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: showError } = useSnackbar();

  const preFill = delivery?.preFillWeight ?? null;
  const purchasedKg = useMemo(() => {
    if (!delivery) return null;
    if (delivery.requestedKg) return delivery.requestedKg;
    const fromPlan = delivery.planDetails?.size
      ? parseFloat(String(delivery.planDetails.size).replace(/[^\d.]/g, ''))
      : null;
    return Number.isFinite(fromPlan) ? fromPlan : null;
  }, [delivery]);

  const parsedWeight = parseFloat(weight);
  const preview = useMemo(() => {
    if (!Number.isFinite(parsedWeight) || !Number.isFinite(preFill)) return null;
    const refilled = +(parsedWeight - preFill).toFixed(3);
    const remnant =
      Number.isFinite(purchasedKg) && purchasedKg > 0
        ? Math.max(0, +(purchasedKg - refilled).toFixed(3))
        : null;
    return { refilled, remnant };
  }, [parsedWeight, preFill, purchasedKg]);

  const reset = () => {
    setWeight('');
    setNotes('');
    setError('');
  };

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError('Enter a positive number for the cylinder weight');
      return;
    }
    if (Number.isFinite(preFill) && parsedWeight < preFill) {
      setError('Post-fill weight must be ≥ pre-fill weight');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await agentDeliveriesAPI.recordPostFill(delivery._id, {
        measuredWeight: parsedWeight,
        notes: notes.trim() || undefined,
      });
      const body = res?.data;
      const remnant = body?.data?.remnant?.remnantDeltaKg;
      success(
        remnant != null
          ? `Post-fill recorded — ${remnant}kg remnant credited`
          : 'Post-fill recorded'
      );
      reset();
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Failed to record post-fill weight';
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
      title="Record Post-Fill Weight"
      subtitle={
        delivery
          ? `Cylinder: ${delivery.cylinderTag || '—'} — Pre-fill: ${preFill ?? '—'} kg`
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
            leftIcon={<FaBalanceScale />}
          >
            Save Post-Fill
          </Button>
        </>
      }
    >
      <FormRow cols={1}>
        <FormField
          label="Measured cylinder weight (kg)"
          name="postFillWeight"
          type="number"
          step="0.01"
          min="0"
          value={weight}
          onChange={(e) => { setWeight(e.target.value); setError(''); }}
          required
          error={error}
          help={
            preview
              ? `Refilled: ${preview.refilled}kg${
                  preview.remnant != null ? ` · Remnant: ${preview.remnant}kg` : ''
                }`
              : 'Weigh the cylinder at the plant before returning to the customer.'
          }
          disabled={loading}
        />
        <FormField
          label="Notes (optional)"
          name="postFillNotes"
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

export default PostFillDialog;