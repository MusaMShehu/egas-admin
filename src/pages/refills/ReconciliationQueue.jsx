// src/components/admin/refills/ReconciliationQueue.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaSyncAlt, FaCheckCircle, FaExclamationTriangle, FaInbox } from 'react-icons/fa';
import { adminRefillsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const ReconciliationQueue = () => {
  const [rows, setRows] = useState([]);
  const [tolerance, setTolerance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolving, setResolving] = useState(null);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminRefillsAPI.reconciliationQueue({ limit: 200 });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load reconciliation queue');
        return;
      }
      setRows(body?.data || []);
      setTolerance(body?.toleranceKg ?? null);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const flagged = rows.filter((r) => r.requiresDispute).length;
    const totalKg = rows.reduce((s, r) => s + (Number(r.plantConfirmedQuantity) || 0), 0);
    return { flagged, totalKg: +totalKg.toFixed(2) };
  }, [rows]);

  const handleComplete = async (row) => {
    const note = window.prompt('Optional reconciliation note:') || '';
    setResolving(row._id);
    try {
      await adminRefillsAPI.completeReconciliation(row._id, note);
      success('Marked as reconciled');
      await load();
    } catch (err) {
      showError(err?.message || 'Failed to reconcile');
    } finally {
      setResolving(null);
    }
  };

  const columns = [
    {
      key: 'transactionNumber',
      label: 'Transaction #',
      render: (r) => <strong>{r.transactionNumber || '—'}</strong>,
    },
    {
      key: 'plant',
      label: 'Plant',
      render: (r) => r.plantId?.name || '—',
    },
    {
      key: 'cylinderTag',
      label: 'Cylinder',
      render: (r) => r.cylinderTag || '—',
    },
    {
      key: 'quantities',
      label: 'Requested / Confirmed',
      render: (r) => (
        <span>
          {r.requestedQuantity ?? '—'} / {r.plantConfirmedQuantity ?? '—'} kg
        </span>
      ),
    },
    {
      key: 'variance',
      label: 'Variance',
      render: (r) => {
        const v = Number(r.variance) || 0;
        const flagged = r.requiresDispute;
        return (
          <Badge variant={flagged ? 'danger' : 'neutral'} dot>
            {v > 0 ? '+' : ''}{v} kg
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge variant="warning">{String(r.status).replace(/_/g, ' ')}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <Button
          variant="success"
          size="sm"
          leftIcon={<FaCheckCircle />}
          loading={resolving === r._id}
          onClick={(e) => { e.stopPropagation(); handleComplete(r); }}
        >
          Mark reconciled
        </Button>
      ),
    },
  ];

  return (
    <div className="reconciliation">
      <div className="reconciliation__stats">
        <Card padding="md">
          <div className="refill-stat-label">Pending reconciliation</div>
          <div className="refill-stat-value">{rows.length}</div>
        </Card>
        <Card padding="md">
          <div className="refill-stat-label">Requires dispute</div>
          <div className="refill-stat-value refill-stat-value--danger">{stats.flagged}</div>
        </Card>
        <Card padding="md">
          <div className="refill-stat-label">Confirmed kg</div>
          <div className="refill-stat-value">{stats.totalKg} kg</div>
        </Card>
        <Card padding="md">
          <div className="refill-stat-label">Tolerance</div>
          <div className="refill-stat-value">
            {tolerance != null ? `${tolerance} kg` : '—'}
          </div>
        </Card>
      </div>

      <div className="reconciliation__toolbar">
        <div className="reconciliation__hint">
          <FaExclamationTriangle />
          <span>Confirmed transactions pending reconciliation. Variances beyond tolerance should be disputed first.</span>
        </div>
        <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <SkeletonLoader type="table" rows={5} columns={6} />
      ) : error ? (
        <Card padding="md">
          <div className="refills-error">
            <FaExclamationTriangle />
            <p>{error}</p>
            <Button onClick={load}>Retry</Button>
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card padding="lg">
          <div className="refills-empty">
            <FaInbox />
            <p>Nothing to reconcile right now</p>
          </div>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          pagination={{ page: 1, pageSize: 20, total: rows.length, onChange: () => {} }}
        />
      )}
    </div>
  );
};

export default ReconciliationQueue;