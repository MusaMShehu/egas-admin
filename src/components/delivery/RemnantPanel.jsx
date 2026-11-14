// src/components/delivery/RemnantPanel.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaSyncAlt, FaRecycle, FaExclamationTriangle, FaInbox, FaWeightHanging } from 'react-icons/fa';
import { agentDeliveriesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SkeletonLoader from '../ui/SkeletonLoader';

/**
 * RemnantPanel — the agent's view of remnant-relevant deliveries.
 *
 * The agent doesn't own remnant balance (that's the customer's). What the
 * agent needs to see:
 *   - which of their deliveries have resulted in a remnant credit
 *   - what kg was credited per customer
 *   - which deliveries still need post-fill to close the remnant loop
 *
 * Backend: GET /delivery/agent/remnant-deliveries
 */
const RemnantPanel = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await agentDeliveriesAPI.remnantDeliveries({ limit: 50 });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load remnant deliveries');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const pending = rows.filter(
      (r) => r.preFillWeightRecordId && !r.postFillWeightRecordId
    ).length;
    const credited = rows.filter((r) => r.remnantLedgerEntryId).length;
    const totalKg = rows.reduce(
      (s, r) => s + (Number(r.remnantDeltaKg) || 0),
      0
    );
    return { pending, credited, totalKg: +totalKg.toFixed(3) };
  }, [rows]);

  return (
    <div className="delivery-page">
      <PageHeader
        title="My Remnant Activity"
        subtitle="Deliveries where gas was credited back to a customer's remnant balance"
        actions={
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      <div className="remnant-stats">
        <Card padding="md" className="remnant-stat">
          <div className="remnant-stat__label">Pending post-fill</div>
          <div className="remnant-stat__value">{stats.pending}</div>
        </Card>
        <Card padding="md" className="remnant-stat">
          <div className="remnant-stat__label">Remnant credited</div>
          <div className="remnant-stat__value">{stats.credited}</div>
        </Card>
        <Card padding="md" className="remnant-stat remnant-stat--remnant">
          <div className="remnant-stat__label">Total kg credited</div>
          <div className="remnant-stat__value">{stats.totalKg} kg</div>
        </Card>
      </div>

      {loading ? (
        <SkeletonLoader type="table" rows={5} columns={5} />
      ) : error ? (
        <EmptyState
          icon={<FaExclamationTriangle />}
          title="Couldn't load remnant activity"
          description={error}
          action={<Button onClick={load}>Retry</Button>}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<FaRecycle />}
          title="No remnant activity yet"
          description="Remnant credits appear here after you record post-fill weights at the plant."
        />
      ) : (
        <div className="remnant-list">
          {rows.map((r) => (
            <Card key={r._id} padding="md">
              <div className="remnant-row">
                <div className="remnant-row__info">
                  <div className="remnant-row__title">
                    {r.customerName}
                    {r.remnantLedgerEntryId ? (
                      <Badge variant="remnant" size="sm" dot>Credited</Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>Pending</Badge>
                    )}
                  </div>
                  <div className="remnant-row__meta">
                    <span>Cylinder: {r.cylinderTag || '—'}</span>
                    <span>
                      Pre: {r.preFillWeight != null ? `${r.preFillWeight}kg` : '—'}
                    </span>
                    <span>
                      Post: {r.postFillWeight != null ? `${r.postFillWeight}kg` : '—'}
                    </span>
                  </div>
                </div>
                <div className="remnant-row__delta">
                  {r.remnantDeltaKg != null ? (
                    <>
                      <FaWeightHanging />
                      <span>+{r.remnantDeltaKg}kg</span>
                    </>
                  ) : (
                    <span className="remnant-row__delta--na">—</span>
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

export default RemnantPanel;