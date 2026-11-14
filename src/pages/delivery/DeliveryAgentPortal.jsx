// src/components/delivery/DeliveryAgentPortal.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaSyncAlt, FaTruck, FaHistory, FaExclamationTriangle, FaInbox } from 'react-icons/fa';
import { agentDeliveriesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import AgentDeliveryCard from '../../components/delivery/AgentDeliveryCard';
import PreFillDialog from '../../components/delivery/PreFillDialog';
import PostFillDialog from '../../components/delivery/PostFillDialog';
import '../../styles/modules/delivery.css';

/**
 * DeliveryAgentPortal — Delivery tab.
 *
 * Tabs:
 *   active   — assigned | accepted | out_for_delivery | paused
 *   delivered — delivered
 *   failed   — failed
 *
 * Card actions:
 *   - Accept (assigned)
 *   - Start delivery (accepted)
 *   - Record pre-fill (assigned | accepted, preFillWeightRecordId == null)
 *   - Record post-fill (accepted | out_for_delivery, preFillWeightRecordId != null, postFillWeightRecordId == null)
 *   - Mark delivered / partial / failed
 *   - Sync with subscription (if out of sync)
 *
 * Live updates: on 'delivery.post_fill_recorded' or 'delivery.pre_fill_recorded',
 *              the currently-affected delivery is re-fetched silently.
 */
const TABS = [
  { id: 'active',    label: 'Active',    statuses: ['assigned', 'accepted', 'out_for_delivery', 'paused'], icon: <FaTruck /> },
  { id: 'delivered', label: 'Delivered', statuses: ['delivered'], icon: <FaHistory /> },
  { id: 'failed',    label: 'Failed',    statuses: ['failed'], icon: <FaExclamationTriangle /> },
];

const DeliveryAgentPortal = () => {
  const [tab, setTab] = useState('active');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preFillFor, setPreFillFor] = useState(null);
  const [postFillFor, setPostFillFor] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // deliveryId currently being acted on

  const { success, error: showError } = useSnackbar();

  const activeTab = TABS.find((t) => t.id === tab);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await agentDeliveriesAPI.myDeliveries({
        status: activeTab.statuses.join(','),
      });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load deliveries');
        return;
      }
      setDeliveries(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  // Live: silently refresh the affected delivery
  useLiveEvent('delivery.pre_fill_recorded', (payload) => {
    if (!payload?.deliveryId) return;
    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === payload.deliveryId
          ? {
              ...d,
              preFillWeight: payload.measuredWeight ?? d.preFillWeight,
              plantWorkflowStatus: 'agent_collected_from_customer',
            }
          : d
      )
    );
  });

  useLiveEvent('delivery.post_fill_recorded', (payload) => {
    if (!payload?.deliveryId) return;
    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === payload.deliveryId
          ? {
              ...d,
              preFillWeight: payload.preFillWeight ?? d.preFillWeight,
              postFillWeight: payload.postFillWeight ?? d.postFillWeight,
              refilledKg: payload.refilledKg ?? d.refilledKg,
              remnantDeltaKg: payload.remnantDeltaKg ?? d.remnantDeltaKg,
              plantWorkflowStatus: 'remnant_credited',
            }
          : d
      )
    );
    success(
      `Remnant credited: ${payload.remnantDeltaKg ?? 0}kg`
    );
  });

  // ─── Actions
  const runAction = async (deliveryId, fn, successMsg) => {
    setActionLoading(deliveryId);
    try {
      await fn();
      if (successMsg) success(successMsg);
      await load();
    } catch (err) {
      showError(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = (d) =>
    runAction(d._id, () => agentDeliveriesAPI.accept(d._id), 'Delivery accepted');

  const handleOutForDelivery = (d) =>
    runAction(d._id, () => agentDeliveriesAPI.outForDelivery(d._id), 'Marked out for delivery');

  const handleDelivered = (d) => {
    if (!window.confirm(`Mark delivery to ${d.customerName} as delivered?`)) return;
    runAction(
      d._id,
      () => agentDeliveriesAPI.delivered(d._id, ''),
      'Delivery marked as delivered'
    );
  };

  const handleFailed = (d) => {
    const reason = window.prompt('Reason for failure?');
    if (!reason) return;
    runAction(
      d._id,
      () => agentDeliveriesAPI.failed(d._id, reason, ''),
      'Delivery marked as failed'
    );
  };

  const handleSync = (d) => {
    runAction(
      d._id,
      () => agentDeliveriesAPI.syncWithSubscription(d._id),
      'Delivery synced with subscription'
    );
  };

  // ─── Render
  const visibleDeliveries = useMemo(() => {
    if (!activeTab) return deliveries;
    return deliveries.filter((d) => activeTab.statuses.includes(d.status));
  }, [deliveries, activeTab]);

  return (
    <div className="delivery-page">
      <PageHeader
        title="My Deliveries"
        subtitle="Accept, weigh, and complete your assigned deliveries"
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

      <div className="delivery-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`delivery-tab-btn ${tab === t.id ? 'delivery-tab-btn--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
            <span className="delivery-tab-btn__count">
              {deliveries.filter((d) => t.statuses.includes(d.status)).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="delivery-list">
          {[1, 2, 3].map((i) => <SkeletonLoader key={i} type="card" />)}
        </div>
      ) : error ? (
        <EmptyState
          icon={<FaExclamationTriangle />}
          title="Couldn't load deliveries"
          description={error}
          action={<Button onClick={load}>Retry</Button>}
        />
      ) : visibleDeliveries.length === 0 ? (
        <EmptyState
          icon={<FaInbox />}
          title={`No ${tab} deliveries`}
          description={
            tab === 'active'
              ? 'You have no active deliveries right now.'
              : tab === 'delivered'
              ? 'Your delivered history will appear here.'
              : 'Failed deliveries will appear here.'
          }
        />
      ) : (
        <div className="delivery-list">
          {visibleDeliveries.map((d) => (
            <AgentDeliveryCard
              key={d._id}
              delivery={d}
              loading={actionLoading === d._id}
              onAccept={handleAccept}
              onOutForDelivery={handleOutForDelivery}
              onDelivered={handleDelivered}
              onFailed={handleFailed}
              onSync={handleSync}
              onRecordPreFill={setPreFillFor}
              onRecordPostFill={setPostFillFor}
            />
          ))}
        </div>
      )}

      <PreFillDialog
        delivery={preFillFor}
        onClose={() => setPreFillFor(null)}
        onSuccess={() => { setPreFillFor(null); load(); }}
      />
      <PostFillDialog
        delivery={postFillFor}
        onClose={() => setPostFillFor(null)}
        onSuccess={() => { setPostFillFor(null); load(); }}
      />
    </div>
  );
};

export default DeliveryAgentPortal;