// // src/pages/admin/subscriptions/AdminSubscriptions.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaPlus, FaPause, FaPlay, FaTimes, FaTrash, FaEye,
//   FaSearch, FaExclamationTriangle, FaInbox, FaSync,
// } from 'react-icons/fa';
// import { adminSubscriptionsAPI, adminDeliveriesAPI } from '../../api/endpoints';
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
// import ConfirmDialog from '../../components/ui/ConfirmDialog';
// import EmptyState from '../../components/ui/EmptyState';
// import '../../styles/modules/subscriptions.css';

// const STATUS_VARIANT = {
//   active: 'success', paused: 'warning', cancelled: 'danger',
//   expired: 'neutral', pending: 'info',
// };

// const STATUS_OPTIONS = ['active', 'paused', 'cancelled', 'expired', 'pending'];

// const FREQ_OPTIONS = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'One-Time', 'Emergency'];

// const AdminSubscriptions = () => {
//   const [rows, setRows] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [search, setSearch] = useState('');
//   const [status, setStatus] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selected, setSelected] = useState(new Set());
//   const [editing, setEditing] = useState(null);
//   const [viewing, setViewing] = useState(null);
//   const [confirm, setConfirm] = useState(null); // { kind, sub }
//   const [busy, setBusy] = useState(null);

//   const { success, error: showError } = useSnackbar();
//   const { hasPermission } = usePermissions();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = {
//         page, limit,
//         ...(search.trim() && { search: search.trim() }),
//         ...(status !== 'all' && { status }),
//       };
//       const res = await adminSubscriptionsAPI.list(params);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load subscriptions');
//         return;
//       }
//       setRows(body?.data || []);
//       setTotal(body?.total ?? body?.pagination?.total ?? 0);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, search, status]);

//   useEffect(() => { load(); }, [load]);

//   useLiveEvent('subscription.created', load);
//   useLiveEvent('subscription.paused', load);
//   useLiveEvent('subscription.resumed', load);
//   useLiveEvent('subscription.cancelled', load);

//   const stats = useMemo(() => ({
//     total,
//     onPageActive: rows.filter((r) => r.status === 'active').length,
//     onPagePaused: rows.filter((r) => r.status === 'paused').length,
//     onPageRevenue: rows
//       .filter((r) => r.status === 'active')
//       .reduce((s, r) => s + (Number(r.price) || 0), 0),
//   }), [rows, total]);

//   const doAction = async (sub, kind) => {
//     setBusy(sub._id);
//     try {
//       if (kind === 'pause') await adminSubscriptionsAPI.pause(sub._id);
//       if (kind === 'resume') await adminSubscriptionsAPI.resume(sub._id);
//       if (kind === 'cancel') await adminSubscriptionsAPI.cancel(sub._id);
//       success(`Subscription ${kind}d`);
//       setConfirm(null);
//       await load();
//     } catch (err) {
//       showError(err?.message || `${kind} failed`);
//     } finally { setBusy(null); }
//   };

//   const syncSubscription = async (sub) => {
//     setBusy(sub._id);
//     try {
//       // The backend sync endpoint requires a delivery ID. Fetch the sub's
//       // deliveries and call sync on each — this is what the backend expects.
//       const dRes = await adminDeliveriesAPI.list({
//         subscriptionId: sub._id,
//         limit: 200,
//       });
//       const deliveries = dRes?.data?.data || [];
//       if (deliveries.length === 0) {
//         success('No deliveries to sync');
//         return;
//       }
//       let synced = 0;
//       for (const d of deliveries) {
//         try {
//           await adminDeliveriesAPI.syncWithSubscription(d._id);
//           synced++;
//         } catch { /* skip individual failure */ }
//       }
//       success(`${synced}/${deliveries.length} deliveries synced`);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Sync failed');
//     } finally { setBusy(null); }
//   };

//   const handleDelete = async (sub) => {
//     setBusy(sub._id);
//     try {
//       await adminSubscriptionsAPI.remove(sub._id);
//       success('Subscription deleted');
//       setConfirm(null);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Delete failed');
//     } finally { setBusy(null); }
//   };

//   const handleBulk = async (kind) => {
//     if (selected.size === 0) return;
//     setBusy('__bulk');
//     try {
//       const ids = Array.from(selected);
//       if (kind === 'delete') {
//         await adminSubscriptionsAPI.bulkDelete(ids);
//         success(`${ids.length} subscriptions deleted`);
//       } else {
//         const payload =
//           kind === 'pause' ? { status: 'paused' }
//           : kind === 'resume' ? { status: 'active' }
//           : kind === 'cancel' ? { status: 'cancelled' }
//           : {};
//         await adminSubscriptionsAPI.bulkUpdate(ids, payload);
//         success(`${ids.length} subscriptions updated`);
//       }
//       setSelected(new Set());
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Bulk action failed');
//     } finally { setBusy(null); }
//   };

//   const columns = [
//     {
//       key: 'customer',
//       label: 'Customer',
//       render: (s) => {
//         const u = s.userId;
//         if (!u) return '—';
//         return (
//           <div>
//             <div><strong>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</strong></div>
//             <div className="sub-muted">{u.email}</div>
//           </div>
//         );
//       },
//     },
//     {
//       key: 'plan',
//       label: 'Plan',
//       render: (s) => (
//         <div>
//           <div>{s.planName || '—'}</div>
//           <div className="sub-muted">{s.size} · {s.frequency}</div>
//         </div>
//       ),
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (s) => (
//         <Badge variant={STATUS_VARIANT[s.status] || 'neutral'} dot>
//           {s.status}
//         </Badge>
//       ),
//     },
//     {
//       key: 'price',
//       label: 'Price',
//       align: 'right',
//       render: (s) =>
//         s.price != null ? `₦${Number(s.price).toLocaleString()}` : '—',
//     },
//     {
//       key: 'dates',
//       label: 'Dates',
//       render: (s) => (
//         <div>
//           <div>{s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'}</div>
//           <div className="sub-muted">
//             → {s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'actions',
//       label: '',
//       align: 'right',
//       render: (s) => (
//         <div className="sub-actions" onClick={(e) => e.stopPropagation()}>
//           <Button variant="ghost" size="sm" leftIcon={<FaEye />}
//             onClick={() => setViewing(s)}>View</Button>
//           {hasPermission('subscriptions:update') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaSync />}
//               loading={busy === s._id}
//               onClick={() => syncSubscription(s)}>Sync</Button>
//           )}
//           {s.status === 'active' && hasPermission('subscriptions:pause') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaPause />}
//               onClick={() => setConfirm({ kind: 'pause', sub: s })}>Pause</Button>
//           )}
//           {s.status === 'paused' && hasPermission('subscriptions:pause') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaPlay />}
//               onClick={() => setConfirm({ kind: 'resume', sub: s })}>Resume</Button>
//           )}
//           {['active', 'paused'].includes(s.status) && hasPermission('subscriptions:cancel') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaTimes />}
//               onClick={() => setConfirm({ kind: 'cancel', sub: s })}>Cancel</Button>
//           )}
//           {hasPermission('subscriptions:delete') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaTrash />}
//               onClick={() => setConfirm({ kind: 'delete', sub: s })}>Delete</Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="subs-page">
//       <PageHeader
//         title="Subscriptions"
//         subtitle={`${stats.total.toLocaleString()} total · ${stats.onPageActive} active on this page`}
//         actions={
//           <>
//             <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//               Refresh
//             </Button>
//             {hasPermission('subscriptions:create') && (
//               <Button variant="primary" leftIcon={<FaPlus />}
//                 onClick={() => setEditing({ sub: null })}>New subscription</Button>
//             )}
//           </>
//         }
//       />

//       <div className="subs-stats">
//         <StatCard label="Total" value={stats.total} color="primary" icon={<FaEye />} />
//         <StatCard label="Active (page)" value={stats.onPageActive} color="success" icon={<FaPlay />} />
//         <StatCard label="Paused (page)" value={stats.onPagePaused} color="warning" icon={<FaPause />} />
//         <StatCard
//           label="Revenue (page)"
//           value={`₦${stats.onPageRevenue.toLocaleString()}`}
//           color="remnant"
//           icon={<FaEye />}
//         />
//       </div>

//       <Card padding="md">
//         <div className="subs-filters">
//           <div className="subs-filters__group subs-filters__group--grow">
//             <label>Search</label>
//             <div className="subs-search">
//               <FaSearch />
//               <input
//                 type="text"
//                 placeholder="Plan, customer, reference…"
//                 value={search}
//                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//               />
//             </div>
//           </div>
//           <div className="subs-filters__group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
//               <option value="all">All statuses</option>
//               {STATUS_OPTIONS.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {selected.size > 0 && (
//         <Card padding="md" className="subs-bulk">
//           <div className="subs-bulk__inner">
//             <strong>{selected.size} selected</strong>
//             <div className="subs-bulk__actions">
//               <Button variant="warning" size="sm" disabled={busy === '__bulk'}
//                 onClick={() => handleBulk('pause')}>Pause</Button>
//               <Button variant="success" size="sm" disabled={busy === '__bulk'}
//                 onClick={() => handleBulk('resume')}>Resume</Button>
//               <Button variant="danger" size="sm" disabled={busy === '__bulk'}
//                 onClick={() => handleBulk('cancel')}>Cancel</Button>
//               <Button variant="danger" size="sm" disabled={busy === '__bulk'}
//                 onClick={() => handleBulk('delete')}>Delete</Button>
//               <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
//                 Clear
//               </Button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {error ? (
//         <Card padding="lg">
//           <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load subscriptions"
//             description={error} action={<Button onClick={load}>Retry</Button>} />
//         </Card>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={rows}
//           loading={loading}
//           rowKey={(s) => s._id}
//           selectable
//           selectedIds={selected}
//           onSelectionChange={(ids) => setSelected(new Set(ids))}
//           onRowClick={(s) => setViewing(s)}
//           emptyState={
//             <div className="subs-empty">
//               <FaInbox />
//               <p>No subscriptions match your filters</p>
//             </div>
//           }
//           pagination={{ page, pageSize: limit, total, onChange: setPage }}
//         />
//       )}

//       {editing && (
//         <SubscriptionEditorModal
//           subscription={editing.sub}
//           onClose={() => setEditing(null)}
//           onSaved={() => { setEditing(null); load(); }}
//         />
//       )}

//       {viewing && (
//         <SubscriptionDetailModal
//           subscription={viewing}
//           onClose={() => setViewing(null)}
//         />
//       )}

//       <ConfirmDialog
//         open={!!confirm}
//         onClose={() => setConfirm(null)}
//         title={
//           confirm?.kind === 'pause' ? `Pause subscription?`
//           : confirm?.kind === 'resume' ? `Resume subscription?`
//           : confirm?.kind === 'cancel' ? `Cancel subscription?`
//           : `Delete subscription?`
//         }
//         message={
//           confirm?.kind === 'pause' ? 'Associated deliveries will be paused too.'
//           : confirm?.kind === 'resume' ? 'Associated deliveries will be resumed and rescheduled.'
//           : confirm?.kind === 'cancel' ? 'This ends the subscription immediately. Deliveries will not resume.'
//           : 'This cannot be undone. Cancel instead if the subscription has any associated orders.'
//         }
//         confirmLabel={
//           confirm?.kind === 'pause' ? 'Pause'
//           : confirm?.kind === 'resume' ? 'Resume'
//           : confirm?.kind === 'cancel' ? 'Cancel'
//           : 'Delete'
//         }
//         variant={confirm?.kind === 'delete' ? 'danger' : 'warning'}
//         onConfirm={() =>
//           confirm?.kind === 'delete'
//             ? handleDelete(confirm.sub)
//             : doAction(confirm.sub, confirm.kind)
//         }
//       />
//     </div>
//   );
// };

// const SubscriptionEditorModal = ({ subscription, onClose, onSaved }) => {
//   const isEdit = !!subscription?._id;
//   const [form, setForm] = useState(() => ({
//     userId: subscription?.userId?._id || subscription?.userId || '',
//     planName: subscription?.planName || '',
//     planType: subscription?.planType || 'preset',
//     size: subscription?.size || '6kg',
//     frequency: subscription?.frequency || 'Monthly',
//     subscriptionPeriod: subscription?.subscriptionPeriod || 1,
//     price: subscription?.price ?? '',
//     status: subscription?.status || 'active',
//     startDate: subscription?.startDate
//       ? new Date(subscription.startDate).toISOString().slice(0, 10)
//       : new Date().toISOString().slice(0, 10),
//     endDate: subscription?.endDate
//       ? new Date(subscription.endDate).toISOString().slice(0, 10)
//       : '',
//   }));
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

//   const submit = async () => {
//     if (!isEdit && !form.userId) return setError('Customer ID is required');
//     if (!form.planName) return setError('Plan name is required');
//     if (!form.price) return setError('Price is required');
//     setLoading(true); setError('');
//     try {
//       const payload = {
//         ...form,
//         price: Number(form.price),
//         subscriptionPeriod: Number(form.subscriptionPeriod),
//       };
//       if (isEdit) {
//         await adminSubscriptionsAPI.update(subscription._id, payload);
//         success('Subscription updated');
//       } else {
//         await adminSubscriptionsAPI.create(payload);
//         success('Subscription created');
//       }
//       onSaved?.();
//     } catch (err) {
//       const msg = err?.message || 'Save failed';
//       setError(msg); showError(msg);
//     } finally { setLoading(false); }
//   };

//   return (
//     <Modal
//       open
//       onClose={loading ? () => {} : onClose}
//       title={isEdit ? 'Edit subscription' : 'New subscription'}
//       size="lg"
//       loading={loading}
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button variant="primary" onClick={submit} loading={loading}>
//             {isEdit ? 'Save' : 'Create'}
//           </Button>
//         </>
//       }
//     >
//       {!isEdit && (
//         <FormRow cols={1}>
//           <FormField label="Customer ID" name="userId" value={form.userId}
//             onChange={(e) => update('userId', e.target.value)} required
//             placeholder="Mongo ObjectId"
//             error={error} disabled={loading} />
//         </FormRow>
//       )}
//       <FormRow cols={2}>
//         <FormField label="Plan name" name="planName" value={form.planName}
//           onChange={(e) => update('planName', e.target.value)} required disabled={loading} />
//         <FormField label="Plan type" name="planType" as="select" value={form.planType}
//           onChange={(e) => update('planType', e.target.value)} disabled={loading}>
//           <option value="preset">Preset</option>
//           <option value="custom">Custom</option>
//           <option value="one-time">One-time</option>
//           <option value="emergency">Emergency</option>
//         </FormField>
//       </FormRow>
//       <FormRow cols={3}>
//         <FormField label="Size" name="size" value={form.size}
//           onChange={(e) => update('size', e.target.value)} disabled={loading} />
//         <FormField label="Frequency" name="frequency" as="select" value={form.frequency}
//           onChange={(e) => update('frequency', e.target.value)} disabled={loading}>
//           {FREQ_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
//         </FormField>
//         <FormField label="Period (months)" name="subscriptionPeriod" type="number" min="1" max="12"
//           value={form.subscriptionPeriod}
//           onChange={(e) => update('subscriptionPeriod', e.target.value)} disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Price (₦)" name="price" type="number" step="0.01"
//           value={form.price}
//           onChange={(e) => update('price', e.target.value)} required disabled={loading} />
//         <FormField label="Status" name="status" as="select" value={form.status}
//           onChange={(e) => update('status', e.target.value)} disabled={loading}>
//           {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
//         </FormField>
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Start date" name="startDate" type="date"
//           value={form.startDate}
//           onChange={(e) => update('startDate', e.target.value)} disabled={loading} />
//         <FormField label="End date" name="endDate" type="date"
//           value={form.endDate}
//           onChange={(e) => update('endDate', e.target.value)} disabled={loading} />
//       </FormRow>
//     </Modal>
//   );
// };

// const SubscriptionDetailModal = ({ subscription, onClose }) => {
//   const s = subscription;
//   return (
//     <Modal
//       open
//       onClose={onClose}
//       title={`Subscription — ${s.planName}`}
//       subtitle={`Ref: ${s.reference || '—'}`}
//       size="lg"
//       footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
//     >
//       <div className="sub-detail">
//         <div className="sub-detail__grid">
//           <Cell label="Status" value={<Badge variant={STATUS_VARIANT[s.status] || 'neutral'} dot>{s.status}</Badge>} />
//           <Cell label="Plan" value={s.planName || '—'} />
//           <Cell label="Type" value={s.planType || '—'} />
//           <Cell label="Size" value={s.size || '—'} />
//           <Cell label="Frequency" value={s.frequency || '—'} />
//           <Cell label="Period" value={`${s.subscriptionPeriod || 1} month(s)`} />
//           <Cell label="Price" value={s.price != null ? `₦${Number(s.price).toLocaleString()}` : '—'} />
//           <Cell label="Payment" value={s.paymentMethod || '—'} />
//           <Cell label="Start" value={s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'} />
//           <Cell label="End" value={s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'} />
//         </div>
//         {s.userId && (
//           <div className="sub-detail__customer">
//             <h4>Customer</h4>
//             <div>{`${s.userId.firstName || ''} ${s.userId.lastName || ''}`.trim()}</div>
//             <div className="sub-muted">{s.userId.email}</div>
//             <div className="sub-muted">{s.userId.phone}</div>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// const Cell = ({ label, value }) => (
//   <div className="sub-cell">
//     <div className="sub-cell__label">{label}</div>
//     <div className="sub-cell__value">{value}</div>
//   </div>
// );

// export default AdminSubscriptions;

























// src/pages/admin/subscriptions/AdminSubscriptions.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaPause, FaPlay, FaTimes, FaTrash, FaEye,
  FaSearch, FaExclamationTriangle, FaInbox, FaSync, FaCheck,
} from 'react-icons/fa';
import { adminSubscriptionsAPI, adminDeliveriesAPI, adminUsersAPI } from '../../api/endpoints';
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
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import '../../styles/modules/subscriptions.css';

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
    setBusy(sub._id);
    try {
      if (kind === 'pause') await adminSubscriptionsAPI.pause(sub._id);
      if (kind === 'resume') await adminSubscriptionsAPI.resume(sub._id);
      if (kind === 'cancel') await adminSubscriptionsAPI.cancel(sub._id);
      success(`Subscription ${kind}d`);
      setConfirm(null);
      await load();
    } catch (err) {
      showError(err?.message || `${kind} failed`);
    } finally { setBusy(null); }
  };

  const syncSubscription = async (sub) => {
    setBusy(sub._id);
    try {
      const dRes = await adminDeliveriesAPI.list({ subscriptionId: sub._id, limit: 200 });
      const deliveries = dRes?.data?.data || [];
      if (deliveries.length === 0) { success('No deliveries to sync'); return; }
      let synced = 0;
      for (const d of deliveries) {
        try { await adminDeliveriesAPI.syncWithSubscription(d._id); synced++; }
        catch { /* skip */ }
      }
      success(`${synced}/${deliveries.length} deliveries synced`);
      await load();
    } catch (err) {
      showError(err?.message || 'Sync failed');
    } finally { setBusy(null); }
  };

  const handleDelete = async (sub) => {
    setBusy(sub._id);
    try {
      await adminSubscriptionsAPI.remove(sub._id);
      success('Subscription deleted');
      setConfirm(null);
      await load();
    } catch (err) {
      showError(err?.message || 'Delete failed');
    } finally { setBusy(null); }
  };

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (s) => {
        const u = s.userId;
        if (!u) return '—';
        return (
          <div>
            <div><strong>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</strong></div>
            <div className="sub-muted">{u.email}</div>
          </div>
        );
      },
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (s) => (
        <div>
          <div>{s.planName || '—'}</div>
          <div className="sub-muted">{s.size} · {s.frequency}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => (
        <Badge variant={STATUS_VARIANT[s.status] || 'neutral'} dot>{s.status}</Badge>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (s) => s.price != null ? `₦${Number(s.price).toLocaleString()}` : '—',
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (s) => (
        <div className="sub-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="info" size="sm" leftIcon={<FaEye />} onClick={() => setViewing(s)}>View</Button>
          {hasPermission('subscriptions:update') && (
            <Button variant="warning" size="sm" leftIcon={<FaSync />}
              loading={busy === s._id} onClick={() => syncSubscription(s)}>Sync</Button>
          )}
          {s.status === 'active' && hasPermission('subscriptions:pause') && (
            <Button variant="secondary" size="sm" leftIcon={<FaPause />}
              onClick={() => setConfirm({ kind: 'pause', sub: s })}>Pause</Button>
          )}
          {s.status === 'paused' && hasPermission('subscriptions:pause') && (
            <Button variant="success" size="sm" leftIcon={<FaPlay />}
              onClick={() => setConfirm({ kind: 'resume', sub: s })}>Resume</Button>
          )}
          {['active', 'paused'].includes(s.status) && hasPermission('subscriptions:cancel') && (
            <Button variant="danger" size="sm" leftIcon={<FaTimes />}
              onClick={() => setConfirm({ kind: 'cancel', sub: s })}>Cancel</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="subs-page">
      <PageHeader
        title="Subscriptions"
        subtitle={`${stats.total.toLocaleString()} total · ${stats.onPageActive} active on this page`}
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>Refresh</Button>
            {hasPermission('subscriptions:create') && (
              <Button variant="primary" leftIcon={<FaPlus />}
                onClick={() => setEditing({ sub: null })}>New subscription</Button>
            )}
          </>
        }
      />

      <div className="subs-stats">
        <div className="mini-stat mini-stat--primary">
          <div className="mini-stat__value">{stats.total}</div>
          <div className="mini-stat__label">Total</div>
        </div>
        <div className="mini-stat mini-stat--success">
          <div className="mini-stat__value">{stats.onPageActive}</div>
          <div className="mini-stat__label">Active (page)</div>
        </div>
        <div className="mini-stat mini-stat--warning">
          <div className="mini-stat__value">{stats.onPagePaused}</div>
          <div className="mini-stat__label">Paused (page)</div>
        </div>
        <div className="mini-stat mini-stat--remnant">
          <div className="mini-stat__value">₦{stats.onPageRevenue.toLocaleString()}</div>
          <div className="mini-stat__label">Revenue (page)</div>
        </div>
      </div>

      <Card padding="md">
        <div className="subs-filters">
          <div className="subs-filters__group subs-filters__group--grow">
            <label>Search</label>
            <div className="subs-search">
              <FaSearch />
              <input type="text" placeholder="Plan, customer, reference…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="subs-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="subs-filters__group">
            <label>Page size</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load subscriptions"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          rowKey={(s) => s._id}
          onRowClick={(s) => setViewing(s)}
          emptyState={
            <div className="subs-empty"><FaInbox /><p>No subscriptions match your filters</p></div>
          }
          pagination={{ page, pageSize: limit, total, onChange: setPage }}
        />
      )}

      {editing && (
        <SubscriptionEditorModal
          subscription={editing.sub}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {viewing && (
        <SubscriptionDetailModal
          subscription={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === 'pause' ? 'Pause subscription?'
          : confirm?.kind === 'resume' ? 'Resume subscription?'
          : 'Cancel subscription?'
        }
        message={
          confirm?.kind === 'pause' ? 'Associated deliveries will be paused too.'
          : confirm?.kind === 'resume' ? 'Deliveries will be resumed and rescheduled.'
          : 'This ends the subscription immediately.'
        }
        confirmLabel={confirm?.kind === 'resume' ? 'Resume' : confirm?.kind === 'pause' ? 'Pause' : 'Cancel'}
        variant={confirm?.kind === 'cancel' ? 'danger' : 'warning'}
        onConfirm={() =>
          confirm?.kind === 'delete' ? handleDelete(confirm.sub) : doAction(confirm.sub, confirm.kind)
        }
      />
    </div>
  );
};

// ─── Editor Modal (with user lookup by email) ───
const SubscriptionEditorModal = ({ subscription, onClose, onSaved }) => {
  const isEdit = !!subscription?._id;
  const [form, setForm] = useState(() => ({
    userId: subscription?.userId?._id || subscription?.userId || '',
    userEmail: subscription?.userId?.email || '',
    planName: subscription?.planName || '',
    planType: subscription?.planType || 'preset',
    size: subscription?.size || '6kg',
    frequency: subscription?.frequency || 'Monthly',
    subscriptionPeriod: subscription?.subscriptionPeriod || 1,
    price: subscription?.price ?? '',
    status: subscription?.status || 'active',
    startDate: subscription?.startDate
      ? new Date(subscription.startDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    endDate: subscription?.endDate
      ? new Date(subscription.endDate).toISOString().slice(0, 10)
      : '',
  }));
  const [userLookup, setUserLookup] = useState({ loading: false, found: null, error: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const lookupUser = async () => {
    const email = form.userEmail.trim();
    if (!email) return;
    setUserLookup({ loading: true, found: null, error: null });
    try {
      const res = await adminUsersAPI.list({ search: email, limit: 5 });
      const body = res?.data;
      const list = body?.data?.users || body?.data || [];
      const exact = list.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (exact) {
        setUserLookup({ loading: false, found: exact, error: null });
        setForm((f) => ({ ...f, userId: exact._id }));
      } else {
        setUserLookup({ loading: false, found: null, error: 'No user with that exact email' });
      }
    } catch (err) {
      setUserLookup({ loading: false, found: null, error: err?.message || 'Lookup failed' });
    }
  };

  const submit = async () => {
    if (!isEdit && !form.userId) return setError('Look up a customer by email first');
    if (!form.planName) return setError('Plan name is required');
    if (!form.price) return setError('Price is required');
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        subscriptionPeriod: Number(form.subscriptionPeriod),
      };
      delete payload.userEmail;
      if (isEdit) {
        await adminSubscriptionsAPI.update(subscription._id, payload);
        success('Subscription updated');
      } else {
        await adminSubscriptionsAPI.create(payload);
        success('Subscription created');
      }
      onSaved?.();
    } catch (err) {
      const msg = err?.message || 'Save failed';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title={isEdit ? 'Edit subscription' : 'New subscription'}
      size="lg"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={loading}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      {!isEdit && (
        <FormRow cols={1}>
          <FormField label="Customer email" name="userEmail" type="email"
            value={form.userEmail}
            onChange={(e) => update('userEmail', e.target.value)}
            placeholder="customer@example.com"
            help="We'll look up the customer by email to attach the subscription"
            error={userLookup.error || error}
            disabled={loading}
            rightSlot={
              <Button size="sm" variant="outline" onClick={lookupUser}
                loading={userLookup.loading} disabled={!form.userEmail.trim()}>Find</Button>
            }
          />
          {userLookup.found && (
            <div className="subs-lookup-ok">
              <Badge variant="success" dot>Matched</Badge>
              <span>{userLookup.found.firstName} {userLookup.found.lastName} — {userLookup.found.email}</span>
            </div>
          )}
        </FormRow>
      )}
      <FormRow cols={2}>
        <FormField label="Plan name" name="planName" value={form.planName}
          onChange={(e) => update('planName', e.target.value)} required disabled={loading} />
        <FormField label="Plan type" name="planType" as="select" value={form.planType}
          onChange={(e) => update('planType', e.target.value)} disabled={loading}>
          <option value="preset">Preset</option>
          <option value="custom">Custom</option>
          <option value="one-time">One-time</option>
          <option value="emergency">Emergency</option>
        </FormField>
      </FormRow>
      <FormRow cols={3}>
        <FormField label="Size" name="size" value={form.size}
          onChange={(e) => update('size', e.target.value)} disabled={loading} />
        <FormField label="Frequency" name="frequency" as="select" value={form.frequency}
          onChange={(e) => update('frequency', e.target.value)} disabled={loading}>
          {FREQ_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </FormField>
        <FormField label="Period (months)" name="subscriptionPeriod" type="number" min="1" max="12"
          value={form.subscriptionPeriod}
          onChange={(e) => update('subscriptionPeriod', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Price (₦)" name="price" type="number" step="0.01"
          value={form.price}
          onChange={(e) => update('price', e.target.value)} required disabled={loading} />
        <FormField label="Status" name="status" as="select" value={form.status}
          onChange={(e) => update('status', e.target.value)} disabled={loading}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </FormField>
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Start date" name="startDate" type="date"
          value={form.startDate}
          onChange={(e) => update('startDate', e.target.value)} disabled={loading} />
        <FormField label="End date" name="endDate" type="date"
          value={form.endDate}
          onChange={(e) => update('endDate', e.target.value)} disabled={loading} />
      </FormRow>
    </Modal>
  );
};

// ─── Detail Modal ───
const SubscriptionDetailModal = ({ subscription, onClose }) => {
  const s = subscription;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Subscription — ${s.planName}`}
      subtitle={`Ref: ${s.reference || '—'}`}
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="sub-detail">
        <div className="sub-detail__grid">
          <Cell label="Status" value={<Badge variant={STATUS_VARIANT[s.status] || 'neutral'} dot>{s.status}</Badge>} />
          <Cell label="Plan" value={s.planName || '—'} />
          <Cell label="Type" value={s.planType || '—'} />
          <Cell label="Size" value={s.size || '—'} />
          <Cell label="Frequency" value={s.frequency || '—'} />
          <Cell label="Period" value={`${s.subscriptionPeriod || 1} month(s)`} />
          <Cell label="Price" value={s.price != null ? `₦${Number(s.price).toLocaleString()}` : '—'} />
          <Cell label="Payment" value={s.paymentMethod || '—'} />
          <Cell label="Start" value={s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'} />
          <Cell label="End" value={s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'} />
        </div>
        {s.userId && (
          <div className="sub-detail__customer">
            <h4>Customer</h4>
            <div>{`${s.userId.firstName || ''} ${s.userId.lastName || ''}`.trim()}</div>
            <div className="sub-muted">{s.userId.email}</div>
            <div className="sub-muted">{s.userId.phone}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const Cell = ({ label, value }) => (
  <div className="sub-cell">
    <div className="sub-cell__label">{label}</div>
    <div className="sub-cell__value">{value}</div>
  </div>
);

export default AdminSubscriptions;