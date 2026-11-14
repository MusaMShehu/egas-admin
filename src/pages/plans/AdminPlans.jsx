// // src/pages/admin/plans/AdminPlans.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaPlus, FaInbox, FaExclamationTriangle, FaStar,
//   FaToggleOn, FaToggleOff, FaCopy, FaEdit, FaTrash,
// } from 'react-icons/fa';
// import { adminPlansAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import DataTable from '../../components/ui/DataTable';
// import SkeletonLoader from '../../components/ui/SkeletonLoader';
// import FormField from '../../components/ui/FormField';
// import FormRow from '../../components/ui/FormRow';
// import Modal from '../../components/ui/Modal';
// import '../../styles/modules/plans.css';

// const TYPE_VARIANT = {
//   preset: 'info',
//   custom: 'warning',
//   'one-time': 'neutral',
//   emergency: 'danger',
// };

// const AdminPlans = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [busy, setBusy] = useState(null);
//   const [editing, setEditing] = useState(null); // {} for create, { plan } for edit

//   const { success, error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await adminPlansAPI.list({ limit: 200 });
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load plans');
//         return;
//       }
//       setRows(body?.data || []);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   const handleToggleStatus = async (p) => {
//     setBusy(p._id);
//     try {
//       await adminPlansAPI.toggleStatus(p._id);
//       success(`Plan "${p.name}" ${p.isActive ? 'deactivated' : 'activated'}`);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to toggle status');
//     } finally { setBusy(null); }
//   };

//   const handleTogglePopular = async (p) => {
//     setBusy(p._id);
//     try {
//       await adminPlansAPI.togglePopular(p._id);
//       success(`Plan "${p.name}" ${p.isPopular ? 'unmarked' : 'marked'} popular`);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to toggle popular');
//     } finally { setBusy(null); }
//   };

//   const handleDuplicate = async (p) => {
//     setBusy(p._id);
//     try {
//       await adminPlansAPI.duplicate(p._id);
//       success('Plan duplicated');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to duplicate');
//     } finally { setBusy(null); }
//   };

//   const handleDelete = async (p) => {
//     if (!window.confirm(`Delete plan "${p.name}"? This cannot be undone.`)) return;
//     setBusy(p._id);
//     try {
//       await adminPlansAPI.remove(p._id);
//       success('Plan deleted');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to delete');
//     } finally { setBusy(null); }
//   };

//   const stats = useMemo(() => ({
//     total: rows.length,
//     active: rows.filter((r) => r.isActive).length,
//     popular: rows.filter((r) => r.isPopular).length,
//   }), [rows]);

//   const columns = [
//     {
//       key: 'name',
//       label: 'Plan',
//       render: (p) => (
//         <div>
//           <div><strong>{p.name}</strong></div>
//           {p.shortDescription && (
//             <div className="plan-muted">{p.shortDescription}</div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'type',
//       label: 'Type',
//       render: (p) => (
//         <Badge variant={TYPE_VARIANT[p.type] || 'neutral'} dot>
//           {p.type || '—'}
//         </Badge>
//       ),
//     },
//     { key: 'baseSize', label: 'Size', render: (p) => p.baseSize || '—' },
//     {
//       key: 'basePrice',
//       label: 'Base price',
//       align: 'right',
//       render: (p) => p.basePrice != null ? `₦${p.basePrice.toLocaleString()}` : '—',
//     },
//     {
//       key: 'pricePerKg',
//       label: '₦/kg',
//       align: 'right',
//       render: (p) => p.pricePerKg != null ? `₦${p.pricePerKg.toLocaleString()}` : '—',
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (p) => (
//         <div className="plan-statuses">
//           <Badge variant={p.isActive ? 'success' : 'neutral'} dot>
//             {p.isActive ? 'active' : 'inactive'}
//           </Badge>
//           {p.isPopular && <Badge variant="primary" size="sm">popular</Badge>}
//         </div>
//       ),
//     },
//     {
//       key: 'actions',
//       label: '',
//       align: 'right',
//       render: (p) => (
//         <div className="plan-actions" onClick={(e) => e.stopPropagation()}>
//           <Button variant="ghost" size="sm" leftIcon={<FaEdit />}
//             onClick={() => setEditing({ plan: p })}>Edit</Button>
//           <Button variant="ghost" size="sm"
//             leftIcon={p.isPopular ? <FaStar /> : <FaStar />}
//             onClick={() => handleTogglePopular(p)}
//             loading={busy === p._id}>
//             {p.isPopular ? 'Unmark' : 'Mark popular'}
//           </Button>
//           <Button variant="ghost" size="sm"
//             leftIcon={p.isActive ? <FaToggleOff /> : <FaToggleOn />}
//             onClick={() => handleToggleStatus(p)}
//             loading={busy === p._id}>
//             {p.isActive ? 'Deactivate' : 'Activate'}
//           </Button>
//           <Button variant="ghost" size="sm" leftIcon={<FaCopy />}
//             onClick={() => handleDuplicate(p)}
//             loading={busy === p._id}>Duplicate</Button>
//           <Button variant="ghost" size="sm" leftIcon={<FaTrash />}
//             onClick={() => handleDelete(p)}
//             loading={busy === p._id}>Delete</Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="plans-page">
//       <PageHeader
//         title="Subscription Plans"
//         subtitle="Catalog of preset, custom, one-time and emergency plans"
//         actions={
//           <>
//             <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//               Refresh
//             </Button>
//             <Button variant="primary" leftIcon={<FaPlus />}
//               onClick={() => setEditing({ plan: null })}>New plan</Button>
//           </>
//         }
//       />

//       <div className="plan-stats">
//         <Card padding="md">
//           <div className="plan-stat__label">Total plans</div>
//           <div className="plan-stat__value">{stats.total}</div>
//         </Card>
//         <Card padding="md">
//           <div className="plan-stat__label">Active</div>
//           <div className="plan-stat__value">{stats.active}</div>
//         </Card>
//         <Card padding="md">
//           <div className="plan-stat__label">Popular</div>
//           <div className="plan-stat__value">{stats.popular}</div>
//         </Card>
//       </div>

//       {error ? (
//         <div className="config-error">
//           <FaExclamationTriangle />
//           <p>{error}</p>
//           <Button onClick={load}>Retry</Button>
//         </div>
//       ) : loading ? (
//         <SkeletonLoader type="table" rows={6} columns={5} />
//       ) : rows.length === 0 ? (
//         <Card padding="lg">
//           <div className="config-empty">
//             <FaInbox />
//             <p>No plans defined yet. Create the first plan to get started.</p>
//             <Button variant="primary" leftIcon={<FaPlus />}
//               onClick={() => setEditing({ plan: null })}>Create plan</Button>
//           </div>
//         </Card>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={rows}
//           loading={loading}
//           rowKey={(r) => r._id}
//           onRowClick={(r) => setEditing({ plan: r })}
//           pagination={{ page: 1, pageSize: 20, total: rows.length, onChange: () => {} }}
//         />
//       )}

//       {editing && (
//         <PlanEditorModal
//           plan={editing.plan}
//           onClose={() => setEditing(null)}
//           onSaved={() => { setEditing(null); load(); }}
//         />
//       )}
//     </div>
//   );
// };

// const PlanEditorModal = ({ plan, onClose, onSaved }) => {
//   const isEdit = !!plan?._id;
//   const [form, setForm] = useState(() => ({
//     name: plan?.name || '',
//     description: plan?.description || '',
//     shortDescription: plan?.shortDescription || '',
//     type: plan?.type || 'preset',
//     baseSize: plan?.baseSize || '',
//     basePrice: plan?.basePrice ?? '',
//     pricePerKg: plan?.pricePerKg ?? '',
//     additionalFeePerKg: plan?.additionalFeePerKg ?? '',
//     isActive: plan?.isActive !== undefined ? plan.isActive : true,
//     isPopular: plan?.isPopular || false,
//     displayOrder: plan?.displayOrder ?? 0,
//   }));
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const update = (k, v) => {
//     setForm((f) => ({ ...f, [k]: v }));
//     setError('');
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) return setError('Name is required');
//     if (!form.baseSize.trim()) return setError('Base size is required');
//     if (!form.basePrice) return setError('Base price is required');

//     setLoading(true);
//     setError('');
//     try {
//       const payload = {
//         name: form.name.trim(),
//         description: form.description.trim(),
//         shortDescription: form.shortDescription.trim() || undefined,
//         type: form.type,
//         baseSize: form.baseSize.trim(),
//         basePrice: Number(form.basePrice),
//         pricePerKg: form.pricePerKg !== '' ? Number(form.pricePerKg) : undefined,
//         additionalFeePerKg: form.additionalFeePerKg !== '' ? Number(form.additionalFeePerKg) : undefined,
//         isActive: !!form.isActive,
//         isPopular: !!form.isPopular,
//         displayOrder: Number(form.displayOrder) || 0,
//       };
//       if (isEdit) {
//         await adminPlansAPI.update(plan._id, payload);
//         success('Plan updated');
//       } else {
//         await adminPlansAPI.create(payload);
//         success('Plan created');
//       }
//       onSaved?.();
//     } catch (err) {
//       const msg = err?.message || 'Save failed';
//       setError(msg);
//       showError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       open
//       onClose={loading ? () => {} : onClose}
//       title={isEdit ? `Edit plan — ${plan.name}` : 'Create plan'}
//       size="lg"
//       loading={loading}
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button variant="primary" onClick={handleSubmit} loading={loading}>
//             {isEdit ? 'Save changes' : 'Create plan'}
//           </Button>
//         </>
//       }
//     >
//       <FormRow cols={2}>
//         <FormField label="Name" name="name" value={form.name}
//           onChange={(e) => update('name', e.target.value)} required disabled={loading} />
//         <FormField label="Type" name="type" as="select" value={form.type}
//           onChange={(e) => update('type', e.target.value)} disabled={loading}>
//           <option value="preset">Preset</option>
//           <option value="custom">Custom</option>
//           <option value="one-time">One-time</option>
//           <option value="emergency">Emergency</option>
//         </FormField>
//       </FormRow>
//       <FormRow cols={1}>
//         <FormField label="Description" name="description" as="textarea" rows={2}
//           value={form.description}
//           onChange={(e) => update('description', e.target.value)}
//           disabled={loading} />
//         <FormField label="Short description" name="shortDescription"
//           value={form.shortDescription}
//           onChange={(e) => update('shortDescription', e.target.value)}
//           help="Max 150 chars"
//           maxLength={150}
//           disabled={loading} />
//       </FormRow>
//       <FormRow cols={3}>
//         <FormField label="Base size" name="baseSize" value={form.baseSize}
//           onChange={(e) => update('baseSize', e.target.value)} required
//           placeholder="e.g. 6kg"
//           error={error} disabled={loading} />
//         <FormField label="Base price (₦)" name="basePrice" type="number" step="0.01"
//           value={form.basePrice}
//           onChange={(e) => update('basePrice', e.target.value)} required disabled={loading} />
//         <FormField label="Display order" name="displayOrder" type="number"
//           value={form.displayOrder}
//           onChange={(e) => update('displayOrder', e.target.value)} disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Price per kg (₦)" name="pricePerKg" type="number" step="0.01"
//           value={form.pricePerKg}
//           onChange={(e) => update('pricePerKg', e.target.value)} disabled={loading} />
//         <FormField label="Additional fee / kg (₦)" name="additionalFeePerKg" type="number" step="0.01"
//           value={form.additionalFeePerKg}
//           onChange={(e) => update('additionalFeePerKg', e.target.value)} disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <label className="plan-checkbox">
//           <input type="checkbox" checked={form.isActive}
//             onChange={(e) => update('isActive', e.target.checked)} disabled={loading} />
//           <span>Active</span>
//         </label>
//         <label className="plan-checkbox">
//           <input type="checkbox" checked={form.isPopular}
//             onChange={(e) => update('isPopular', e.target.checked)} disabled={loading} />
//           <span>Popular</span>
//         </label>
//       </FormRow>
//     </Modal>
//   );
// };

// export default AdminPlans;























// src/pages/admin/plans/AdminPlans.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaInbox, FaExclamationTriangle, FaStar,
  FaToggleOn, FaToggleOff, FaCopy, FaEdit, FaTrash, FaEye,
} from 'react-icons/fa';
import { adminPlansAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
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
import '../../styles/modules/plans.css';

const TYPE_VARIANT = {
  preset: 'info', custom: 'warning', 'one-time': 'neutral', emergency: 'danger',
};

const TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'preset', label: 'Preset' },
  { value: 'custom', label: 'Custom' },
  { value: 'one-time', label: 'One-time' },
  { value: 'emergency', label: 'Emergency' },
];

const PAGE_SIZES = [5, 10, 25, 50];

const AdminPlans = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(null);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminPlansAPI.list({ limit: 200 });
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load plans');
        return;
      }
      setRows(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.shortDescription || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
    if (statusFilter === 'active') list = list.filter((p) => p.isActive);
    if (statusFilter === 'inactive') list = list.filter((p) => !p.isActive);
    return list;
  }, [rows, search, typeFilter, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * limit, page * limit),
    [filtered, page, limit]
  );

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.isActive).length,
    popular: rows.filter((r) => r.isPopular).length,
  }), [rows]);

  const handleToggleStatus = async (p) => {
    setBusy(p._id);
    try {
      await adminPlansAPI.toggleStatus(p._id);
      success(`Plan "${p.name}" ${p.isActive ? 'deactivated' : 'activated'}`);
      await load();
    } catch (err) {
      showError(err?.message || 'Toggle failed');
    } finally { setBusy(null); }
  };

  const handleTogglePopular = async (p) => {
    setBusy(p._id);
    try {
      await adminPlansAPI.togglePopular(p._id);
      success(`Plan "${p.name}" ${p.isPopular ? 'unmarked' : 'marked'} popular`);
      await load();
    } catch (err) {
      showError(err?.message || 'Toggle failed');
    } finally { setBusy(null); }
  };

  const handleDuplicate = async (p) => {
    setBusy(p._id);
    try {
      await adminPlansAPI.duplicate(p._id);
      success('Plan duplicated');
      await load();
    } catch (err) {
      showError(err?.message || 'Duplicate failed');
    } finally { setBusy(null); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(deleting._id);
    try {
      await adminPlansAPI.remove(deleting._id);
      success('Plan deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      showError(err?.message || 'Delete failed');
    } finally { setBusy(null); }
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan',
      render: (p) => (
        <div>
          <div><strong>{p.name}</strong></div>
          {p.shortDescription && <div className="plan-muted">{p.shortDescription}</div>}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (p) => (
        <Badge variant={TYPE_VARIANT[p.type] || 'neutral'} dot>{p.type || '—'}</Badge>
      ),
    },
    { key: 'baseSize', label: 'Size', render: (p) => p.baseSize || '—' },
    {
      key: 'basePrice',
      label: 'Base',
      align: 'right',
      render: (p) => p.basePrice != null ? `₦${p.basePrice.toLocaleString()}` : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => (
        <div className="plan-statuses">
          <Badge variant={p.isActive ? 'success' : 'neutral'} dot>{p.isActive ? 'active' : 'inactive'}</Badge>
          {p.isPopular && <Badge variant="primary" size="sm"><FaStar /> popular</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) => (
        <div className="plan-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="info" size="sm" leftIcon={<FaEye />} onClick={() => setViewing(p)}>View</Button>
          <Button variant="warning" size="sm" leftIcon={<FaEdit />} onClick={() => setEditing({ plan: p })}>Edit</Button>
          <Button variant={p.isPopular ? 'secondary' : 'primary'} size="sm" leftIcon={<FaStar />}
            loading={busy === p._id} onClick={() => handleTogglePopular(p)}>Popular</Button>
          <Button variant={p.isActive ? 'secondary' : 'success'} size="sm"
            leftIcon={p.isActive ? <FaToggleOff /> : <FaToggleOn />}
            loading={busy === p._id} onClick={() => handleToggleStatus(p)}>
            {p.isActive ? 'Off' : 'On'}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FaCopy />}
            loading={busy === p._id} onClick={() => handleDuplicate(p)}>Copy</Button>
          <Button variant="danger" size="sm" leftIcon={<FaTrash />}
            onClick={() => setDeleting(p)}>Del</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="plans-page">
      <PageHeader
        title="Subscription Plans"
        subtitle="Preset, custom, one-time and emergency plans"
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>Refresh</Button>
            <Button variant="primary" leftIcon={<FaPlus />} onClick={() => setEditing({ plan: null })}>New plan</Button>
          </>
        }
      />

      <div className="plan-stats">
        <div className="mini-stat mini-stat--primary">
          <div className="mini-stat__value">{stats.total}</div>
          <div className="mini-stat__label">Total plans</div>
        </div>
        <div className="mini-stat mini-stat--success">
          <div className="mini-stat__value">{stats.active}</div>
          <div className="mini-stat__label">Active</div>
        </div>
        <div className="mini-stat mini-stat--warning">
          <div className="mini-stat__value">{stats.popular}</div>
          <div className="mini-stat__label">Popular</div>
        </div>
      </div>

      <Card padding="md">
        <div className="plan-filters">
          <div className="plan-filters__group plan-filters__group--grow">
            <label>Search</label>
            <input type="text" placeholder="Plan name or description…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="plan-filters__group">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              {TYPE_FILTERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="plan-filters__group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="plan-filters__group">
            <label>Page size</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load plans"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          rowKey={(r) => r._id}
          onRowClick={(p) => setViewing(p)}
          emptyState={
            <div className="plan-empty"><FaInbox /><p>No plans match your filters</p></div>
          }
          pagination={{
            page,
            pageSize: limit,
            total: filtered.length,
            onChange: setPage,
          }}
        />
      )}

      {viewing && <PlanDetailModal plan={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <PlanEditorModal
          plan={editing.plan}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

const PlanDetailModal = ({ plan, onClose }) => (
  <Modal
    open
    onClose={onClose}
    title={plan.name}
    subtitle={plan.shortDescription}
    size="md"
    footer={<Button variant="secondary" onClick={onClose}>Close</Button>
    }
  >
    <div className="plan-detail">
      <div className="plan-detail__grid">
        <Cell label="Type" value={<Badge variant={TYPE_VARIANT[plan.type] || 'neutral'} dot>{plan.type || '—'}</Badge>} />
        <Cell label="Base size" value={plan.baseSize || '—'} />
        <Cell label="Base price" value={plan.basePrice != null ? `₦${Number(plan.basePrice).toLocaleString()}` : '—'} />
        <Cell label="Price / kg" value={plan.pricePerKg != null ? `₦${Number(plan.pricePerKg).toLocaleString()}` : '—'} />
        <Cell label="Additional fee / kg" value={plan.additionalFeePerKg != null ? `₦${Number(plan.additionalFeePerKg).toLocaleString()}` : '—'} />
        <Cell label="Display order" value={plan.displayOrder ?? 0} />
        <Cell label="Status" value={
          <div className="plan-statuses">
            <Badge variant={plan.isActive ? 'success' : 'neutral'} dot>
              {plan.isActive ? 'active' : 'inactive'}
            </Badge>
            {plan.isPopular && <Badge variant="primary" size="sm"><FaStar /> popular</Badge>}
          </div>
        } />
        <Cell label="Created" value={plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '—'} />
      </div>
      {plan.description && (
        <div className="plan-detail__description">
          <h4>Description</h4>
          <p>{plan.description}</p>
        </div>
      )}
    </div>
  </Modal>
);

const Cell = ({ label, value }) => (
  <div className="plan-cell">
    <div className="plan-cell__label">{label}</div>
    <div className="plan-cell__value">{value ?? '—'}</div>
  </div>
);

// ─── Plan Editor Modal ───
const PlanEditorModal = ({ plan, onClose, onSaved }) => {
  const isEdit = !!plan?._id;
  const [form, setForm] = useState(() => ({
    name: plan?.name || '',
    description: plan?.description || '',
    shortDescription: plan?.shortDescription || '',
    type: plan?.type || 'preset',
    baseSize: plan?.baseSize || '',
    basePrice: plan?.basePrice ?? '',
    pricePerKg: plan?.pricePerKg ?? '',
    additionalFeePerKg: plan?.additionalFeePerKg ?? '',
    isActive: plan?.isActive !== undefined ? plan.isActive : true,
    isPopular: plan?.isPopular || false,
    displayOrder: plan?.displayOrder ?? 0,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Name is required');
    if (!form.baseSize.trim()) return setError('Base size is required');
    if (!form.basePrice) return setError('Base price is required');

    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        type: form.type,
        baseSize: form.baseSize.trim(),
        basePrice: Number(form.basePrice),
        pricePerKg: form.pricePerKg !== '' ? Number(form.pricePerKg) : undefined,
        additionalFeePerKg: form.additionalFeePerKg !== '' ? Number(form.additionalFeePerKg) : undefined,
        isActive: !!form.isActive,
        isPopular: !!form.isPopular,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (isEdit) {
        await adminPlansAPI.update(plan._id, payload);
        success('Plan updated');
      } else {
        await adminPlansAPI.create(payload);
        success('Plan created');
      }
      onSaved?.();
    } catch (err) {
      const msg = err?.message || 'Save failed';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title={isEdit ? `Edit plan — ${plan.name}` : 'Create plan'}
      size="lg"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </>
      }
    >
      <FormRow cols={2}>
        <FormField label="Name" name="name" value={form.name}
          onChange={(e) => update('name', e.target.value)} required disabled={loading} />
        <FormField label="Type" name="type" as="select" value={form.type}
          onChange={(e) => update('type', e.target.value)} disabled={loading}>
          <option value="preset">Preset</option>
          <option value="custom">Custom</option>
          <option value="one-time">One-time</option>
          <option value="emergency">Emergency</option>
        </FormField>
      </FormRow>
      <FormRow cols={1}>
        <FormField label="Description" name="description" as="textarea" rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          disabled={loading} />
        <FormField label="Short description" name="shortDescription"
          value={form.shortDescription}
          onChange={(e) => update('shortDescription', e.target.value)}
          help="Max 150 chars"
          maxLength={150}
          disabled={loading} />
      </FormRow>
      <FormRow cols={3}>
        <FormField label="Base size" name="baseSize" value={form.baseSize}
          onChange={(e) => update('baseSize', e.target.value)} required
          placeholder="e.g. 6kg"
          error={error} disabled={loading} />
        <FormField label="Base price (₦)" name="basePrice" type="number" step="0.01"
          value={form.basePrice}
          onChange={(e) => update('basePrice', e.target.value)} required disabled={loading} />
        <FormField label="Display order" name="displayOrder" type="number"
          value={form.displayOrder}
          onChange={(e) => update('displayOrder', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Price per kg (₦)" name="pricePerKg" type="number" step="0.01"
          value={form.pricePerKg}
          onChange={(e) => update('pricePerKg', e.target.value)} disabled={loading} />
        <FormField label="Additional fee / kg (₦)" name="additionalFeePerKg" type="number" step="0.01"
          value={form.additionalFeePerKg}
          onChange={(e) => update('additionalFeePerKg', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <label className="plan-checkbox">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => update('isActive', e.target.checked)} disabled={loading} />
          <span>Active</span>
        </label>
        <label className="plan-checkbox">
          <input type="checkbox" checked={form.isPopular}
            onChange={(e) => update('isPopular', e.target.checked)} disabled={loading} />
          <span>Popular</span>
        </label>
      </FormRow>
    </Modal>
  );
};

export default AdminPlans;