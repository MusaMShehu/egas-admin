// // src/components/admin/plants/AdminPlants.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaEye,
//   FaCheckCircle, FaPauseCircle, FaPlayCircle,
// } from 'react-icons/fa';
// import { adminPlantsAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import { useLiveEvent } from '../../contexts/LiveContext';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import DataTable from '../../components/ui/DataTable';
// import PlantDetail from './PlantDetail';
// import '../../styles/modules/plants.css';

// const STATUS_VARIANT = {
//   pending_approval: 'warning',
//   active: 'success',
//   suspended: 'danger',
//   inactive: 'neutral',
// };

// const STATUS_FILTERS = [
//   { value: 'all', label: 'All statuses' },
//   { value: 'pending_approval', label: 'Pending approval' },
//   { value: 'active', label: 'Active' },
//   { value: 'suspended', label: 'Suspended' },
//   { value: 'inactive', label: 'Inactive' },
// ];

// const AdminPlants = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [status, setStatus] = useState('all');
//   const [search, setSearch] = useState('');
//   const [selected, setSelected] = useState(null);
//   const [busy, setBusy] = useState(null);

//   const { success, error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = { limit: 100, ...(status !== 'all' && { status }) };
//       const res = await adminPlantsAPI.list(params);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load plants');
//         return;
//       }
//       setRows(body?.data || []);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [status]);

//   useEffect(() => { load(); }, [load]);

//   useLiveEvent('plant.approved', load);
//   useLiveEvent('plant.suspended', load);
//   useLiveEvent('plant.activated', load);

//   const filtered = useMemo(() => {
//     if (!search.trim()) return rows;
//     const q = search.trim().toLowerCase();
//     return rows.filter((r) =>
//       String(r.name || '').toLowerCase().includes(q) ||
//       String(r.code || '').toLowerCase().includes(q) ||
//       String(r.city || '').toLowerCase().includes(q) ||
//       String(r.state || '').toLowerCase().includes(q)
//     );
//   }, [rows, search]);

//   const handleApprove = async (p) => {
//     setBusy(p._id);
//     try {
//       await adminPlantsAPI.approve(p._id);
//       success('Plant approved');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to approve');
//     } finally { setBusy(null); }
//   };

//   const handleSuspend = async (p) => {
//     const reason = window.prompt('Suspension reason:');
//     if (!reason) return;
//     setBusy(p._id);
//     try {
//       await adminPlantsAPI.suspend(p._id, reason);
//       success('Plant suspended');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to suspend');
//     } finally { setBusy(null); }
//   };

//   const handleActivate = async (p) => {
//     setBusy(p._id);
//     try {
//       await adminPlantsAPI.activate(p._id);
//       success('Plant activated');
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to activate');
//     } finally { setBusy(null); }
//   };

//   const columns = [
//     {
//       key: 'name',
//       label: 'Plant',
//       render: (r) => (
//         <div>
//           <strong>{r.name}</strong>
//           {r.code && <div className="plant-code">{r.code}</div>}
//         </div>
//       ),
//     },
//     { key: 'location', label: 'Location', render: (r) => `${r.city || '—'}, ${r.state || '—'}` },
//     {
//       key: 'contact',
//       label: 'Contact',
//       render: (r) => (
//         <div>
//           {r.contactPerson?.name && <div>{r.contactPerson.name}</div>}
//           {r.contactPerson?.phone && <div className="plant-muted">{r.contactPerson.phone}</div>}
//         </div>
//       ),
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (r) => (
//         <Badge variant={STATUS_VARIANT[r.status] || 'neutral'} dot>
//           {String(r.status).replace(/_/g, ' ')}
//         </Badge>
//       ),
//     },
//     {
//       key: 'metrics',
//       label: 'Refills',
//       align: 'right',
//       render: (r) => r.metrics?.totalRefills ?? 0,
//     },
//     {
//       key: 'actions',
//       label: '',
//       align: 'right',
//       render: (r) => (
//         <div className="plant-actions" onClick={(e) => e.stopPropagation()}>
//           <Button variant="ghost" size="sm" leftIcon={<FaEye />} onClick={() => setSelected(r)}>
//             Open
//           </Button>
//           {r.status === 'pending_approval' && (
//             <Button variant="ghost" size="sm" leftIcon={<FaCheckCircle />}
//               loading={busy === r._id}
//               onClick={() => handleApprove(r)}>Approve</Button>
//           )}
//           {r.status === 'active' && (
//             <Button variant="ghost" size="sm" leftIcon={<FaPauseCircle />}
//               loading={busy === r._id}
//               onClick={() => handleSuspend(r)}>Suspend</Button>
//           )}
//           {r.status === 'suspended' && (
//             <Button variant="ghost" size="sm" leftIcon={<FaPlayCircle />}
//               loading={busy === r._id}
//               onClick={() => handleActivate(r)}>Activate</Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="plants-page">
//       <PageHeader
//         title="Partner Plants"
//         subtitle="Every LPG plant that refills cylinders for e-GAS"
//         actions={
//           <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//             Refresh
//           </Button>
//         }
//       />

//       <Card padding="md">
//         <div className="plant-filters">
//           <div className="plant-filters__group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               {STATUS_FILTERS.map((s) => (
//                 <option key={s.value} value={s.value}>{s.label}</option>
//               ))}
//             </select>
//           </div>
//           <div className="plant-filters__group plant-filters__group--grow">
//             <label>Search</label>
//             <div className="plant-search">
//               <FaSearch />
//               <input
//                 type="text"
//                 placeholder="Name, code, city, state…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>
//       </Card>

//       {error ? (
//         <div className="plant-error">
//           <FaExclamationTriangle />
//           <p>{error}</p>
//           <Button onClick={load}>Retry</Button>
//         </div>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={filtered}
//           loading={loading}
//           rowKey={(r) => r._id}
//           onRowClick={(r) => setSelected(r)}
//           pagination={{ page: 1, pageSize: 20, total: filtered.length, onChange: () => {} }}
//           emptyState={
//             <div className="plant-empty">
//               <FaInbox />
//               <p>No plants match your filters</p>
//             </div>
//           }
//         />
//       )}

//       <PlantDetail
//         plant={selected}
//         onClose={() => setSelected(null)}
//         onRefresh={load}
//       />
//     </div>
//   );
// };

// export default AdminPlants;



















// src/components/admin/plants/AdminPlants.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaInbox, FaExclamationTriangle, FaEye,
  FaCheckCircle, FaPauseCircle, FaPlayCircle, FaPlus,
} from 'react-icons/fa';
import { adminPlantsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import PlantDetail from './PlantDetail';
import CreatePlantDialog from './CreatePlantDialog';
import '../../styles/modules/plants.css';

const STATUS_VARIANT = {
  pending_approval: 'warning',
  active: 'success',
  suspended: 'danger',
  inactive: 'neutral',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];

const AdminPlants = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 200, ...(status !== 'all' && { status }) };
      const res = await adminPlantsAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load plants');
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

  useLiveEvent('plant.created', load);
  useLiveEvent('plant.updated', load);
  useLiveEvent('plant.approved', load);
  useLiveEvent('plant.suspended', load);
  useLiveEvent('plant.activated', load);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      String(r.name || '').toLowerCase().includes(q) ||
      String(r.code || '').toLowerCase().includes(q) ||
      String(r.city || '').toLowerCase().includes(q) ||
      String(r.state || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const runAction = async (id, fn, okMsg, errMsg) => {
    setBusy(id);
    try {
      await fn();
      success(okMsg);
      await load();
    } catch (err) {
      showError(err?.message || errMsg);
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = (p) =>
    runAction(p._id, () => adminPlantsAPI.approve(p._id), 'Plant approved', 'Failed to approve');

  const handleSuspend = (p) => {
    const reason = window.prompt('Suspension reason:');
    if (!reason || !reason.trim()) return;
    runAction(p._id, () => adminPlantsAPI.suspend(p._id, reason.trim()),
      'Plant suspended', 'Failed to suspend');
  };

  const handleActivate = (p) =>
    runAction(p._id, () => adminPlantsAPI.activate(p._id), 'Plant activated', 'Failed to activate');

  const columns = [
    {
      key: 'name',
      label: 'Plant',
      render: (r) => (
        <div>
          <strong>{r.name}</strong>
          {r.code && <div className="plant-code">{r.code}</div>}
        </div>
      ),
    },
    { key: 'location', label: 'Location', render: (r) => `${r.city || '—'}, ${r.state || '—'}` },
    {
      key: 'contact',
      label: 'Contact',
      render: (r) => (
        <div>
          {r.contactPerson?.name && <div>{r.contactPerson.name}</div>}
          {r.contactPerson?.phone && <div className="plant-muted">{r.contactPerson.phone}</div>}
        </div>
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
    { key: 'metrics', label: 'Refills', align: 'right', render: (r) => r.metrics?.totalRefills ?? 0 },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div className="plant-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" leftIcon={<FaEye />} onClick={() => setSelected(r)}>
            Open
          </Button>
          {r.status === 'pending_approval' && (
            <Button variant="ghost" size="sm" leftIcon={<FaCheckCircle />}
              loading={busy === r._id}
              onClick={() => handleApprove(r)}>Approve</Button>
          )}
          {r.status === 'active' && (
            <Button variant="ghost" size="sm" leftIcon={<FaPauseCircle />}
              loading={busy === r._id}
              onClick={() => handleSuspend(r)}>Suspend</Button>
          )}
          {r.status === 'suspended' && (
            <Button variant="ghost" size="sm" leftIcon={<FaPlayCircle />}
              loading={busy === r._id}
              onClick={() => handleActivate(r)}>Activate</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="plants-page">
      <PageHeader
        title="Partner Plants"
        subtitle="Every LPG plant that refills cylinders for e-GAS"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" leftIcon={<FaPlus />} onClick={() => setShowCreate(true)}>
              Add plant
            </Button>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      <Card padding="md">
        <div className="plant-filters">
          <div className="plant-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="plant-filters__group plant-filters__group--grow">
            <label>Search</label>
            <div className="plant-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Name, code, city, state…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="plant-error">
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
            <div className="plant-empty">
              <FaInbox />
              <p>No plants match your filters</p>
            </div>
          }
        />
      )}

      <PlantDetail
        plant={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
      />

      {showCreate && (
        <CreatePlantDialog
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
};

export default AdminPlants;