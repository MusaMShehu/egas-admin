// src/components/admin/refills/AdminRefills.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaFilter, FaExclamationTriangle, FaInbox,
  FaEye, FaTimesCircle, FaCheckCircle, FaUndo,
} from 'react-icons/fa';
import { adminRefillsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AdminRefillDetail from './AdminRefillDetail';
import ReconciliationQueue from './ReconciliationQueue';
import '../../styles/modules/refills.css';

const STATUS_VARIANT = {
  created:           'neutral',
  received:          'info',
  inspection_pending:'warning',
  approved:          'info',
  rejected:          'danger',
  refilling:         'info',
  quantity_recorded: 'warning',
  confirmed:         'success',
  disputed:          'danger',
  reconciled:        'primary',
  settled:           'success',
  cancelled:         'neutral',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'created', label: 'Created' },
  { value: 'received', label: 'Received' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'quantity_recorded', label: 'Quantity recorded' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'settled', label: 'Settled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminRefills = () => {
  const [tab, setTab] = useState('requests'); // 'requests' | 'reconciliation'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        ...(status !== 'all' && { status }),
      };
      const res = await adminRefillsAPI.list(params);
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
  }, [status]);

  useEffect(() => { load(); }, [load]);

  // Live: refresh whenever any refill flow event fires
  useLiveEvent('refill_request.created', load);
  useLiveEvent('refill_request.received', load);
  useLiveEvent('refill_request.approved', load);
  useLiveEvent('refill_request.rejected', load);
  useLiveEvent('refill_request.confirmed', load);
  useLiveEvent('cylinder.collected', load);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      String(r.requestNumber || '').toLowerCase().includes(q) ||
      String(r.cylinderTag || '').toLowerCase().includes(q) ||
      String(r.plantId?.name || '').toLowerCase().includes(q) ||
      String(r.agentId?.firstName || '').toLowerCase().includes(q) ||
      String(r.agentId?.lastName || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget._id);
    try {
      await adminRefillsAPI.cancel(cancelTarget._id, cancelReason || 'Cancelled by admin');
      success('Refill request cancelled');
      setCancelTarget(null);
      setCancelReason('');
      await load();
    } catch (err) {
      showError(err?.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'requestNumber',
      label: 'Request #',
      render: (r) => (
        <div className="refill-num">
          <strong>{r.requestNumber}</strong>
          {r.attemptNumber > 1 && (
            <Badge variant="warning" size="sm">Retry #{r.attemptNumber}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'plant',
      label: 'Plant',
      render: (r) => (
        <div className="refill-plant">
          <div>{r.plantId?.name || '—'}</div>
          <div className="refill-plant__code">{r.plantId?.code || ''}</div>
        </div>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (r) =>
        r.agentId
          ? `${r.agentId.firstName || ''} ${r.agentId.lastName || ''}`.trim() || '—'
          : '—',
    },
    {
      key: 'cylinderTag',
      label: 'Cylinder',
      render: (r) => r.cylinderTag || '—',
    },
    {
      key: 'quantities',
      label: 'Qty (kg)',
      render: (r) => (
        <span>
          Req {r.requestedQuantity ?? '—'}
          {' · '}
          Filled {r.plantConfirmedQuantity ?? '—'}
          {r.variance != null && r.variance !== 0 && (
            <Badge
              variant={Math.abs(r.variance) > 0.2 ? 'danger' : 'neutral'}
              size="sm"
              style={{ marginLeft: 'var(--sp-1)' }}
            >
              {r.variance > 0 ? '+' : ''}{r.variance}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] || 'neutral'} dot>
          {String(r.status).replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div className="refill-row-actions" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FaEye />}
            onClick={() => setSelected(r)}
          >
            View
          </Button>
          {r.status === 'created' && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FaTimesCircle />}
              onClick={() => setCancelTarget(r)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="refills-page">
      <PageHeader
        title="Refill Requests"
        subtitle="Every plant refill request across all plants"
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

      <div className="refills-tabs">
        <button
          type="button"
          className={`refills-tab ${tab === 'requests' ? 'refills-tab--active' : ''}`}
          onClick={() => setTab('requests')}
        >
          All requests
          <span className="refills-tab__count">{rows.length}</span>
        </button>
        <button
          type="button"
          className={`refills-tab ${tab === 'reconciliation' ? 'refills-tab--active' : ''}`}
          onClick={() => setTab('reconciliation')}
        >
          <FaUndo /> Reconciliation
        </button>
      </div>

      {tab === 'requests' && (
        <>
          <Card padding="md" className="refills-filters">
            <div className="refills-filters__row">
              <div className="refills-filters__group">
                <label htmlFor="refill-status-filter">Status</label>
                <select
                  id="refill-status-filter"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="refills-filters__group refills-filters__group--grow">
                <label htmlFor="refill-search">Search</label>
                <input
                  id="refill-search"
                  type="text"
                  placeholder="Request #, cylinder tag, plant, agent…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {error ? (
            <div className="refills-error">
              <FaExclamationTriangle />
              <p>{error}</p>
              <Button onClick={load}>Retry</Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              loading={loading}
              rowKey={(r) => r._id}
              onRowClick={(r) => setSelected(r)}
              pagination={{ page: 1, pageSize: 20, total: filtered.length, onChange: () => {} }}
              emptyState={
                <div className="refills-empty">
                  <FaInbox />
                  <p>No refill requests match your filters</p>
                </div>
              }
            />
          )}
        </>
      )}

      {tab === 'reconciliation' && <ReconciliationQueue />}

      <AdminRefillDetail
        request={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => { setCancelTarget(null); setCancelReason(''); }}
        title={`Cancel ${cancelTarget?.requestNumber}?`}
        message="This is only possible before the plant receives the cylinder. The delivery will be reset to 'not_started'."
        confirmLabel="Cancel request"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={handleCancel}
      />
    </div>
  );
};

export default AdminRefills;