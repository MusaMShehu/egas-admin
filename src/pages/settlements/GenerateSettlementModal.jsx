// src/components/admin/settlements/GenerateSettlementModal.jsx
import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { adminSettlementsAPI, adminPlantsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';

const GenerateSettlementModal = ({ open, onClose, onSuccess }) => {
  const [plants, setPlants] = useState([]);
  const [plantId, setPlantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: showError } = useSnackbar();

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await adminPlantsAPI.list({ limit: 200, status: 'active' });
        const body = res?.data;
        if (body?.success) setPlants(body.data || []);
      } catch (err) {
        // silent
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPlantId('');
      setStartDate('');
      setEndDate('');
      setLabel('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!plantId) return setError('Select a plant');
    if (!startDate || !endDate) return setError('Both dates are required');
    if (new Date(startDate) >= new Date(endDate)) {
      return setError('Start date must be before end date');
    }

    setLoading(true);
    setError('');
    try {
      const res = await adminSettlementsAPI.generate({
        plantId,
        startDate,
        endDate,
        label: label.trim() || undefined,
      });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Generation failed');
        showError(body.message || 'Generation failed');
        return;
      }
      success('Settlement generated');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err?.message || 'Generation failed';
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
      title="Generate Settlement"
      subtitle="Aggregates all reconciled, unsettled transactions in the period"
      size="md"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" leftIcon={<FaFileInvoiceDollar />}
            onClick={handleSubmit} loading={loading}>
            Generate
          </Button>
        </>
      }
    >
      <FormRow cols={1}>
        <FormField label="Plant" name="plantId" as="select"
          value={plantId}
          onChange={(e) => { setPlantId(e.target.value); setError(''); }}
          required disabled={loading} error={error}>
          <option value="">Select a plant…</option>
          {plants.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} {p.code ? `(${p.code})` : ''}
            </option>
          ))}
        </FormField>
      </FormRow>

      <FormRow cols={2}>
        <FormField label="Start date" name="startDate" type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setError(''); }}
          required disabled={loading} />
        <FormField label="End date" name="endDate" type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setError(''); }}
          required disabled={loading} />
      </FormRow>

      <FormRow cols={1}>
        <FormField label="Label (optional)" name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. 01–07 Oct 2026"
          disabled={loading} />
      </FormRow>
    </Modal>
  );
};

export default GenerateSettlementModal;