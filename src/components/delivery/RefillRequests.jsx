// src/components/delivery/RefillRequests.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { FaSyncAlt, FaPlus, FaRedo, FaCheckCircle, FaExclamationTriangle, FaInbox } from 'react-icons/fa';
import { agentRefillsAPI, agentDeliveriesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SkeletonLoader from '../ui/SkeletonLoader';

const STATUS_VARIANT = {
  created:    'neutral',
  received:   'info',
  inspection_pending: 'warning',
  approved:   'info',
  rejected:   'danger',
  refilling:  'info',
  quantity_recorded: 'warning',
  confirmed:  'success',
  disputed:   'danger',
  reconciled: 'primary',
  settled:    'success',
  cancelled:  'neutral',
};

const RefillRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await agentRefillsAPI.myRequests({ limit: 50 });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load refill requests');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Live: refresh when any request changes status
  useLiveEvent('refill_request.received', load);
  useLiveEvent('refill_request.approved', load);
  useLiveEvent('refill_request.rejected', load);
  useLiveEvent('refill_request.confirmed', load);

  const handleCollect = (r) => {
    setActionId(r._id);
    agentRefillsAPI.collect(r._id, null)
      .then(() => { success('Marked as collected'); load(); })
      .catch((err) => showError(err?.message || 'Failed to collect'))
      .finally(() => setActionId(null));
  };

  const handleRetry = (r) => {
    const newPlantId = window.prompt('New plant ID to retry with?');
    if (!newPlantId) return;
    setActionId(r._id);
    agentRefillsAPI.retry(r._id, newPlantId, '')
      .then(() => { success('Retry requested'); load(); })
      .catch((err) => showError(err?.message || 'Failed to retry'))
      .finally(() => setActionId(null));
  };

  const handleEscalate = (r) => {
    const reason = window.prompt('Reason for escalation?');
    if (!reason) return;
    setActionId(r._id);
    agentRefillsAPI.escalate(r._id, reason)
      .then(() => { success('Escalated to E-GAS operations'); load(); })
      .catch((err) => showError(err?.message || 'Failed to escalate'))
      .finally(() => setActionId(null));
  };

  return (
    <div className="delivery-page">
      <PageHeader
        title="Refill Requests"
        subtitle="Requests you've sent to partner plants"
        actions={
          <Button
            variant="outline"
            leftIcon={<FaSyncAlt />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {loading ? (
        <SkeletonLoader type="table" rows={5} columns={5} />
      ) : error ? (
        <EmptyState
          icon={<FaExclamationTriangle />}
          title="Couldn't load requests"
          description={error}
          action={<Button onClick={load}>Retry</Button>}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<FaInbox />}
          title="No refill requests yet"
          description="Create one from an active delivery when you're ready to send the cylinder to a plant."
        />
      ) : (
        <div className="refill-request-list">
          {rows.map((r) => (
            <Card key={r._id} padding="md">
              <div className="refill-request">
                <div className="refill-request__header">
                  <div>
                    <div className="refill-request__number">
                      {r.requestNumber}
                      {r.attemptNumber > 1 && (
                        <Badge variant="warning" size="sm">Retry #{r.attemptNumber}</Badge>
                      )}
                    </div>
                    <div className="refill-request__meta">
                      <span>Cylinder: {r.cylinderTag || '—'}</span>
                      <span>Requested: {r.requestedQuantity ?? '—'} kg</span>
                      {r.plantConfirmedQuantity != null && (
                        <span>Filled: {r.plantConfirmedQuantity} kg</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status] || 'neutral'} dot>
                    {r.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="refill-request__actions">
                  {r.status === 'confirmed' && (
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<FaCheckCircle />}
                      loading={actionId === r._id}
                      onClick={() => handleCollect(r)}
                    >
                      Collect Cylinder
                    </Button>
                  )}
                  {r.status === 'rejected' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<FaRedo />}
                      loading={actionId === r._id}
                      onClick={() => handleRetry(r)}
                    >
                      Retry With Another Plant
                    </Button>
                  )}
                  {['created', 'received', 'approved', 'rejected', 'refilling'].includes(r.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FaExclamationTriangle />}
                      loading={actionId === r._id}
                      onClick={() => handleEscalate(r)}
                    >
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefillRequests;