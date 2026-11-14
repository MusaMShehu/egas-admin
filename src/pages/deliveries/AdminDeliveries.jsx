// // src/pages/admin/deliveries/AdminDeliveries.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaPlus, FaSearch, FaUserCheck, FaSync,
//   FaExclamationTriangle, FaInbox,
// } from 'react-icons/fa';
// import { adminDeliveriesAPI, adminUsersAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import { usePermissions } from '../../hooks/usePermissions';
// import { useLiveEvent } from '../../contexts/LiveContext';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import StatCard from '../../components/ui/StatCard';
// import DataTable from '../../components/ui/DataTable';
// import Modal from '../../components/ui/Modal';
// import FormField from '../../components/ui/FormField';
// import FormRow from '../../components/ui/FormRow';
// import EmptyState from '../../components/ui/EmptyState';
// import '../../styles/modules/deliveries.css';

// const STATUS_VARIANT = {
//   pending: 'neutral', assigned: 'info', accepted: 'warning',
//   out_for_delivery: 'primary', delivered: 'success', failed: 'danger',
//   cancelled: 'neutral', paused: 'warning',
// };

// const STATUS_OPTIONS = [
//   'pending', 'assigned', 'accepted', 'out_for_delivery',
//   'delivered', 'failed', 'cancelled', 'paused',
// ];

// const AdminDeliveries = () => {
//   const [rows, setRows] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [status, setStatus] = useState('all');
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [agents, setAgents] = useState([]);
//   const [assignFor, setAssignFor] = useState(null);
//   const [busy, setBusy] = useState(null);

//   const { success, error: showError } = useSnackbar();
//   const { hasPermission } = usePermissions();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = {
//         page, limit,
//         ...(status !== 'all' && { status }),
//         ...(search.trim() && { search: search.trim() }),
//       };
//       const res = await adminDeliveriesAPI.list(params);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load deliveries');
//         return;
//       }
//       setRows(body?.data || []);
//       setTotal(body?.total ?? body?.pagination?.total ?? 0);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, status, search]);

//   const loadStats = useCallback(async () => {
//     try {
//       const res = await adminDeliveriesAPI.stats();
//       setStats(res?.data?.data || null);
//     } catch { /* silent */ }
//   }, []);

//   const loadAgents = useCallback(async () => {
//     try {
//       const res = await adminUsersAPI.list({ role: 'delivery', limit: 200 });
//       setAgents(res?.data?.data?.users || res?.data?.data || []);
//     } catch { /* silent */ }
//   }, []);

//   useEffect(() => { load(); }, [load]);
//   useEffect(() => { loadStats(); loadAgents(); }, [loadStats, loadAgents]);

//   useLiveEvent('delivery.pre_fill_recorded', load);
//   useLiveEvent('delivery.post_fill_recorded', load);
//   useLiveEvent('delivery.status_changed', load);

//   const handleAssign = async (agentId) => {
//     if (!assignFor) return;
//     setBusy(assignFor._id);
//     try {
//       await adminDeliveriesAPI.assign(assignFor._id, agentId);
//       success('Delivery assigned');
//       setAssignFor(null);
//       await load();
//       await loadStats();
//     } catch (err) {
//       showError(err?.message || 'Assign failed');
//     } finally { setBusy(null); }
//   };

//   const handleGenerate = async () => {
//     setBusy('__generate');
//     try {
//       const res = await adminDeliveriesAPI.generateSchedules(7);
//       const body = res?.data;
//       success(`Generated ${body?.generatedCount ?? 0} schedules`);
//       await load();
//       await loadStats();
//     } catch (err) {
//       showError(err?.message || 'Generation failed');
//     } finally { setBusy(null); }
//   };

//   const handleSync = async (d) => {
//     setBusy(d._id);
//     try {
//       await adminDeliveriesAPI.syncWithSubscription(d._id);
//       success('Delivery synced');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Sync failed');
//     } finally { setBusy(null); }
//   };

//   const columns = [
//     {
//       key: 'customer',
//       label: 'Customer',
//       render: (d) => (
//         <div>
//           <div><strong>{d.customerName}</strong></div>
//           <div className="del-muted">{d.customerPhone}</div>
//         </div>
//       ),
//     },
//     {
//       key: 'plan',
//       label: 'Plan',
//       render: (d) => (
//         <div>
//           <div>{d.planDetails?.planName || 'One-time'}</div>
//           <div className="del-muted">
//             {d.planDetails?.size} · {d.planDetails?.frequency}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'deliveryDate',
//       label: 'Delivery date',
//       render: (d) =>
//         d.deliveryDate ? new Date(d.deliveryDate).toLocaleString() : '—',
//     },
//     {
//       key: 'address',
//       label: 'Address',
//       render: (d) => (
//         <div className="del-address">{d.address}</div>
//       ),
//     },
//     {
//       key: 'agent',
//       label: 'Agent',
//       render: (d) => {
//         const a = d.deliveryAgent;
//         if (!a) return <span className="del-muted">unassigned</span>;
//         return `${a.firstName || ''} ${a.lastName || ''}`.trim();
//       },
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (d) => (
//         <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} dot>
//           {String(d.status).replace(/_/g, ' ')}
//         </Badge>
//       ),
//     },
//     {
//       key: 'weight',
//       label: 'Weights',
//       render: (d) => (
//         <div>
//           <div>Pre: {d.preFillWeight != null ? `${d.preFillWeight}kg` : '—'}</div>
//           <div>Post: {d.postFillWeight != null ? `${d.postFillWeight}kg` : '—'}</div>
//           {d.remnantDeltaKg != null && d.remnantDeltaKg > 0 && (
//             <Badge variant="remnant" size="sm">
//               +{d.remnantDeltaKg}kg remnant
//             </Badge>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'actions',
//       label: '',
//       align: 'right',
//       render: (d) => (
//         <div className="del-actions" onClick={(e) => e.stopPropagation()}>
//           {!d.deliveryAgent && d.status === 'pending' && hasPermission('deliveries:assign') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaUserCheck />}
//               onClick={() => setAssignFor(d)}>Assign</Button>
//           )}
//           {d.subscriptionId && hasPermission('deliveries:sync') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaSync />}
//               loading={busy === d._id}
//               onClick={() => handleSync(d)}>Sync</Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   const liveStats = useMemo(() => ({
//     todayTotal: stats?.today?.total ?? 0,
//     todayDelivered: stats?.today?.delivered ?? 0,
//     todayPending: stats?.today?.pending ?? 0,
//     todayFailed: stats?.today?.failed ?? 0,
//   }), [stats]);

//   return (
//     <div className="deliveries-page">
//       <PageHeader
//         title="Deliveries"
//         subtitle={`${total.toLocaleString()} total · today: ${liveStats.todayTotal}`}
//         actions={
//           <>
//             <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//               Refresh
//             </Button>
//             {hasPermission('deliveries:generate') && (
//               <Button variant="primary" leftIcon={<FaPlus />}
//                 onClick={handleGenerate}
//                 loading={busy === '__generate'}>
//                 Generate schedules
//               </Button>
//             )}
//           </>
//         }
//       />

//       <div className="deliveries-stats">
//         <StatCard label="Today total" value={liveStats.todayTotal} color="primary" icon={<FaUserCheck />} />
//         <StatCard label="Delivered today" value={liveStats.todayDelivered} color="success" icon={<FaUserCheck />} />
//         <StatCard label="Pending today" value={liveStats.todayPending} color="warning" icon={<FaUserCheck />} />
//         <StatCard label="Failed today" value={liveStats.todayFailed} color="danger" icon={<FaUserCheck />} />
//       </div>

//       <Card padding="md">
//         <div className="del-filters">
//           <div className="del-filters__group del-filters__group--grow">
//             <label>Search</label>
//             <div className="del-search">
//               <FaSearch />
//               <input
//                 type="text"
//                 placeholder="Customer, address, plan…"
//                 value={search}
//                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//               />
//             </div>
//           </div>
//           <div className="del-filters__group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
//               <option value="all">All statuses</option>
//               {STATUS_OPTIONS.map((s) => (
//                 <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {error ? (
//         <Card padding="lg">
//           <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load deliveries"
//             description={error} action={<Button onClick={load}>Retry</Button>} />
//         </Card>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={rows}
//           loading={loading}
//           rowKey={(d) => d._id}
//           emptyState={
//             <div className="del-empty">
//               <FaInbox />
//               <p>No deliveries match your filters</p>
//             </div>
//           }
//           pagination={{ page, pageSize: limit, total, onChange: setPage }}
//         />
//       )}

//       {assignFor && (
//         <Modal
//           open
//           onClose={busy ? () => {} : () => setAssignFor(null)}
//           title={`Assign ${assignFor.customerName}`}
//           subtitle={assignFor.planDetails?.planName || 'One-time delivery'}
//           size="sm"
//           footer={<Button variant="secondary" onClick={() => setAssignFor(null)}>Cancel</Button>}
//         >
//           <FormRow cols={1}>
//             <FormField label="Delivery agent" name="agentId" as="select"
//               onChange={(e) => handleAssign(e.target.value)}
//               disabled={busy === assignFor._id}>
//               <option value="">Select an agent…</option>
//               {agents.map((a) => (
//                 <option key={a._id} value={a._id}>
//                   {a.firstName} {a.lastName} — {a.phone}
//                 </option>
//               ))}
//             </FormField>
//           </FormRow>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default AdminDeliveries;
























// src/pages/admin/deliveries/AdminDeliveries.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaSearch, FaUserCheck, FaSync, FaEye,
  FaExclamationTriangle, FaInbox, FaCalendarAlt,
} from 'react-icons/fa';
import { adminDeliveriesAPI, adminUsersAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';
import EmptyState from '../../components/ui/EmptyState';
import DeliveryDetailModal from './DeliveryDetailModal';
import '../../styles/modules/deliveries.css';

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