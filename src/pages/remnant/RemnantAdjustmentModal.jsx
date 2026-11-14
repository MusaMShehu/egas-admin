// src/components/admin/remnant/RemnantAdjustmentModal.jsx
import React, { useEffect, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { adminRemnantAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';

const RemnantAdjustmentModal = ({ open, onClose, onSuccess }) => {
  const [type, setType] = useState('credit');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [cylinderId, setCylinderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: showError } = useSnackbar();

  useEffect(() => {
    if (!open) {
      setType('credit');
      setUserId('');
      setAmount('');
      setReason('');
      setCylinderId('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!userId.trim()) return setError('Customer ID is required');
    if (!Number.isFinite(parsed) || parsed <= 0) return setError('Amount must be a positive number');
    if (!reason.trim()) return setError('Reason is required');

    setLoading(true);
    setError('');
    try {
      const res = await adminRemnantAPI.createAdjustment({
        userId: userId.trim(),
        type,
        amount: parsed,
        reason: reason.trim(),
        cylinderId: cylinderId.trim() || undefined,
      });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Adjustment failed');
        showError(body.message || 'Adjustment failed');
        return;
      }
      success(
        `Adjustment applied — new balance ${body?.data?.newBalance ?? '—'}kg`
      );
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err?.message || 'Adjustment failed';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title="Manual Remnant Adjustment"
      subtitle="Credit or debit a customer's remnant balance. Requires a reason."
      size="md"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant={type === 'credit' ? 'success' : 'danger'}
            leftIcon={type === 'credit' ? <FaPlus /> : <FaMinus />}
            onClick={handleSubmit}
            loading={loading}
          >
            Apply {type === 'credit' ? 'credit' : 'debit'}
          </Button>
        </>
      }
    >
      <FormRow cols={2}>
        <FormField label="Type" name="type" as="select" value={type}
          onChange={(e) => setType(e.target.value)} disabled={loading}>
          <option value="credit">Credit (+)</option>
          <option value="debit">Debit (−)</option>
        </FormField>
        <FormField label="Customer ID" name="userId" value={userId}
          onChange={(e) => { setUserId(e.target.value); setError(''); }}
          required placeholder="Mongo ObjectId" disabled={loading} />
      </FormRow>

      <FormRow cols={2}>
        <FormField label="Amount (kg)" name="amount" type="number" step="0.01" min="0"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(''); }}
          required error={error} disabled={loading} />
        <FormField label="Cylinder ID (optional)" name="cylinderId" value={cylinderId}
          onChange={(e) => setCylinderId(e.target.value)}
          placeholder="Mongo ObjectId" disabled={loading} />
      </FormRow>

      <FormRow cols={1}>
        <FormField label="Reason" name="reason" as="textarea" rows={2}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          required disabled={loading} />
      </FormRow>
    </Modal>
  );
};

export default RemnantAdjustmentModal;