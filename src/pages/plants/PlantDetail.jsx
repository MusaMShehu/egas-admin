// // src/components/admin/plants/PlantDetail.jsx
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   FaExclamationTriangle, FaSyncAlt, FaPlus, FaTrash, FaMoneyBillWave,
// } from 'react-icons/fa';
// import { adminPlantsAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import Modal from '../../components/ui/Modal';
// import Button from '../../components/ui/Button';
// import Badge from '../../components/ui/Badge';
// import DataTable from '../../components/ui/DataTable';
// import SkeletonLoader from '../../components/ui/SkeletonLoader';
// import FormField from '../../components/ui/FormField';
// import FormRow from '../../components/ui/FormRow';

// const STATUS_VARIANT = {
//   pending_approval: 'warning',
//   active: 'success',
//   suspended: 'danger',
//   inactive: 'neutral',
// };

// const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
// const money = (v) => (v != null ? `₦${Number(v).toLocaleString()}` : '—');

// const PlantDetail = ({ plant, onClose, onRefresh }) => {
//   const open = !!plant;
//   const [tab, setTab] = useState('overview');
//   const [detail, setDetail] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [staff, setStaff] = useState([]);
//   const [prices, setPrices] = useState([]);
//   const [busy, setBusy] = useState(null);
//   const [showAddStaff, setShowAddStaff] = useState(false);
//   const [showAddPrice, setShowAddPrice] = useState(false);

//   const { success, error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     if (!plant?._id) return;
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await adminPlantsAPI.get(plant._id);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load plant');
//         return;
//       }
//       setDetail(body?.data);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [plant?._id]);

//   useEffect(() => {
//     if (!open) { setDetail(null); return; }
//     setTab('overview');
//     setStaff([]);
//     setPrices([]);
//     load();
//   }, [open, load]);

//   useEffect(() => {
//     if (!open) return;
//     if (tab === 'staff' && staff.length === 0) {
//       adminPlantsAPI.staff(plant._id)
//         .then((r) => setStaff(r?.data?.data || []))
//         .catch((e) => showError(e?.message || 'Failed to load staff'));
//     }
//     if (tab === 'prices' && prices.length === 0) {
//       adminPlantsAPI.prices(plant._id)
//         .then((r) => setPrices(r?.data?.data || []))
//         .catch((e) => showError(e?.message || 'Failed to load prices'));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, tab]);

//   const handleRemoveStaff = async (staffId) => {
//     if (!window.confirm('Remove this staff member?')) return;
//     setBusy(staffId);
//     try {
//       await adminPlantsAPI.removeStaff(plant._id, staffId);
//       success('Staff removed');
//       setStaff((s) => s.filter((x) => x._id !== staffId));
//     } catch (err) {
//       showError(err?.message || 'Failed to remove staff');
//     } finally { setBusy(null); }
//   };

//   const handleCancelPrice = async (priceId) => {
//     const reason = window.prompt('Cancellation reason:');
//     if (!reason) return;
//     setBusy(priceId);
//     try {
//       await adminPlantsAPI.cancelPrice(priceId, reason);
//       success('Price agreement cancelled');
//       setPrices((p) => p.map((x) => x._id === priceId ? { ...x, status: 'cancelled' } : x));
//     } catch (err) {
//       showError(err?.message || 'Failed to cancel');
//     } finally { setBusy(null); }
//   };

//   const p = detail?.plant || plant;

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       title={p ? p.name : 'Plant'}
//       subtitle={p?.code ? `Code: ${p.code}` : ''}
//       size="lg"
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose}>Close</Button>
//           <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//             Refresh
//           </Button>
//         </>
//       }
//     >
//       {loading && !detail ? (
//         <SkeletonLoader lines={10} />
//       ) : error ? (
//         <div className="plant-error">
//           <FaExclamationTriangle />
//           <p>{error}</p>
//           <Button onClick={load}>Retry</Button>
//         </div>
//       ) : p ? (
//         <div className="plant-detail">
//           <div className="plant-detail__tabs">
//             <button type="button"
//               className={`plant-tab ${tab === 'overview' ? 'plant-tab--active' : ''}`}
//               onClick={() => setTab('overview')}>Overview</button>
//             <button type="button"
//               className={`plant-tab ${tab === 'staff' ? 'plant-tab--active' : ''}`}
//               onClick={() => setTab('staff')}>Staff</button>
//             <button type="button"
//               className={`plant-tab ${tab === 'prices' ? 'plant-tab--active' : ''}`}
//               onClick={() => setTab('prices')}>Price agreements</button>
//           </div>

//           {tab === 'overview' && (
//             <div className="plant-overview">
//               <Badge variant={STATUS_VARIANT[p.status] || 'neutral'} dot>
//                 {String(p.status).replace(/_/g, ' ')}
//               </Badge>
//               {p.suspensionReason && (
//                 <Badge variant="danger"><FaExclamationTriangle /> {p.suspensionReason}</Badge>
//               )}
//               <div className="plant-overview__grid">
//                 <Cell label="City" value={p.city || '—'} />
//                 <Cell label="State" value={p.state || '—'} />
//                 <Cell label="Address" value={p.address || '—'} />
//                 <Cell label="Service radius" value={`${p.serviceRadiusKm ?? '—'} km`} />
//                 <Cell label="Contact" value={p.contactPerson?.name || '—'} />
//                 <Cell label="Phone" value={p.contactPerson?.phone || '—'} />
//                 <Cell label="Email" value={p.contactPerson?.email || '—'} />
//                 <Cell label="Total refills" value={p.metrics?.totalRefills ?? 0} />
//               </div>
//             </div>
//           )}

//           {tab === 'staff' && (
//             <>
//               <div className="plant-detail__toolbar">
//                 <Button variant="primary" size="sm" leftIcon={<FaPlus />}
//                   onClick={() => setShowAddStaff(true)}>Add staff</Button>
//               </div>
//               <DataTable
//                 columns={[
//                   {
//                     key: 'name', label: 'Name',
//                     render: (s) => `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—',
//                   },
//                   { key: 'email', label: 'Email', render: (s) => s.email || '—' },
//                   { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
//                   { key: 'role', label: 'Role', render: (s) => <Badge variant="info">{s.role}</Badge> },
//                   {
//                     key: 'actions', label: '', align: 'right',
//                     render: (s) => (
//                       <Button variant="ghost" size="sm" leftIcon={<FaTrash />}
//                         loading={busy === s._id}
//                         onClick={() => handleRemoveStaff(s._id)}>Remove</Button>
//                     ),
//                   },
//                 ]}
//                 data={staff}
//                 searchable={false}
//                 pagination={false}
//                 rowKey={(s) => s._id}
//                 emptyState={<p className="plant-muted">No staff yet</p>}
//               />
//             </>
//           )}

//           {tab === 'prices' && (
//             <>
//               <div className="plant-detail__toolbar">
//                 <Button variant="primary" size="sm" leftIcon={<FaMoneyBillWave />}
//                   onClick={() => setShowAddPrice(true)}>New price agreement</Button>
//               </div>
//               <DataTable
//                 columns={[
//                   { key: 'pricePerKg', label: 'Price / kg', render: (x) => money(x.pricePerKg) },
//                   { key: 'currency', label: 'Currency', render: (x) => x.currency || 'NGN' },
//                   { key: 'effectiveFrom', label: 'From', render: (x) => fmt(x.effectiveFrom) },
//                   { key: 'effectiveTo', label: 'To', render: (x) => x.effectiveTo ? fmt(x.effectiveTo) : 'open' },
//                   {
//                     key: 'status', label: 'Status',
//                     render: (x) => <Badge variant={x.status === 'active' ? 'success' : x.status === 'cancelled' ? 'danger' : 'neutral'} dot>{x.status}</Badge>,
//                   },
//                   {
//                     key: 'actions', label: '', align: 'right',
//                     render: (x) => x.status === 'active' ? (
//                       <Button variant="ghost" size="sm"
//                         loading={busy === x._id}
//                         onClick={() => handleCancelPrice(x._id)}>Cancel</Button>
//                     ) : null,
//                   },
//                 ]}
//                 data={prices}
//                 searchable={false}
//                 pagination={false}
//                 rowKey={(x) => x._id}
//                 emptyState={<p className="plant-muted">No price agreements yet</p>}
//               />
//             </>
//           )}

//           {showAddStaff && (
//             <AddStaffDialog
//               plantId={plant._id}
//               onClose={() => setShowAddStaff(false)}
//               onSuccess={() => {
//                 setShowAddStaff(false);
//                 adminPlantsAPI.staff(plant._id)
//                   .then((r) => setStaff(r?.data?.data || []))
//                   .catch(() => {});
//               }}
//             />
//           )}

//           {showAddPrice && (
//             <AddPriceDialog
//               plantId={plant._id}
//               onClose={() => setShowAddPrice(false)}
//               onSuccess={() => {
//                 setShowAddPrice(false);
//                 adminPlantsAPI.prices(plant._id)
//                   .then((r) => setPrices(r?.data?.data || []))
//                   .catch(() => {});
//               }}
//             />
//           )}
//         </div>
//       ) : null}
//     </Modal>
//   );
// };

// const Cell = ({ label, value }) => (
//   <div className="plant-cell">
//     <div className="plant-cell__label">{label}</div>
//     <div className="plant-cell__value">{value}</div>
//   </div>
// );

// const AddStaffDialog = ({ plantId, onClose, onSuccess }) => {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('plant_staff');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const submit = async () => {
//     if (!firstName || !lastName || !email || !phone || !password) {
//       return setError('All fields are required');
//     }
//     if (password.length < 8) return setError('Password must be at least 8 characters');
//     setLoading(true); setError('');
//     try {
//       await adminPlantsAPI.addStaff(plantId, { firstName, lastName, email, phone, password, role });
//       success('Staff added');
//       onSuccess?.();
//     } catch (err) {
//       const msg = err?.message || 'Failed to add staff';
//       setError(msg); showError(msg);
//     } finally { setLoading(false); }
//   };

//   return (
//     <Modal
//       open
//       onClose={loading ? () => {} : onClose}
//       title="Add plant staff"
//       size="md"
//       loading={loading}
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button variant="primary" onClick={submit} loading={loading}>Add staff</Button>
//         </>
//       }
//     >
//       <FormRow cols={2}>
//         <FormField label="First name" name="firstName" value={firstName}
//           onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
//         <FormField label="Last name" name="lastName" value={lastName}
//           onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Email" name="email" type="email" value={email}
//           onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
//         <FormField label="Phone" name="phone" value={phone}
//           onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
//       </FormRow>
//       <FormRow cols={2}>
//         <FormField label="Password" name="password" type="password" value={password}
//           onChange={(e) => setPassword(e.target.value)} required disabled={loading}
//           help="Minimum 8 characters" error={error} />
//         <FormField label="Role" name="role" as="select" value={role}
//           onChange={(e) => setRole(e.target.value)} disabled={loading}>
//           <option value="plant_staff">Staff</option>
//           <option value="plant_operator">Operator</option>
//           <option value="plant_supervisor">Supervisor</option>
//           <option value="plant_admin">Admin</option>
//         </FormField>
//       </FormRow>
//     </Modal>
//   );
// };

// const AddPriceDialog = ({ plantId, onClose, onSuccess }) => {
//   const [pricePerKg, setPricePerKg] = useState('');
//   const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { success, error: showError } = useSnackbar();

//   const submit = async () => {
//     const parsed = parseFloat(pricePerKg);
//     if (!Number.isFinite(parsed) || parsed <= 0) return setError('Enter a positive price');
//     setLoading(true); setError('');
//     try {
//       await adminPlantsAPI.createPrice(plantId, {
//         pricePerKg: parsed,
//         effectiveFrom,
//         notes: notes.trim() || undefined,
//       });
//       success('Price agreement created');
//       onSuccess?.();
//     } catch (err) {
//       const msg = err?.message || 'Failed to create price';
//       setError(msg); showError(msg);
//     } finally { setLoading(false); }
//   };

//   return (
//     <Modal
//       open
//       onClose={loading ? () => {} : onClose}
//       title="New price agreement"
//       subtitle="Supersedes the current active price"
//       size="md"
//       loading={loading}
//       footer={
//         <>
//           <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button variant="primary" onClick={submit} loading={loading}>Create</Button>
//         </>
//       }
//     >
//       <FormRow cols={2}>
//         <FormField label="Price per kg (₦)" name="pricePerKg" type="number" step="0.01"
//           value={pricePerKg}
//           onChange={(e) => { setPricePerKg(e.target.value); setError(''); }}
//           required error={error} disabled={loading} />
//         <FormField label="Effective from" name="effectiveFrom" type="date"
//           value={effectiveFrom}
//           onChange={(e) => setEffectiveFrom(e.target.value)}
//           required disabled={loading} />
//       </FormRow>
//       <FormRow cols={1}>
//         <FormField label="Notes (optional)" name="notes" as="textarea" rows={2}
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//           disabled={loading} />
//       </FormRow>
//     </Modal>
//   );
// };

// export default PlantDetail;























// src/components/admin/plants/PlantDetail.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaExclamationTriangle, FaSyncAlt, FaPlus, FaTrash, FaMoneyBillWave,
  FaMapMarkerAlt, FaEdit, FaPhone, FaEnvelope, FaUser, FaClock,
} from 'react-icons/fa';
import { adminPlantsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';
import CreatePlantDialog from './CreatePlantDialog';

const STATUS_VARIANT = {
  pending_approval: 'warning',
  active: 'success',
  suspended: 'danger',
  inactive: 'neutral',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
const money = (v) => (v != null ? `₦${Number(v).toLocaleString()}` : '—');

const PlantDetail = ({ plant, onClose, onRefresh }) => {
  const open = !!plant;
  const [tab, setTab] = useState('overview');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState([]);
  const [prices, setPrices] = useState([]);
  const [busy, setBusy] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    if (!plant?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminPlantsAPI.get(plant._id);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load plant');
        return;
      }
      setDetail(body?.data);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [plant?._id]);

  useEffect(() => {
    if (!open) { setDetail(null); return; }
    setTab('overview');
    setStaff([]);
    setPrices([]);
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    if (tab === 'staff' && staff.length === 0) {
      adminPlantsAPI.staff(plant._id)
        .then((r) => setStaff(r?.data?.data || []))
        .catch((e) => showError(e?.message || 'Failed to load staff'));
    }
    if (tab === 'prices' && prices.length === 0) {
      adminPlantsAPI.prices(plant._id)
        .then((r) => setPrices(r?.data?.data || []))
        .catch((e) => showError(e?.message || 'Failed to load prices'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm('Remove this staff member?')) return;
    setBusy(staffId);
    try {
      await adminPlantsAPI.removeStaff(plant._id, staffId);
      success('Staff removed');
      setStaff((s) => s.filter((x) => x._id !== staffId));
    } catch (err) {
      showError(err?.message || 'Failed to remove staff');
    } finally { setBusy(null); }
  };

  const handleCancelPrice = async (priceId) => {
    const reason = window.prompt('Cancellation reason:');
    if (!reason || !reason.trim()) return;
    setBusy(priceId);
    try {
      await adminPlantsAPI.cancelPrice(priceId, reason.trim());
      success('Price agreement cancelled');
      setPrices((p) => p.map((x) => x._id === priceId ? { ...x, status: 'cancelled' } : x));
    } catch (err) {
      showError(err?.message || 'Failed to cancel');
    } finally { setBusy(null); }
  };

  const p = detail?.plant || plant;

  // Compute GPS link
  const coords = p?.gpsCoordinates?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;
  const lng = hasCoords ? Number(coords[0]) : null;
  const lat  = hasCoords ? Number(coords[1]) : null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={p ? p.name : 'Plant'}
      subtitle={p?.code ? `Code: ${p.code}` : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" leftIcon={<FaEdit />} onClick={() => setShowEdit(true)}>
            Edit
          </Button>
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        </>
      }
    >
      {loading && !detail ? (
        <SkeletonLoader lines={10} />
      ) : error ? (
        <div className="plant-error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <Button onClick={load}>Retry</Button>
        </div>
      ) : p ? (
        <div className="plant-detail">
          <div className="plant-detail__tabs">
            <button type="button"
              className={`plant-tab ${tab === 'overview' ? 'plant-tab--active' : ''}`}
              onClick={() => setTab('overview')}>Overview</button>
            <button type="button"
              className={`plant-tab ${tab === 'staff' ? 'plant-tab--active' : ''}`}
              onClick={() => setTab('staff')}>Staff</button>
            <button type="button"
              className={`plant-tab ${tab === 'prices' ? 'plant-tab--active' : ''}`}
              onClick={() => setTab('prices')}>Price agreements</button>
          </div>

          {tab === 'overview' && (
            <div className="plant-overview">
              <Badge variant={STATUS_VARIANT[p.status] || 'neutral'} dot>
                {String(p.status).replace(/_/g, ' ')}
              </Badge>
              {p.suspensionReason && (
                <Badge variant="danger"><FaExclamationTriangle /> {p.suspensionReason}</Badge>
              )}

              <div className="plant-overview__grid">
                <Cell label="City" value={p.city || '—'} />
                <Cell label="State" value={p.state || '—'} />
                <Cell label="Address" value={p.address || '—'} span={2} />
                <Cell label="Service radius" value={`${p.serviceRadiusKm ?? '—'} km`} />
                <Cell label="Total refills" value={p.metrics?.totalRefills ?? 0} />
                <Cell label="Staff" value={detail?.staffCount ?? '—'} />
                <Cell label="Last refill" value={fmt(p.metrics?.lastRefillAt)} />
              </div>

              <div className="plant-section">
                <h4 className="plant-section-title">
                  <FaMapMarkerAlt /> GPS coordinates
                </h4>
                {hasCoords ? (
                  <div className="plant-gps">
                    <div>
                      <strong>Lng:</strong> {lng.toFixed(6)}
                    </div>
                    <div>
                      <strong>Lat:</strong> {lat.toFixed(6)}
                    </div>
                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="plant-map-link">
                      Open in Google Maps
                    </a>
                  </div>
                ) : (
                  <p className="plant-muted">Not set</p>
                )}
              </div>

              <div className="plant-section">
                <h4 className="plant-section-title">
                  <FaUser /> Contact person
                </h4>
                <div className="plant-overview__grid">
                  <Cell label="Name" value={p.contactPerson?.name || '—'} />
                  <Cell label="Phone"
                    value={p.contactPerson?.phone
                      ? <span><FaPhone /> {p.contactPerson.phone}</span>
                      : '—'} />
                  <Cell label="Email"
                    value={p.contactPerson?.email
                      ? <span><FaEnvelope /> {p.contactPerson.email}</span>
                      : '—'} />
                </div>
              </div>

              <div className="plant-section">
                <h4 className="plant-section-title">
                  <FaClock /> Operating hours
                </h4>
                <div className="plant-overview__grid">
                  <Cell label="Open"
                    value={p.operatingHours?.open || '—'} />
                  <Cell label="Close"
                    value={p.operatingHours?.close || '—'} />
                  <Cell label="Days"
                    value={(p.operatingHours?.daysOpen || []).join(', ') || '—'}
                    span={2} />
                </div>
              </div>

              {detail?.activePrice && (
                <div className="plant-section">
                  <h4 className="plant-section-title">
                    <FaMoneyBillWave /> Current price
                  </h4>
                  <div className="plant-overview__grid">
                    <Cell label="Price / kg" value={money(detail.activePrice.pricePerKg)} />
                    <Cell label="Effective from" value={fmt(detail.activePrice.effectiveFrom)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'staff' && (
            <>
              <div className="plant-detail__toolbar">
                <Button variant="primary" size="sm" leftIcon={<FaPlus />}
                  onClick={() => setShowAddStaff(true)}>Add staff</Button>
              </div>
              <DataTable
                columns={[
                  {
                    key: 'name', label: 'Name',
                    render: (s) => `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—',
                  },
                  { key: 'email', label: 'Email', render: (s) => s.email || '—' },
                  { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
                  { key: 'role', label: 'Role', render: (s) => <Badge variant="info">{s.role}</Badge> },
                  {
                    key: 'actions', label: '', align: 'right',
                    render: (s) => (
                      <Button variant="ghost" size="sm" leftIcon={<FaTrash />}
                        loading={busy === s._id}
                        onClick={() => handleRemoveStaff(s._id)}>Remove</Button>
                    ),
                  },
                ]}
                data={staff}
                searchable={false}
                pagination={false}
                rowKey={(s) => s._id}
                emptyState={<p className="plant-muted">No staff yet</p>}
              />
            </>
          )}

          {tab === 'prices' && (
            <>
              <div className="plant-detail__toolbar">
                <Button variant="primary" size="sm" leftIcon={<FaMoneyBillWave />}
                  onClick={() => setShowAddPrice(true)}>New price agreement</Button>
              </div>
              <DataTable
                columns={[
                  { key: 'pricePerKg', label: 'Price / kg', render: (x) => money(x.pricePerKg) },
                  { key: 'currency', label: 'Currency', render: (x) => x.currency || 'NGN' },
                  { key: 'effectiveFrom', label: 'From', render: (x) => fmt(x.effectiveFrom) },
                  { key: 'effectiveTo', label: 'To', render: (x) => x.effectiveTo ? fmt(x.effectiveTo) : 'open' },
                  {
                    key: 'status', label: 'Status',
                    render: (x) => <Badge variant={x.status === 'active' ? 'success' : x.status === 'cancelled' ? 'danger' : 'neutral'} dot>{x.status}</Badge>,
                  },
                  {
                    key: 'actions', label: '', align: 'right',
                    render: (x) => x.status === 'active' ? (
                      <Button variant="ghost" size="sm"
                        loading={busy === x._id}
                        onClick={() => handleCancelPrice(x._id)}>Cancel</Button>
                    ) : null,
                  },
                ]}
                data={prices}
                searchable={false}
                pagination={false}
                rowKey={(x) => x._id}
                emptyState={<p className="plant-muted">No price agreements yet</p>}
              />
            </>
          )}

          {showAddStaff && (
            <AddStaffDialog
              plantId={plant._id}
              onClose={() => setShowAddStaff(false)}
              onSuccess={() => {
                setShowAddStaff(false);
                adminPlantsAPI.staff(plant._id)
                  .then((r) => setStaff(r?.data?.data || []))
                  .catch(() => {});
              }}
            />
          )}

          {showAddPrice && (
            <AddPriceDialog
              plantId={plant._id}
              onClose={() => setShowAddPrice(false)}
              onSuccess={() => {
                setShowAddPrice(false);
                adminPlantsAPI.prices(plant._id)
                  .then((r) => setPrices(r?.data?.data || []))
                  .catch(() => {});
              }}
            />
          )}

          {showEdit && p && (
            <CreatePlantDialog
              plant={p}
              onClose={() => setShowEdit(false)}
              onSuccess={() => {
                setShowEdit(false);
                load();
                onRefresh?.();
              }}
            />
          )}
        </div>
      ) : null}
    </Modal>
  );
};

const Cell = ({ label, value, span }) => (
  <div className={`plant-cell${span === 2 ? ' plant-cell--span-2' : ''}`}>
    <div className="plant-cell__label">{label}</div>
    <div className="plant-cell__value">{value}</div>
  </div>
);

const AddStaffDialog = ({ plantId, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('plant_staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const submit = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      return setError('All fields are required');
    }
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      await adminPlantsAPI.addStaff(plantId, { firstName, lastName, email, phone, password, role });
      success('Staff added');
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Failed to add staff';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title="Add plant staff"
      size="md"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={loading}>Add staff</Button>
        </>
      }
    >
      <FormRow cols={2}>
        <FormField label="First name" name="firstName" value={firstName}
          onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
        <FormField label="Last name" name="lastName" value={lastName}
          onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Email" name="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        <FormField label="Phone" name="phone" value={phone}
          onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Password" name="password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required disabled={loading}
          help="Minimum 8 characters" error={error} />
        <FormField label="Role" name="role" as="select" value={role}
          onChange={(e) => setRole(e.target.value)} disabled={loading}>
          <option value="plant_staff">Staff</option>
          <option value="plant_operator">Operator</option>
          <option value="plant_supervisor">Supervisor</option>
          <option value="plant_admin">Admin</option>
        </FormField>
      </FormRow>
    </Modal>
  );
};

const AddPriceDialog = ({ plantId, onClose, onSuccess }) => {
  const [pricePerKg, setPricePerKg] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const submit = async () => {
    const parsed = parseFloat(pricePerKg);
    if (!Number.isFinite(parsed) || parsed <= 0) return setError('Enter a positive price');
    setLoading(true); setError('');
    try {
      await adminPlantsAPI.createPrice(plantId, {
        pricePerKg: parsed,
        effectiveFrom,
        notes: notes.trim() || undefined,
      });
      success('Price agreement created');
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Failed to create price';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title="New price agreement"
      subtitle="Supersedes the current active price"
      size="md"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={loading}>Create</Button>
        </>
      }
    >
      <FormRow cols={2}>
        <FormField label="Price per kg (₦)" name="pricePerKg" type="number" step="0.01"
          value={pricePerKg}
          onChange={(e) => { setPricePerKg(e.target.value); setError(''); }}
          required error={error} disabled={loading} />
        <FormField label="Effective from" name="effectiveFrom" type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          required disabled={loading} />
      </FormRow>
      <FormRow cols={1}>
        <FormField label="Notes (optional)" name="notes" as="textarea" rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading} />
      </FormRow>
    </Modal>
  );
};

export default PlantDetail;