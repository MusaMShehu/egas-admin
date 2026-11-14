
continue from where chat 3 stopped
Continuing Batch 7 — Where Chat 3 Stopped
Chat 3 was cut off mid-file in UserDetailModal.jsx at the Address row. I'll complete that file, then deliver the remaining 6 files + CSS deltas.

File 3 (completed) — src/pages/admin/users/UserDetailModal.jsx
jsx
// src/pages/admin/users/UserDetailModal.jsx
import React from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar,
  FaVenusMars, FaEdit, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt,
  FaWallet, FaMap, FaClipboardList, FaHistory,
} from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import '../../../styles/modules/users.css';

const ROLE_VARIANT = {
  admin: 'danger', 'super-admin': 'danger', superadmin: 'danger',
  customer_care: 'info', delivery: 'warning',
  plant_admin: 'success', plant_supervisor: 'success',
  plant_operator: 'success', plant_staff: 'success',
  user: 'neutral',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const Row = ({ icon, label, value, link }) => (
  <div className="user-detail__row">
    <div className="user-detail__row-icon">{icon}</div>
    <div className="user-detail__row-body">
      <div className="user-detail__row-label">{label}</div>
      <div className="user-detail__row-value">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="user-detail__link">
            {value} <FaExternalLinkAlt />
          </a>
        ) : value || '—'}
      </div>
    </div>
  </div>
);

const UserDetailModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  const profileUrl =
    user.profileImage?.secure_url || user.profileImage?.url || null;
  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U';

  const gps = user.gpsCoordinates?.coordinates;
  const hasGps = Array.isArray(gps) && gps.length === 2;
  const gpsLink = hasGps
    ? `https://www.google.com/maps?q=${gps[1]},${gps[0]}`
    : null;

  const walletBalance =
    user.wallet?.balance ?? user.walletBalance ?? null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
      subtitle={user.email}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="warning" leftIcon={<FaEdit />} onClick={() => onEdit?.(user)}>
            Edit user
          </Button>
        </>
      }
    >
      <div className="user-detail">
        {/* Hero */}
        <div className="user-detail__hero">
          <div className="user-detail__avatar">
            {profileUrl ? (
              <img src={profileUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="user-detail__hero-info">
            <h3>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</h3>
            <div className="user-detail__pills">
              <Badge variant={ROLE_VARIANT[user.role] || 'neutral'}>{user.role || '—'}</Badge>
              <Badge variant={user.isActive ? 'success' : 'neutral'} dot>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {user.emailVerified
                ? <Badge variant="success" size="sm"><FaCheckCircle /> Email verified</Badge>
                : <Badge variant="warning" size="sm"><FaTimesCircle /> Email unverified</Badge>}
              {user.phoneVerified
                ? <Badge variant="success" size="sm"><FaCheckCircle /> Phone verified</Badge>
                : <Badge variant="warning" size="sm"><FaTimesCircle /> Phone unverified</Badge>}
            </div>
          </div>
        </div>

        {/* Wallet tile */}
        {walletBalance != null && (
          <Card padding="md">
            <div className="user-detail__wallet">
              <div>
                <div className="user-detail__row-label">Wallet balance</div>
                <div className="user-detail__wallet-value">
                  ₦{Number(walletBalance).toLocaleString()}
                </div>
              </div>
              <FaWallet className="user-detail__wallet-icon" />
            </div>
          </Card>
        )}

        {/* Identity grid */}
        <Card padding="md" title="Identity">
          <div className="user-detail__grid">
            <Row icon={<FaEnvelope />} label="Email" value={user.email || '—'} />
            <Row icon={<FaPhone />} label="Phone" value={user.phone || '—'} />
            <Row icon={<FaCalendar />} label="Date of birth"
              value={user.dob ? new Date(user.dob).toLocaleDateString() : '—'} />
            <Row icon={<FaVenusMars />} label="Gender" value={user.gender || '—'} />
          </div>
        </Card>

        {/* Location */}
        <Card padding="md" title="Location">
          <div className="user-detail__grid">
            <Row icon={<FaMapMarkerAlt />} label="Address" value={user.address || '—'} />
            <Row icon={<FaMap />} label="City / State"
              value={[user.city, user.state].filter(Boolean).join(', ') || '—'} />
            <Row icon={<FaMapMarkerAlt />} label="Country" value={user.country || '—'} />
            <Row
              icon={<FaMapMarkerAlt />}
              label="GPS coordinates"
              value={hasGps ? `${gps[1].toFixed(5)}, ${gps[0].toFixed(5)}` : '—'}
              link={gpsLink}
            />
          </div>
        </Card>

        {/* Account metadata */}
        <Card padding="md" title="Account">
          <div className="user-detail__grid">
            <Row icon={<FaUser />} label="User ID" value={user._id} />
            <Row icon={<FaClipboardList />} label="Role" value={user.role || '—'} />
            <Row icon={<FaHistory />} label="Created" value={fmt(user.createdAt)} />
            <Row icon={<FaHistory />} label="Last updated" value={fmt(user.updatedAt)} />
            <Row icon={<FaHistory />} label="Last login" value={fmt(user.lastLogin)} />
            <Row icon={<FaCalendar />} label="Member since"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
File 4 — src/pages/admin/deliveries/AdminDeliveries.jsx
Date filter (today/yesterday/tomorrow/custom), compact stats, page-size selector, minimal table, full detail modal.

jsx
// src/pages/admin/deliveries/AdminDeliveries.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaSearch, FaUserCheck, FaSync, FaEye,
  FaExclamationTriangle, FaInbox, FaCalendarAlt,
} from 'react-icons/fa';
import { adminDeliveriesAPI, adminUsersAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissions } from '../../../hooks/usePermissions';
import { useLiveEvent } from '../../../contexts/LiveContext';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import FormRow from '../../../components/ui/FormRow';
import EmptyState from '../../../components/ui/EmptyState';
import DeliveryDetailModal from './DeliveryDetailModal';
import '../../../styles/modules/deliveries.css';

const STATUS_VARIANT = {
  pending: 'neutral', assigned: 'info', accepted: 'warning',
  out_for_delivery: 'primary', delivered: 'success', failed: 'danger',
  cancelled: 'neutral', paused: 'warning',
};

const STATUS_OPTIONS = [
  'pending', 'assigned', 'accepted', 'out_for_delivery',
  'delivered', 'failed', 'cancelled', 'paused',
];

const PAGE_SIZES = [5, 10, 25, 50];

const DATE_PRESETS = [
  { id: 'all',       label: 'All dates' },
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'tomorrow',  label: 'Tomorrow' },
  { id: 'custom',    label: 'Custom' },
];

const toISODate = (d) => d.toISOString().slice(0, 10);

const presetRange = (preset) => {
  const now = new Date();
  const day = (offset) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return toISODate(d);
  };
  if (preset === 'today')     return { start: day(0), end: day(0) };
  if (preset === 'yesterday') return { start: day(-1), end: day(-1) };
  if (preset === 'tomorrow')  return { start: day(1), end: day(1) };
  return { start: '', end: '' };
};

const AdminDeliveries = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignFor, setAssignFor] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(null);

  const { success, error: showError } = useSnackbar();
  const { hasPermission } = usePermissions();

  const dateRange = useMemo(() => {
    if (datePreset === 'custom') return { start: customStart, end: customEnd };
    return presetRange(datePreset);
  }, [datePreset, customStart, customEnd]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page, limit,
        ...(status !== 'all' && { status }),
        ...(search.trim() && { search: search.trim() }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      };
      const res = await adminDeliveriesAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load deliveries');
        return;
      }
      setRows(body?.data || []);
      setTotal(body?.total ?? body?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, dateRange]);

  const loadAgents = useCallback(async () => {
    try {
      const res = await adminUsersAPI.list({ role: 'delivery', limit: 200 });
      setAgents(res?.data?.data?.users || res?.data?.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadAgents(); }, [loadAgents]);

  useLiveEvent('delivery.pre_fill_recorded', load);
  useLiveEvent('delivery.post_fill_recorded', load);
  useLiveEvent('delivery.status_changed', load);

  const handleAssign = async (agentId) => {
    if (!assignFor || !agentId) return;
    setBusy(assignFor._id);
    try {
      await adminDeliveriesAPI.assign(assignFor._id, agentId);
      success('Delivery assigned');
      setAssignFor(null);
      await load();
    } catch (err) {
      showError(err?.message || 'Assign failed');
    } finally { setBusy(null); }
  };

  const handleGenerate = async () => {
    setBusy('__generate');
    try {
      const res = await adminDeliveriesAPI.generateSchedules(7);
      success(`Generated ${res?.data?.generatedCount ?? 0} schedules`);
      await load();
    } catch (err) {
      showError(err?.message || 'Generation failed');
    } finally { setBusy(null); }
  };

  const handleSync = async (d) => {
    setBusy(d._id);
    try {
      await adminDeliveriesAPI.syncWithSubscription(d._id);
      success('Delivery synced');
      await load();
    } catch (err) {
      showError(err?.message || 'Sync failed');
    } finally { setBusy(null); }
  };

  const stats = useMemo(() => ({
    total,
    onPage: rows.length,
    pending: rows.filter((d) => d.status === 'pending').length,
    active: rows.filter((d) => ['assigned', 'accepted', 'out_for_delivery'].includes(d.status)).length,
    delivered: rows.filter((d) => d.status === 'delivered').length,
    failed: rows.filter((d) => d.status === 'failed').length,
  }), [rows, total]);

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (d) => (
        <div>
          <div><strong>{d.customerName}</strong></div>
          <div className="del-muted">{d.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'deliveryDate',
      label: 'Date',
      render: (d) =>
        d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : '—',
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (d) => {
        const a = d.deliveryAgent;
        if (!a) return <span className="del-muted">unassigned</span>;
        return `${a.firstName || ''} ${a.lastName || ''}`.trim();
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (d) => (
        <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} dot>
          {String(d.status).replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'remnant',
      label: 'Remnant',
      align: 'right',
      render: (d) =>
        d.remnantDeltaKg > 0 ? (
          <Badge variant="remnant" size="sm">+{d.remnantDeltaKg}kg</Badge>
        ) : (
          <span className="del-muted">—</span>
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (d) => (
        <div className="del-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="info" size="sm" leftIcon={<FaEye />}
            onClick={() => setViewing(d)}>View</Button>
          {!d.deliveryAgent && d.status === 'pending' && hasPermission('deliveries:assign') && (
            <Button variant="primary" size="sm" leftIcon={<FaUserCheck />}
              onClick={() => setAssignFor(d)}>Assign</Button>
          )}
          {d.subscriptionId && hasPermission('deliveries:sync') && (
            <Button variant="warning" size="sm" leftIcon={<FaSync />}
              loading={busy === d._id}
              onClick={() => handleSync(d)}>Sync</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="deliveries-page">
      <PageHeader
        title="Deliveries"
        subtitle={`${total.toLocaleString()} total · showing ${stats.onPage}`}
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
            {hasPermission('deliveries:generate') && (
              <Button variant="primary" leftIcon={<FaPlus />}
                onClick={handleGenerate}
                loading={busy === '__generate'}>
                Generate
              </Button>
            )}
          </>
        }
      />

      <div className="deliveries-stats">
        <div className="mini-stat mini-stat--primary">
          <div className="mini-stat__value">{stats.total}</div>
          <div className="mini-stat__label">Total</div>
        </div>
        <div className="mini-stat mini-stat--warning">
          <div className="mini-stat__value">{stats.pending}</div>
          <div className="mini-stat__label">Pending (page)</div>
        </div>
        <div className="mini-stat mini-stat--info">
          <div className="mini-stat__value">{stats.active}</div>
          <div className="mini-stat__label">Active (page)</div>
        </div>
        <div className="mini-stat mini-stat--success">
          <div className="mini-stat__value">{stats.delivered}</div>
          <div className="mini-stat__label">Delivered (page)</div>
        </div>
        <div className="mini-stat mini-stat--danger">
          <div className="mini-stat__value">{stats.failed}</div>
          <div className="mini-stat__label">Failed (page)</div>
        </div>
      </div>

      <Card padding="md">
        <div className="del-filters">
          <div className="del-filters__group del-filters__group--grow">
            <label>Search</label>
            <div className="del-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Customer, address, plan…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="del-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="del-filters__group">
            <label><FaCalendarAlt /> Date</label>
            <select value={datePreset}
              onChange={(e) => { setDatePreset(e.target.value); setPage(1); }}>
              {DATE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          {datePreset === 'custom' && (
            <>
              <div className="del-filters__group">
                <label>From</label>
                <input type="date" value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setPage(1); }} />
              </div>
              <div className="del-filters__group">
                <label>To</label>
                <input type="date" value={customEnd}
                  onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }} />
              </div>
            </>
          )}
          <div className="del-filters__group">
            <label>Page size</label>
            <select value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load deliveries"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          rowKey={(d) => d._id}
          onRowClick={(d) => setViewing(d)}
          emptyState={
            <div className="del-empty">
              <FaInbox />
              <p>No deliveries match your filters</p>
            </div>
          }
          pagination={{ page, pageSize: limit, total, onChange: setPage }}
        />
      )}

      {assignFor && (
        <Modal
          open
          onClose={busy ? () => {} : () => setAssignFor(null)}
          title={`Assign ${assignFor.customerName}`}
          size="sm"
          footer={<Button variant="secondary" onClick={() => setAssignFor(null)}>Cancel</Button>}
        >
          <FormRow cols={1}>
            <FormField label="Delivery agent" name="agentId" as="select"
              onChange={(e) => handleAssign(e.target.value)}
              disabled={busy === assignFor._id}>
              <option value="">Select an agent…</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.firstName} {a.lastName} — {a.phone}
                </option>
              ))}
            </FormField>
          </FormRow>
        </Modal>
      )}

      {viewing && (
        <DeliveryDetailModal
          delivery={viewing}
          onClose={() => setViewing(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
};

export default AdminDeliveries;
File 5 — src/pages/admin/deliveries/DeliveryDetailModal.jsx
Full delivery detail: delivery + customer + agent + plan + weights + cylinder + refill request + timeline.

jsx
// src/pages/admin/deliveries/DeliveryDetailModal.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaWeightHanging,
  FaScaleBalanced, FaRecycle, FaIndustry, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaSyncAlt,
} from 'react-icons/fa';
import { adminDeliveriesAPI } from '../../../api/endpoints';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';

const STATUS_VARIANT = {
  pending: 'neutral', assigned: 'info', accepted: 'warning',
  out_for_delivery: 'primary', delivered: 'success', failed: 'danger',
  cancelled: 'neutral', paused: 'warning',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const Cell = ({ label, value, danger }) => (
  <div className="dd-cell">
    <div className="dd-cell__label">{label}</div>
    <div className={`dd-cell__value ${danger ? 'is-danger' : ''}`}>{value ?? '—'}</div>
  </div>
);

const Step = ({ done, at, label, icon }) => (
  <div className={`dd-step ${done ? 'dd-step--done' : ''}`}>
    <div className="dd-step__icon">{done ? <FaCheckCircle /> : <FaClock />}</div>
    <div className="dd-step__body">
      <div className="dd-step__label">{label}</div>
      <div className="dd-step__time">{done ? fmt(at) : 'Pending'}</div>
    </div>
  </div>
);

const DeliveryDetailModal = ({ delivery, onClose, onRefresh }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!delivery?._id) return;
    try {
      setLoading(true);
      const res = await adminDeliveriesAPI.getTimeline(delivery._id);
      const body = res?.data;
      if (body?.success) setDetail(body.data);
    } catch { /* use base delivery */ }
    finally { setLoading(false); }
  }, [delivery?._id]);

  useEffect(() => { load(); }, [load]);

  const d = detail?.delivery || delivery;
  const weights = detail?.weights || [];
  const refill = detail?.refillRequest;
  const cylinder = detail?.cylinder;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Delivery — ${d.customerName}`}
      subtitle={d.deliveryDate ? fmt(d.deliveryDate) : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        </>
      }
    >
      {loading && !detail ? (
        <SkeletonLoader lines={10} />
      ) : (
        <div className="dd">
          <div className="dd__status">
            <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} dot>
              {String(d.status).replace(/_/g, ' ')}
            </Badge>
            {d.remnantDeltaKg > 0 && (
              <Badge variant="remnant" dot>+{d.remnantDeltaKg}kg remnant</Badge>
            )}
          </div>

          <Card padding="md" title="Customer">
            <div className="dd__grid">
              <Cell label="Name" value={d.customerName} />
              <Cell label="Phone" value={d.customerPhone} />
              <Cell label="Address" value={d.address} />
              <Cell label="Scheduled" value={fmt(d.deliveryDate)} />
            </div>
          </Card>

          <Card padding="md" title="Agent & Plan">
            <div className="dd__grid">
              <Cell label="Agent"
                value={d.deliveryAgent
                  ? `${d.deliveryAgent.firstName || ''} ${d.deliveryAgent.lastName || ''}`.trim()
                  : 'Unassigned'} />
              <Cell label="Agent phone" value={d.deliveryAgent?.phone} />
              <Cell label="Plan" value={d.planDetails?.planName || 'One-time'} />
              <Cell label="Size / Freq"
                value={[d.planDetails?.size, d.planDetails?.frequency].filter(Boolean).join(' · ')} />
            </div>
          </Card>

          {(d.preFillWeight != null || d.postFillWeight != null) && (
            <Card padding="md" title="Weights">
              <div className="dd__grid">
                <Cell label="Pre-fill" value={d.preFillWeight != null ? `${d.preFillWeight} kg` : '—'} />
                <Cell label="Post-fill" value={d.postFillWeight != null ? `${d.postFillWeight} kg` : '—'} />
                <Cell label="Refilled" value={d.refilledKg != null ? `${d.refilledKg} kg` : '—'} />
                <Cell label="Remnant credited"
                  value={d.remnantDeltaKg != null ? `${d.remnantDeltaKg} kg` : '—'} />
              </div>
              {weights.length > 0 && (
                <div className="dd-weights">
                  {weights.map((w) => (
                    <div key={w._id} className="dd-weight">
                      <Badge variant={w.phase === 'post_fill' ? 'primary' : 'neutral'} size="sm">
                        {w.phase || w.measurementType || '—'}
                      </Badge>
                      <span>{w.measuredWeight} kg</span>
                      <span className="dd-muted">{fmt(w.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {cylinder && (
            <Card padding="md" title="Cylinder">
              <div className="dd__grid">
                <Cell label="Tag" value={cylinder.tagCode} />
                <Cell label="Size" value={cylinder.size} />
                <Cell label="Status" value={cylinder.status} />
                <Cell label="Last weight"
                  value={cylinder.lastMeasuredWeight != null ? `${cylinder.lastMeasuredWeight} kg` : '—'} />
              </div>
            </Card>
          )}

          {refill && (
            <Card padding="md" title="Refill request">
              <div className="dd__grid">
                <Cell label="Request #" value={refill.requestNumber} />
                <Cell label="Plant" value={refill.plantId?.name} />
                <Cell label="Status" value={String(refill.status || '').replace(/_/g, ' ')} />
                <Cell label="Requested" value={`${refill.requestedQuantity ?? '—'} kg`} />
                <Cell label="Confirmed" value={`${refill.plantConfirmedQuantity ?? '—'} kg`} />
                <Cell label="Variance"
                  value={refill.variance != null ? `${refill.variance} kg` : '—'}
                  danger={Math.abs(refill.variance || 0) > 0.2} />
              </div>
            </Card>
          )}

          <Card padding="md" title="Timeline">
            <div className="dd-timeline">
              <Step done={!!d.createdAt} at={d.createdAt} label="Created" />
              <Step done={!!d.assignedAt} at={d.assignedAt} label="Assigned" />
              <Step done={!!d.acceptedAt} at={d.acceptedAt} label="Accepted" />
              <Step done={!!d.preFillRecordedAt} at={d.preFillRecordedAt} label="Pre-fill recorded" />
              <Step done={!!d.postFillRecordedAt} at={d.postFillRecordedAt} label="Post-fill recorded" />
              <Step done={d.status === 'delivered'} at={d.deliveredAt} label="Delivered" />
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default DeliveryDetailModal;
File 6 — src/pages/admin/subscriptions/AdminSubscriptions.jsx
Create form fetches user by email via adminUsersAPI.list({ search: email }). Compact stats, page-size, colorful actions, detail modal.

jsx
// src/pages/admin/subscriptions/AdminSubscriptions.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaPause, FaPlay, FaTimes, FaTrash, FaEye,
  FaSearch, FaExclamationTriangle, FaInbox, FaSync, FaCheck,
} from 'react-icons/fa';
import { adminSubscriptionsAPI, adminDeliveriesAPI, adminUsersAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissions } from '../../../hooks/usePermissions';
import { useLiveEvent } from '../../../contexts/LiveContext';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import FormRow from '../../../components/ui/FormRow';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/ui/EmptyState';
import '../../../styles/modules/subscriptions.css';

const STATUS_VARIANT = {
  active: 'success', paused: 'warning', cancelled: 'danger',
  expired: 'neutral', pending: 'info',
};

const STATUS_OPTIONS = ['active', 'paused', 'cancelled', 'expired', 'pending'];
const FREQ_OPTIONS = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'One-Time', 'Emergency'];
const PAGE_SIZES = [5, 10, 25, 50];

const AdminSubscriptions = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(null);

  const { success, error: showError } = useSnackbar();
  const { hasPermission } = usePermissions();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page, limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== 'all' && { status }),
      };
      const res = await adminSubscriptionsAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load subscriptions');
        return;
      }
      setRows(body?.data || []);
      setTotal(body?.total ?? body?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => { load(); }, [load]);

  useLiveEvent('subscription.created', load);
  useLiveEvent('subscription.paused', load);
  useLiveEvent('subscription.resumed', load);
  useLiveEvent('subscription.cancelled', load);

  const stats = useMemo(() => ({
    total,
    onPageActive: rows.filter((r) => r.status === 'active').length,
    onPagePaused: rows.filter((r) => r.status === 'paused').length,
    onPageRevenue: rows
      .filter((r) => r.status === 'active')
      .reduce((s, r) => s + (Number(r.price) || 0), 0),
  }), [rows, total]);

  const doAction = async (sub, kind) => {