// src/components/admin/disputes/AdminDisputes.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaEye,
} from 'react-icons/fa';
import { adminDisputesAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import DisputeDetail from './DisputeDetail';
import '../../styles/modules/disputes.css';

const STATUS_VARIANT = {
  open: 'warning',
  under_review: 'info',
  resolved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminDisputes = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        ...(status !== 'all' && { status }),
      };
      const res = await adminDisputesAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load disputes');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, showError]);

  useEffect(() => { load(); }, [load]);

  useLiveEvent('dispute.created', load);
  useLiveEvent('dispute.resolved', load);
  useLiveEvent('dispute.commented', load);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      String(r.disputeNumber || '').toLowerCase().includes(q) ||
      String(r.plantId?.name || '').toLowerCase().includes(q) ||
      String(r.requestId?.requestNumber || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const columns = [
    {
      key: 'disputeNumber',
      label: 'Dispute #',
      render: (r) => <strong>{r.disputeNumber || '—'}</strong>,
    },
    {
      key: 'plant',
      label: 'Plant',
      render: (r) => r.plantId?.name || '—',
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
        const exceeds = Math.abs(v) > (r.tolerance || 0.2);
        return (
          <Badge variant={exceeds ? 'danger' : 'neutral'} dot>
            {v > 0 ? '+' : ''}{v} kg
          </Badge>
        );
      },
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
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FaEye />}
            onClick={() => setSelected(r)}
          >Open</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="disputes-page">
      <PageHeader
        title="Disputes"
        subtitle="Variance disputes between plant-confirmed and requested quantities"
        actions={
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      <Card padding="md">
        <div className="disp-filters">
          <div className="disp-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="disp-filters__group disp-filters__group--grow">
            <label>Search</label>
            <div className="disp-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Dispute #, plant, request #…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="disp-error">
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
            <div className="disp-empty">
              <FaInbox />
              <p>No disputes match your filters</p>
            </div>
          }
        />
      )}

      <DisputeDetail
        dispute={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
      />
    </div>
  );
};

export default AdminDisputes;