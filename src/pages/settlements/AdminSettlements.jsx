// src/components/admin/settlements/AdminSettlements.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaPlus, FaEye,
} from 'react-icons/fa';
import { adminSettlementsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import SettlementDetail from './SettlementDetail';
import GenerateSettlementModal from './GenerateSettlementModal';
import '../../styles/modules/settlements.css';

const STATUS_VARIANT = {
  draft: 'neutral',
  pending_review: 'warning',
  approved: 'info',
  processing: 'info',
  paid: 'success',
  disputed: 'danger',
  cancelled: 'neutral',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'paid', label: 'Paid' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminSettlements = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        ...(status !== 'all' && { status }),
      };
      const res = await adminSettlementsAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load settlements');
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

  useLiveEvent('settlement.created', load);
  useLiveEvent('settlement.approved', load);
  useLiveEvent('settlement.paid', load);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      String(r.settlementNumber || '').toLowerCase().includes(q) ||
      String(r.plantId?.name || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const columns = [
    {
      key: 'settlementNumber',
      label: 'Settlement #',
      render: (r) => <strong>{r.settlementNumber || '—'}</strong>,
    },
    { key: 'plant', label: 'Plant', render: (r) => r.plantId?.name || '—' },
    {
      key: 'period',
      label: 'Period',
      render: (r) => (
        <span>
          {r.period?.startDate ? new Date(r.period.startDate).toLocaleDateString() : '—'}
          {' → '}
          {r.period?.endDate ? new Date(r.period.endDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'transactions',
      label: 'Txns',
      align: 'right',
      render: (r) => r.totals?.transactionCount ?? 0,
    },
    {
      key: 'netPayable',
      label: 'Net (₦)',
      align: 'right',
      render: (r) =>
        r.totals?.netPayable != null
          ? `₦${Number(r.totals.netPayable).toLocaleString()}`
          : '—',
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
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" leftIcon={<FaEye />} onClick={() => setSelected(r)}>
            Open
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="settle-page">
      <PageHeader
        title="Settlements"
        subtitle="Payable statements to partner plants"
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={<FaPlus />} onClick={() => setShowGenerate(true)}>
              Generate
            </Button>
          </>
        }
      />

      <Card padding="md">
        <div className="settle-filters">
          <div className="settle-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="settle-filters__group settle-filters__group--grow">
            <label>Search</label>
            <div className="settle-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Settlement # or plant name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="settle-error">
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
            <div className="settle-empty">
              <FaInbox />
              <p>No settlements yet</p>
            </div>
          }
        />
      )}

      <SettlementDetail
        settlement={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
      />

      <GenerateSettlementModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onSuccess={load}
      />
    </div>
  );
};

export default AdminSettlements;