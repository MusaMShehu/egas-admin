// // src/pages/admin/users/AdminUsers.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaPlus, FaEdit, FaPowerOff, FaTrash, FaEye,
//   FaWallet, FaExclamationTriangle, FaInbox, FaSearch,
// } from 'react-icons/fa';
// import { adminUsersAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import { usePermissions } from '../../hooks/usePermissions';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import DataTable from '../../components/ui/DataTable';
// import Modal from '../../components/ui/Modal';
// import FormField from '../../components/ui/FormField';
// import FormRow from '../../components/ui/FormRow';
// import ConfirmDialog from '../../components/ui/ConfirmDialog';
// import EmptyState from '../../components/ui/EmptyState';
// import '../../styles/modules/users.css';

// const ROLE_VARIANT = {
//   admin: 'danger', 'super-admin': 'danger', superadmin: 'danger',
//   customer_care: 'info', delivery: 'warning',
//   plant_admin: 'success', plant_supervisor: 'success',
//   plant_operator: 'success', plant_staff: 'success',
//   user: 'neutral',
// };

// const ROLE_OPTIONS = [
//   { value: 'user', label: 'Customer' },
//   { value: 'delivery', label: 'Delivery agent' },
//   { value: 'customer_care', label: 'Customer care' },
//   { value: 'admin', label: 'Admin' },
// ];

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [search, setSearch] = useState('');
//   const [role, setRole] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selected, setSelected] = useState(new Set());
//   const [editing, setEditing] = useState(null); // {} for create, { user } for edit
//   const [walletFor, setWalletFor] = useState(null);
//   const [deleting, setDeleting] = useState(null);
//   const [busy, setBusy] = useState(null);

//   const { success, error: showError } = useSnackbar();
//   const { hasPermission } = usePermissions();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = {
//         page,
//         limit,
//         ...(search.trim() && { search: search.trim() }),
//         ...(role !== 'all' && { role }),
//       };
//       const res = await adminUsersAPI.list(params);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load users');
//         return;
//       }
//       setUsers(body?.data?.users || body?.data || []);
//       setTotal(body?.total ?? body?.pagination?.total ?? 0);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, search, role]);

//   useEffect(() => { load(); }, [load]);

//   const stats = useMemo(() => ({
//     total,
//     onPage: users.length,
//   }), [total, users]);

//   const toggleStatus = async (u) => {
//     setBusy(u._id);
//     try {
//       const res = await adminUsersAPI.toggleStatus(u._id, !u.isActive);
//       const body = res?.data;
//       if (body?.success === false) {
//         showError(body.message);
//         return;
//       }
//       success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Failed to toggle status');
//     } finally { setBusy(null); }
//   };

//   const handleDelete = async () => {
//     if (!deleting) return;
//     setBusy(deleting._id);
//     try {
//       await adminUsersAPI.remove(deleting._id);
//       success('User deleted');
//       setDeleting(null);
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Delete failed');
//     } finally { setBusy(null); }
//   };

//   const handleBulkDelete = async () => {
//     if (selected.size === 0) return;
//     if (!window.confirm(`Delete ${selected.size} users?`)) return;
//     setBusy('__bulk');
//     try {
//       await adminUsersAPI.bulkDelete(Array.from(selected));
//       success(`${selected.size} users deleted`);
//       setSelected(new Set());
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Bulk delete failed');
//     } finally { setBusy(null); }
//   };

//   const handleBulkStatus = async (isActive) => {
//     if (selected.size === 0) return;
//     setBusy('__bulk');
//     try {
//       await adminUsersAPI.bulkStatus(Array.from(selected), isActive);
//       success(`${selected.size} users ${isActive ? 'activated' : 'deactivated'}`);
//       setSelected(new Set());
//       await load();
//     } catch (err) {
//       showError(err?.message || 'Bulk status failed');
//     } finally { setBusy(null); }
//   };

//   const columns = [
//     {
//       key: 'name',
//       label: 'User',
//       render: (u) => (
//         <div>
//           <div><strong>{u.firstName} {u.lastName}</strong></div>
//           <div className="user-muted">{u.email}</div>
//         </div>
//       ),
//     },
//     { key: 'phone', label: 'Phone', render: (u) => u.phone || '—' },
//     {
//       key: 'role',
//       label: 'Role',
//       render: (u) => (
//         <Badge variant={ROLE_VARIANT[u.role] || 'neutral'}>{u.role}</Badge>
//       ),
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (u) => (
//         <Badge variant={u.isActive ? 'success' : 'neutral'} dot>
//           {u.isActive ? 'active' : 'inactive'}
//         </Badge>
//       ),
//     },
//     {
//       key: 'createdAt',
//       label: 'Joined',
//       render: (u) =>
//         u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
//     },
//     {
//       key: 'actions',
//       label: '',
//       align: 'right',
//       render: (u) => (
//         <div className="user-actions" onClick={(e) => e.stopPropagation()}>
//           {hasPermission('users:update') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaEdit />}
//               onClick={() => setEditing({ user: u })}>Edit</Button>
//           )}
//           {hasPermission('users:wallet') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaWallet />}
//               onClick={() => setWalletFor(u)}>Wallet</Button>
//           )}
//           {hasPermission('users:toggle') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaPowerOff />}
//               loading={busy === u._id}
//               onClick={() => toggleStatus(u)}>
//               {u.isActive ? 'Deactivate' : 'Activate'}
//             </Button>
//           )}
//           {hasPermission('users:delete') && (
//             <Button variant="ghost" size="sm" leftIcon={<FaTrash />}
//               onClick={() => setDeleting(u)}>Delete</Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="users-page">
//       <PageHeader
//         title="Users"
//         subtitle={`${stats.total.toLocaleString()} total · showing ${stats.onPage}`}
//         actions={
//           <>
//             <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//               Refresh
//             </Button>
//             {hasPermission('users:create') && (
//               <Button variant="primary" leftIcon={<FaPlus />}
//                 onClick={() => setEditing({ user: null })}>New user</Button>
//             )}
//           </>
//         }
//       />

//       <Card padding="md">
//         <div className="users-filters">
//           <div className="users-filters__group users-filters__group--grow">
//             <label>Search</label>
//             <div className="users-search">
//               <FaSearch />
//               <input
//                 type="text"
//                 placeholder="Name, email, phone…"
//                 value={search}
//                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//               />
//             </div>
//           </div>
//           <div className="users-filters__group">
//             <label>Role</label>
//             <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
//               <option value="all">All roles</option>
//               {ROLE_OPTIONS.map((r) => (
//                 <option key={r.value} value={r.value}>{r.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {selected.size > 0 && (
//         <Card padding="md" className="users-bulk">
//           <div className="users-bulk__inner">
//             <strong>{selected.size} selected</strong>
//             <div className="users-bulk__actions">
//               <Button variant="success" size="sm"
//                 onClick={() => handleBulkStatus(true)} disabled={busy === '__bulk'}>
//                 Activate
//               </Button>
//               <Button variant="warning" size="sm"
//                 onClick={() => handleBulkStatus(false)} disabled={busy === '__bulk'}>
//                 Deactivate
//               </Button>
//               <Button variant="danger" size="sm"
//                 onClick={handleBulkDelete} disabled={busy === '__bulk'}>
//                 Delete
//               </Button>
//               <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
//                 Clear
//               </Button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {error ? (
//         <Card padding="lg">
//           <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load users"
//             description={error} action={<Button onClick={load}>Retry</Button>} />
//         </Card>
//       ) : (
//         <>
//           <DataTable
//             columns={columns}
//             data={users}
//             loading={loading}
//             rowKey={(u) => u._id}
//             selectable
//             selectedIds={selected}
//             onSelectionChange={(ids) => setSelected(new Set(ids))}
//             emptyState={
//               <div className="users-empty">
//                 <FaInbox />
//                 <p>No users match your filters</p>
//               </div>
//             }
//             pagination={{
//               page,
//               pageSize: limit,
//               total,
//               onChange: setPage,
//             }}
//           />
//         </>
//       )}

//       {editing && (
//         <UserEditorModal
//           user={editing.user}
//           onClose={() => setEditing(null)}
//           onSaved={() => { setEditing(null); load(); }}
//         />
//       )}

//       {walletFor && (
//         <WalletModal
//           user={walletFor}
//           onClose={() => setWalletFor(null)}
//           onSaved={() => { setWalletFor(null); load(); }}
//         />
//       )}

//       <ConfirmDialog
//         open={!!deleting}
//         onClose={() => setDeleting(null)}
//         title={`Delete ${deleting?.firstName || 'user'}?`}
//         message="This cannot be undone. All associated data remains but the account is deactivated."
//         confirmLabel="Delete"
//         variant="danger"
//         onConfirm={handleDelete}
//       />
//     </div>
//   );
// };

// const UserEditorModal = ({ user, onClose, onSaved }) => {
//   const isEdit = !!user?._id;
//   const [form, setForm] = useState(() => ({
//     firstName: user?.firstName || '',
//     lastName: user?.lastName || '',
//     email: user?.email || '',
//     phone: user?.phone || '',
//     password: '',
//     address: user?.address || '',
//     city: user?.city || '',
//     state: user?.state || '',
//     role: user?.role || 'user',
//     isActive: user?.isActive !== undefined ? user.isActive : true,
//   }));
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

//   const submit = async () => {
//     if (!form.firstName || !form.lastName || !form.email || !form.phone) {
//       return setError('First name, last name, email and phone are required');
//     }
//     if (!isEdit && !form.password) return setError('Password is required');
//     if (form.password && form.password.length < 8) {
//       return setError('Password must be at least 8 characters');
//     }
//     setLoading(true); setError('');
//     try {
//       const payload = { ...form };
//       if (!payload.password) delete payload.password;
//       if (isEdit) {
//         await adminUsersAPI.update(user._id, payload);
//         success('User updated');
//       } else {
//         await adminUsersAPI.create(payload);
//         success('User created');
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
//       title={isEdit ? `Edit ${user.firstName}` : 'New user'}
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
//       <FormRow cols={2}>
//         <FormField label="First name" name="firstName" value={form.firstName}
//           onChange={(e) => update('firstName', e.target.value)} required disabled={loading} />
//         <FormField label="Last name" name="lastName" value={form.lastName}
//           onChange={(e) => update('lastName', e.target.value)} required disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Email" name="email" type="email" value={form.email}
//           onChange={(e) => update('email', e.target.value)} required
//           disabled={loading || isEdit} error={error} />
//         <FormField label="Phone" name="phone" value={form.phone}
//           onChange={(e) => update('phone', e.target.value)} required disabled={loading} />
//       </FormRow>
//       {!isEdit && (
//         <FormRow cols={2}>
//           <FormField label="Password" name="password" type="password" value={form.password}
//             onChange={(e) => update('password', e.target.value)} required
//             help="Min 8 chars, upper + lower + number + special" disabled={loading} />
//           <FormField label="Role" name="role" as="select" value={form.role}
//             onChange={(e) => update('role', e.target.value)} disabled={loading}>
//             {ROLE_OPTIONS.map((r) => (
//               <option key={r.value} value={r.value}>{r.label}</option>
//             ))}
//           </FormField>
//         </FormRow>
//       )}
//       {isEdit && (
//         <FormRow cols={2}>
//           <FormField label="Role" name="role" as="select" value={form.role}
//             onChange={(e) => update('role', e.target.value)} disabled={loading}>
//             {ROLE_OPTIONS.map((r) => (
//               <option key={r.value} value={r.value}>{r.label}</option>
//             ))}
//           </FormField>
//           <label className="users-checkbox">
//             <input type="checkbox" checked={form.isActive}
//               onChange={(e) => update('isActive', e.target.checked)} disabled={loading} />
//             <span>Active account</span>
//           </label>
//         </FormRow>
//       )}
//       <FormRow cols={1}>
//         <FormField label="Address" name="address" value={form.address}
//           onChange={(e) => update('address', e.target.value)} disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="City" name="city" value={form.city}
//           onChange={(e) => update('city', e.target.value)} disabled={loading} />
//         <FormField label="State" name="state" value={form.state}
//           onChange={(e) => update('state', e.target.value)} disabled={loading} />
//       </FormRow>
//     </Modal>
//   );
// };

// const WalletModal = ({ user, onClose, onSaved }) => {
//   const [amount, setAmount] = useState('');
//   const [operation, setOperation] = useState('add');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const submit = async () => {
//     const parsed = Number(amount);
//     if (!Number.isFinite(parsed) || parsed <= 0) {
//       return setError('Enter a positive amount');
//     }
//     setLoading(true); setError('');
//     try {
//       await adminUsersAPI.updateWallet(user._id, parsed, operation);
//       success('Wallet updated');
//       onSaved?.();
//     } catch (err) {
//       const msg = err?.message || 'Wallet update failed';
//       setError(msg); showError(msg);
//     } finally { setLoading(false); }
//   };

//   return (
//     <Modal
//       open
//       onClose={loading ? () => {} : onClose}
//       title={`Adjust wallet — ${user.firstName} ${user.lastName}`}
//       size="sm"
//       loading={loading}
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button variant="primary" onClick={submit} loading={loading}>Apply</Button>
//         </>
//       }
//     >
//       <FormRow cols={2}>
//         <FormField label="Operation" name="operation" as="select" value={operation}
//           onChange={(e) => setOperation(e.target.value)} disabled={loading}>
//           <option value="add">Add funds</option>
//           <option value="subtract">Subtract funds</option>
//           <option value="set">Set balance</option>
//         </FormField>
//         <FormField label="Amount (₦)" name="amount" type="number" step="0.01" min="0"
//           value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }}
//           required error={error} disabled={loading} />
//       </FormRow>
//     </Modal>
//   );
// };

// export default AdminUsers;























// src/pages/admin/users/AdminUsers.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaPlus, FaEdit, FaPowerOff, FaTrash, FaEye,
  FaWallet, FaExclamationTriangle, FaInbox, FaSearch,
} from 'react-icons/fa';
import { adminUsersAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { usePermissions } from '../../hooks/usePermissions';
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
import UserDetailModal from './UserDetailModal';
import '../../styles/modules/users.css';

const ROLE_VARIANT = {
  admin: 'danger', 'super-admin': 'danger', superadmin: 'danger',
  customer_care: 'info', delivery: 'warning',
  plant_admin: 'success', plant_supervisor: 'success',
  plant_operator: 'success', plant_staff: 'success',
  user: 'neutral',
};

const ROLE_OPTIONS = [
  { value: 'user', label: 'Customer' },
  { value: 'delivery', label: 'Delivery agent' },
  { value: 'customer_care', label: 'Customer care' },
  { value: 'admin', label: 'Admin' },
];

const PAGE_SIZES = [5, 10, 25, 50];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [walletFor, setWalletFor] = useState(null);
  const [deleting, setDeleting] = useState(null);
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
        ...(role !== 'all' && { role }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const res = await adminUsersAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load users');
        return;
      }
      setUsers(body?.data?.users || body?.data || []);
      setTotal(body?.total ?? body?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const onPage = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    return { onPage, active, inactive, total };
  }, [users, total]);

  const toggleStatus = async (u) => {
    setBusy(u._id);
    try {
      await adminUsersAPI.toggleStatus(u._id, !u.isActive);
      success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
      await load();
    } catch (err) {
      showError(err?.message || 'Toggle failed');
    } finally { setBusy(null); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(deleting._id);
    try {
      await adminUsersAPI.remove(deleting._id);
      success('User deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      showError(err?.message || 'Delete failed');
    } finally { setBusy(null); }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (u) => (
        <div>
          <div><strong>{u.firstName} {u.lastName}</strong></div>
          <div className="user-muted">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (u) => u.phone || '—',
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => <Badge variant={ROLE_VARIANT[u.role] || 'neutral'}>{u.role}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <Badge variant={u.isActive ? 'success' : 'neutral'} dot>
          {u.isActive ? 'active' : 'inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (u) => (
        <div className="user-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="info" size="sm" leftIcon={<FaEye />}
            onClick={() => setViewing(u)}>View</Button>
          {hasPermission('users:update') && (
            <Button variant="warning" size="sm" leftIcon={<FaEdit />}
              onClick={() => setEditing({ user: u })}>Edit</Button>
          )}
          {hasPermission('users:wallet') && (
            <Button variant="success" size="sm" leftIcon={<FaWallet />}
              onClick={() => setWalletFor(u)}>Wallet</Button>
          )}
          {hasPermission('users:toggle') && (
            <Button variant={u.isActive ? 'secondary' : 'primary'} size="sm"
              leftIcon={<FaPowerOff />}
              loading={busy === u._id}
              onClick={() => toggleStatus(u)}>
              {u.isActive ? 'Off' : 'On'}
            </Button>
          )}
          {hasPermission('users:delete') && (
            <Button variant="danger" size="sm" leftIcon={<FaTrash />}
              onClick={() => setDeleting(u)}>Del</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="users-page">
      <PageHeader
        title="Users"
        subtitle={`${total.toLocaleString()} total · showing ${stats.onPage}`}
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
            {hasPermission('users:create') && (
              <Button variant="primary" leftIcon={<FaPlus />}
                onClick={() => setEditing({ user: null })}>New user</Button>
            )}
          </>
        }
      />

      <div className="users-stats">
        <div className="mini-stat mini-stat--primary">
          <div className="mini-stat__value">{total}</div>
          <div className="mini-stat__label">Total users</div>
        </div>
        <div className="mini-stat mini-stat--success">
          <div className="mini-stat__value">{stats.active}</div>
          <div className="mini-stat__label">Active (page)</div>
        </div>
        <div className="mini-stat mini-stat--warning">
          <div className="mini-stat__value">{stats.inactive}</div>
          <div className="mini-stat__label">Inactive (page)</div>
        </div>
      </div>

      <Card padding="md">
        <div className="users-filters">
          <div className="users-filters__group users-filters__group--grow">
            <label>Search</label>
            <div className="users-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Name, email, phone…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="users-filters__group">
            <label>Role</label>
            <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              <option value="all">All roles</option>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="users-filters__group">
            <label>Status</label>
            <select value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="users-filters__group">
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
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load users"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          rowKey={(u) => u._id}
          onRowClick={(u) => setViewing(u)}
          emptyState={
            <div className="users-empty">
              <FaInbox />
              <p>No users match your filters</p>
            </div>
          }
          pagination={{ page, pageSize: limit, total, onChange: setPage }}
        />
      )}

      {viewing && (
        <UserDetailModal
          user={viewing}
          onClose={() => setViewing(null)}
          onEdit={(u) => { setViewing(null); setEditing({ user: u }); }}
        />
      )}

      {editing && (
        <UserEditorModal
          user={editing.user}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {walletFor && (
        <WalletModal
          user={walletFor}
          onClose={() => setWalletFor(null)}
          onSaved={() => { setWalletFor(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.firstName || 'user'}?`}
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

const UserEditorModal = ({ user, onClose, onSaved }) => {
  const isEdit = !!user?._id;
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    role: user?.role || 'user',
    isActive: user?.isActive !== undefined ? user.isActive : true,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      return setError('First name, last name, email and phone are required');
    }
    if (!isEdit && !form.password) return setError('Password is required');
    if (form.password && form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    setLoading(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEdit) {
        await adminUsersAPI.update(user._id, payload);
        success('User updated');
      } else {
        await adminUsersAPI.create(payload);
        success('User created');
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
      title={isEdit ? `Edit ${user.firstName}` : 'New user'}
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
      <FormRow cols={2}>
        <FormField label="First name" name="firstName" value={form.firstName}
          onChange={(e) => update('firstName', e.target.value)} required disabled={loading} />
        <FormField label="Last name" name="lastName" value={form.lastName}
          onChange={(e) => update('lastName', e.target.value)} required disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Email" name="email" type="email" value={form.email}
          onChange={(e) => update('email', e.target.value)} required
          disabled={loading || isEdit} error={error} />
        <FormField label="Phone" name="phone" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} required disabled={loading} />
      </FormRow>
      {!isEdit && (
        <FormRow cols={2}>
          <FormField label="Password" name="password" type="password" value={form.password}
            onChange={(e) => update('password', e.target.value)} required
            help="Min 8 chars, upper + lower + number + special" disabled={loading} />
          <FormField label="Role" name="role" as="select" value={form.role}
            onChange={(e) => update('role', e.target.value)} disabled={loading}>
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </FormField>
        </FormRow>
      )}
      {isEdit && (
        <FormRow cols={2}>
          <FormField label="Role" name="role" as="select" value={form.role}
            onChange={(e) => update('role', e.target.value)} disabled={loading}>
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </FormField>
          <label className="users-checkbox">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => update('isActive', e.target.checked)} disabled={loading} />
            <span>Active</span>
          </label>
        </FormRow>
      )}
      <FormRow cols={1}>
        <FormField label="Address" name="address" value={form.address}
          onChange={(e) => update('address', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="City" name="city" value={form.city}
          onChange={(e) => update('city', e.target.value)} disabled={loading} />
        <FormField label="State" name="state" value={form.state}
          onChange={(e) => update('state', e.target.value)} disabled={loading} />
      </FormRow>
    </Modal>
  );
};

const WalletModal = ({ user, onClose, onSaved }) => {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const submit = async () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return setError('Enter a positive amount');
    setLoading(true); setError('');
    try {
      await adminUsersAPI.updateWallet(user._id, parsed, operation);
      success('Wallet updated');
      onSaved?.();
    } catch (err) {
      const msg = err?.message || 'Wallet update failed';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title={`Adjust wallet — ${user.firstName} ${user.lastName}`}
      size="sm"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={loading}>Apply</Button>
        </>
      }
    >
      <FormRow cols={2}>
        <FormField label="Operation" name="operation" as="select" value={operation}
          onChange={(e) => setOperation(e.target.value)} disabled={loading}>
          <option value="add">Add</option>
          <option value="subtract">Subtract</option>
          <option value="set">Set</option>
        </FormField>
        <FormField label="Amount (₦)" name="amount" type="number" step="0.01" min="0"
          value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }}
          required error={error} disabled={loading} />
      </FormRow>
    </Modal>
  );
};

export default AdminUsers;