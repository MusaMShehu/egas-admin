// src/components/admin/cylinders/AdminCylinders.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaEye,
  FaFlag, FaArchive,
} from 'react-icons/fa';
import { adminCylindersAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import CylinderDetail from './CylinderDetail';
import '../../styles/modules/cylinders.css';

const STATUS_VARIANT = {
  active: 'success',
  in_transit: 'info',
  at_plant: 'warning',
  under_inspection: 'warning',
  retired: 'neutral',
  lost: 'danger',
  flagged: 'danger',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'at_plant', label: 'At plant' },
  { value: 'under_inspection', label: 'Under inspection' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'retired', label: 'Retired' },
  { value: 'lost', label: 'Lost' },
];

const AdminCylinders = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [tagCode, setTagCode] = useState('');
  const [selected, setSelected] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        ...(status !== 'all' && { status }),
        ...(tagCode && { tagCode: tagCode.trim() }),
      };
      const res = await adminCylindersAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load cylinders');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, tagCode, showError]);

  useEffect(() => { load(); }, [load]);

  useLiveEvent('cylinder.collected', load);
  useLiveEvent('cylinder.flagged', load);
  useLiveEvent('cylinder.retired', load);

  const filtered = useMemo(() => {
    if (!tagCode.trim()) return rows;
    const q = tagCode.trim().toLowerCase();
    return rows.filter((r) => String(r.tagCode || '').toLowerCase().includes(q));
  }, [rows, tagCode]);

  const columns = [
    {
      key: 'tagCode',
      label: 'Tag',
      render: (r) => <strong>{r.tagCode}</strong>,
    },
    { key: 'size', label: 'Size', render: (r) => r.size || '—' },
    {
      key: 'customer',
      label: 'Customer',
      render: (r) => {
        const u = r.userId;
        if (!u) return '—';
        return (
          <div>
            <div>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
            {u.phone && <div className="cyl__muted">{u.phone}</div>}
          </div>
        );
      },
    },
    {
      key: 'emptyWeight',
      label: 'Tare (kg)',
      render: (r) => (r.emptyWeight != null ? r.emptyWeight : '—'),
    },
    {
      key: 'lastMeasuredWeight',
      label: 'Last weight',
      render: (r) => (r.lastMeasuredWeight != null ? `${r.lastMeasuredWeight} kg` : '—'),
    },
    {
      key: 'currentCustodian',
      label: 'Custodian',
      render: (r) => (
        <Badge variant="neutral">
          {r.currentCustodian?.type || 'unknown'}
        </Badge>
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
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="cylinders-page">
      <PageHeader
        title="Cylinders"
        subtitle="Every registered cylinder and its current state"
        actions={
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      <Card padding="md" className="cyl-filters">
        <div className="cyl-filters__row">
          <div className="cyl-filters__group">
            <label htmlFor="cyl-status-filter">Status</label>
            <select
              id="cyl-status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="cyl-filters__group cyl-filters__group--grow">
            <label htmlFor="cyl-tag-search">Tag code</label>
            <div className="cyl-search">
              <FaSearch />
              <input
                id="cyl-tag-search"
                type="text"
                placeholder="e.g. EG-CYL-001245"
                value={tagCode}
                onChange={(e) => setTagCode(e.target.value)}
              />
            </div>
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
              <p>No cylinders match your filters</p>
            </div>
          }
        />
      )}

      <CylinderDetail
        cylinder={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
      />
    </div>
  );
};

export default AdminCylinders;