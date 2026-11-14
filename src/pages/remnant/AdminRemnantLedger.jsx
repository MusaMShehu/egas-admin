// src/components/admin/remnant/AdminRemnantLedger.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaPlus,
  FaCheckCircle, FaBalanceScale,
} from 'react-icons/fa';
import { adminRemnantAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import RemnantAdjustmentModal from './RemnantAdjustmentModal';
import '../../styles/modules/remnant.css';

const EVENT_VARIANT = {
  measurement_added: 'primary',
  remnant_consumed: 'warning',
  remnant_credited: 'success',
  remnant_debited: 'danger',
  remnant_expired: 'neutral',
  adjustment: 'info',
};

const EVENT_FILTERS = [
  { value: 'all', label: 'All events' },
  { value: 'measurement_added', label: 'Measurement added' },
  { value: 'remnant_credited', label: 'Credited' },
  { value: 'remnant_debited', label: 'Debited' },
  { value: 'remnant_consumed', label: 'Consumed' },
  { value: 'remnant_expired', label: 'Expired' },
  { value: 'adjustment', label: 'Adjustment' },
];

const AdminRemnantLedger = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        ...(event !== 'all' && { event }),
      };
      const res = await adminRemnantAPI.listLedger(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load ledger');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [event]);

  useEffect(() => { load(); }, [load]);

  useLiveEvent('remnant.credited', load);
  useLiveEvent('remnant.debited', load);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const u = r.userId;
      const name = u
        ? `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`.toLowerCase()
        : '';
      return name.includes(q) || String(r.cylinderTag || '').toLowerCase().includes(q);
    });
  }, [rows, search]);

  const handleVerify = async (userId) => {
    if (!userId) return;
    setVerifyBusy(userId);
    setVerifyResult(null);
    try {
      const res = await adminRemnantAPI.verifyIntegrity(userId);
      const body = res?.data;
      if (body?.success === false) {
        showError(body.message || 'Verify failed');
        return;
      }
      const d = body?.data;
      setVerifyResult({ userId, ...d });
      if (d?.ok) success(`Ledger OK — balance ${d.balance}kg (${d.entries} entries)`);
      else showError(`Mismatch at ${d?.failedAt?.reason || 'unknown'}`);
    } catch (err) {
      showError(err?.message || 'Verify failed');
    } finally {
      setVerifyBusy(null);
    }
  };

  const columns = [
    {
      key: 'userId',
      label: 'Customer',
      render: (r) => {
        const u = r.userId;
        if (!u) return '—';
        return (
          <div>
            <div>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
            {u.email && <div className="rem-muted">{u.email}</div>}
          </div>
        );
      },
    },
    {
      key: 'event',
      label: 'Event',
      render: (r) => (
        <Badge variant={EVENT_VARIANT[r.event] || 'neutral'} dot>
          {String(r.event).replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'delta',
      label: 'Δ',
      align: 'right',
      render: (r) => {
        const v = Number(r.delta) || 0;
        return (
          <span className={v >= 0 ? 'rem-delta--pos' : 'rem-delta--neg'}>
            {v > 0 ? '+' : ''}{v} kg
          </span>
        );
      },
    },
    {
      key: 'newBalance',
      label: 'Balance',
      align: 'right',
      render: (r) => `${r.newBalance ?? '—'} kg`,
    },
    {
      key: 'cylinderTag',
      label: 'Cylinder',
      render: (r) => r.cylinderTag || '—',
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (r) => r.reason || '—',
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'),
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
            leftIcon={<FaBalanceScale />}
            onClick={() => handleVerify(r.userId?._id || r.userId)}
            loading={verifyBusy === (r.userId?._id || r.userId)}
          >
            Verify
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="remnant-page">
      <PageHeader
        title="Remnant Ledger"
        subtitle="Append-only ledger of every credit / debit / adjustment"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<FaSyncAlt />}
              onClick={load}
              loading={loading}
            >Refresh</Button>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              onClick={() => setShowAdjust(true)}
            >Manual Adjustment</Button>
          </>
        }
      />

      {verifyResult && (
        <Card padding="md" className={`rem-verify ${verifyResult.ok ? 'rem-verify--ok' : 'rem-verify--bad'}`}>
          <div className="rem-verify__icon">
            {verifyResult.ok ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>
          <div>
            <strong>{verifyResult.ok ? 'Ledger verified' : 'Ledger mismatch detected'}</strong>
            <div className="rem-verify__text">
              Balance {verifyResult.balance}kg across {verifyResult.entries} entries
              {verifyResult.failedAt && ` — failed at: ${verifyResult.failedAt.reason}`}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setVerifyResult(null)}>Dismiss</Button>
        </Card>
      )}

      <Card padding="md">
        <div className="rem-filters">
          <div className="rem-filters__group">
            <label>Event type</label>
            <select value={event} onChange={(e) => setEvent(e.target.value)}>
              {EVENT_FILTERS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div className="rem-filters__group rem-filters__group--grow">
            <label>Search</label>
            <div className="rem-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Customer name, email, cylinder tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rem-error">
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
          pagination={{ page: 1, pageSize: 25, total: filtered.length, onChange: () => {} }}
          emptyState={
            <div className="rem-empty">
              <FaInbox />
              <p>No ledger entries match your filters</p>
            </div>
          }
        />
      )}

      <RemnantAdjustmentModal
        open={showAdjust}
        onClose={() => setShowAdjust(false)}
        onSuccess={load}
      />
    </div>
  );
};

export default AdminRemnantLedger;