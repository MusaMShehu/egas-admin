continue exactly from the line chat 5 stopped do not start/rewrite the complete file cut from start just continue from the line stopped
Batch 7 (Continued) — Exact Continuation from Chat 5
Chat 5 was cut off in AdminPlans.jsx inside PlanDetailModal at the line:

jsx
  footer={<Button variant="secondary" onClick={onClose}>Close</Button>
Continuing from exactly that line:

File 7 (continued) — src/pages/admin/plans/AdminPlans.jsx
jsx
// ...continuing from footer={<Button variant="secondary" onClick={onClose}>Close</Button>
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
File 8 — src/pages/admin/support/AdminSupport.jsx
Refactored with filters everywhere, page-size selector, compact stats, colorful hover buttons. Detail modal unchanged from Batch 6 but reorganized.

jsx
// src/pages/admin/support/AdminSupport.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaExclamationTriangle, FaInbox, FaPaperclip,
  FaEye, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';
import { adminSupportAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
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
import '../../../styles/modules/support.css';

const STATUS_VARIANT = {
  open: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  closed: 'neutral',
};

const CATEGORY_VARIANT = {
  delivery: 'info', payment: 'warning',
  product: 'primary', account: 'neutral', other: 'neutral',
};

const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];
const CATEGORY_OPTIONS = ['delivery', 'payment', 'product', 'account', 'other'];
const PAGE_SIZES = [5, 10, 25, 50];

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 200,
        ...(status !== 'all' && { status }),
        ...(category !== 'all' && { category }),
        ...(search.trim() && { search: search.trim() }),
      };
      const res = await adminSupportAPI.list(params);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load tickets');
        return;
      }
      setTickets(body?.data?.tickets || body?.tickets || []);
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, category, search, showError]);

  useEffect(() => { load(); }, [load]);
  useLiveEvent('support.created', load);
  useLiveEvent('support.resolved', load);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in-progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { total: tickets.length, open, inProgress, resolved, closed };
  }, [tickets]);

  const paginated = useMemo(
    () => tickets.slice((page - 1) * limit, page * limit),
    [tickets, page, limit]
  );

  const columns = [
    {
      key: 'ticketId',
      label: '#',
      render: (t) => <strong>{t.ticketId || '—'}</strong>,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (t) => (
        <div>
          <div>{t.subject}</div>
          <div className="sup-muted">
            {t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (t) => (
        <Badge variant={CATEGORY_VARIANT[t.category] || 'neutral'}>{t.category || '—'}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => (
        <Badge variant={STATUS_VARIANT[t.status] || 'neutral'} dot>{t.status}</Badge>
      ),
    },
    {
      key: 'responses',
      label: 'Replies',
      align: 'right',
      render: (t) => t.responses?.length ?? 0,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (t) => (
        <div className="sup-actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="info" size="sm" leftIcon={<FaEye />}
            onClick={() => setSelected(t)}>Open</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="support-page">
      <PageHeader
        title="Support"
        subtitle={`${tickets.length} tickets on this view`}
        actions={
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      <div className="sup-stats">
        <div className="mini-stat mini-stat--primary">
          <div className="mini-stat__value">{stats.total}</div>
          <div className="mini-stat__label">Total</div>
        </div>
        <div className="mini-stat mini-stat--warning">
          <div className="mini-stat__value">{stats.open}</div>
          <div className="mini-stat__label">Open</div>
        </div>
        <div className="mini-stat mini-stat--info">
          <div className="mini-stat__value">{stats.inProgress}</div>
          <div className="mini-stat__label">In progress</div>
        </div>
        <div className="mini-stat mini-stat--success">
          <div className="mini-stat__value">{stats.resolved}</div>
          <div className="mini-stat__label">Resolved</div>
        </div>
      </div>

      <Card padding="md">
        <div className="sup-filters">
          <div className="sup-filters__group sup-filters__group--grow">
            <label>Search</label>
            <div className="sup-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Ticket #, subject, customer…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="sup-filters__group">
            <label>Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sup-filters__group">
            <label>Category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sup-filters__group">
            <label>Page size</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load tickets"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          rowKey={(t) => t._id}
          onRowClick={(t) => setSelected(t)}
          emptyState={
            <div className="sup-empty"><FaInbox /><p>No tickets match your filters</p></div>
          }
          pagination={{ page, pageSize: limit, total: tickets.length, onChange: setPage }}
        />
      )}

      {selected && (
        <TicketDetailModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
};

// ─── Ticket Detail Modal (unchanged behavior from Batch 6) ───
const TicketDetailModal = ({ ticket, onClose, onRefresh }) => {
  const [status, setStatus] = useState(ticket.status);
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(null);
  const { success, error: showError } = useSnackbar();

  const handleStatusChange = async (newStatus) => {
    setBusy('status');
    try {
      await adminSupportAPI.updateStatus(ticket._id, newStatus);
      success('Ticket status updated');
      setStatus(newStatus);
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Status change failed');
    } finally { setBusy(null); }
  };

  const handleReply = async () => {
    if (!reply.trim() && files.length === 0) return;
    setBusy('reply');
    try {
      await adminSupportAPI.respond(ticket._id, reply.trim(), files);
      success('Reply sent');
      setReply('');
      setFiles([]);
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Reply failed');
    } finally { setBusy(null); }
  };

  const onFileInput = (e) => {
    const picked = Array.from(e.target.files || []);
    const valid = picked.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length !== picked.length) showError('Files over 5MB are skipped');
    setFiles(valid);
  };

  const attachmentsOf = (arr) =>
    (arr || []).map((a) => ({
      url: a.secure_url || a.url,
      name: a.original_filename || a.public_id?.split('/').pop() || 'attachment',
    }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ticket ${ticket.ticketId}`}
      subtitle={ticket.subject}
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="sup-detail">
        <div className="sup-detail__meta">
          <Badge variant={STATUS_VARIANT[ticket.status]} dot>{ticket.status}</Badge>
          <Badge variant={CATEGORY_VARIANT[ticket.category]}>{ticket.category}</Badge>
          <span className="sup-muted">
            {ticket.user
              ? `${ticket.user.firstName || ''} ${ticket.user.lastName || ''} — ${ticket.user.email || ''}`
              : '—'}
          </span>
        </div>

        <Card padding="md">
          <h4 className="sup-section-title">Description</h4>
          <p>{ticket.description}</p>
          {attachmentsOf(ticket.images).length > 0 && (
            <div className="sup-attachments">
              {attachmentsOf(ticket.images).map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="sup-attachment">
                  <FaPaperclip /> {f.name}
                </a>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md">
          <h4 className="sup-section-title">Conversation</h4>
          {(ticket.responses || []).length === 0 ? (
            <p className="sup-muted">No replies yet.</p>
          ) : (
            <div className="sup-thread">
              {ticket.responses.map((r, i) => (
                <div key={i} className={`sup-message ${r.isAdminResponse ? 'sup-message--admin' : 'sup-message--customer'}`}>
                  <div className="sup-message__head">
                    <strong>
                      {r.user
                        ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim()
                        : '—'}
                    </strong>
                    <span className="sup-muted">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="sup-message__body">{r.message}</div>
                  {attachmentsOf(r.attachments).length > 0 && (
                    <div className="sup-attachments">
                      {attachmentsOf(r.attachments).map((f, j) => (
                        <a key={j} href={f.url} target="_blank" rel="noopener noreferrer" className="sup-attachment">
                          <FaPaperclip /> {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md">
          <h4 className="sup-section-title">Update status</h4>
          <div className="sup-status-actions">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={s === status ? 'primary' : 'outline'}
                size="sm"
                loading={busy === 'status'}
                disabled={s === status}
                onClick={() => handleStatusChange(s)}
              >{s}</Button>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h4 className="sup-section-title">Reply</h4>
          <FormRow cols={1}>
            <FormField label="Message" name="reply" as="textarea" rows={3}
              value={reply} onChange={(e) => setReply(e.target.value)} />
            <FormField label="Attachments" name="files" type="file" multiple
              onChange={onFileInput}
              help="Max 5MB per file" />
          </FormRow>
          {files.length > 0 && (
            <div className="sup-file-list">
              {files.map((f, i) => (
                <Badge key={i} variant="info">{f.name}</Badge>
              ))}
            </div>
          )}
          <div className="sup-reply-actions">
            <Button variant="primary" loading={busy === 'reply'}
              disabled={!reply.trim() && files.length === 0}
              onClick={handleReply}>Send reply</Button>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default AdminSupport;
File 9 — src/pages/admin/reports/AdminReports.jsx
This is the big one. Adds:

Business Health tab (composite score + component breakdown)

Real-time tab

Client-side PDF export using jspdf + jspdf-autotable with a professional layout

Deep data views for each report type (summary + charts + detailed tables)

Date range picker with presets (7d / 30d / 90d / YTD / custom)

jsx
// src/pages/admin/reports/AdminReports.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaExclamationTriangle, FaDownload, FaChartLine,
  FaUsers, FaBox, FaCalendarCheck, FaMoneyBillWave, FaClock,
  FaHeartbeat, FaFilePdf,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { adminReportsAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import EmptyState from '../../../components/ui/EmptyState';
import '../../../styles/modules/reports.css';

// ─── Date range helpers ───
const toISO = (d) => d.toISOString().slice(0, 10);

const presets = {
  '7d': () => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { startDate: toISO(start), endDate: toISO(end) };
  },
  '30d': () => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { startDate: toISO(start), endDate: toISO(end) };
  },
  '90d': () => {
    const end = new Date();
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
    return { startDate: toISO(start), endDate: toISO(end) };
  },
  'ytd': () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    return { startDate: toISO(start), endDate: toISO(end) };
  },
};

const RANGE_LABELS = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'ytd': 'Year to date',
  custom: 'Custom',
};

const TABS = [
  { id: 'business-health', label: 'Business Health', icon: <FaHeartbeat /> },
  { id: 'sales',           label: 'Sales',           icon: <FaChartLine /> },
  { id: 'users',           label: 'Users',           icon: <FaUsers /> },
  { id: 'subscriptions',   label: 'Subscriptions',   icon: <FaCalendarCheck /> },
  { id: 'financial',       label: 'Financial',       icon: <FaMoneyBillWave /> },
  { id: 'inventory',       label: 'Inventory',       icon: <FaBox /> },
  { id: 'realtime',        label: 'Real-time',       icon: <FaClock /> },
];

const AdminReports = () => {
  const [tab, setTab] = useState('business-health');
  const [rangeKey, setRangeKey] = useState('30d');
  const [range, setRange] = useState(presets['30d']());
  const [data, setData] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { success, error: showError } = useSnackbar();

  const setPreset = (key) => {
    setRangeKey(key);
    if (key !== 'custom' && presets[key]) setRange(presets[key]());
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { startDate: range.startDate, endDate: range.endDate };

      if (tab === 'business-health') {
        const res = await adminReportsAPI.businessHealth(params);
        const body = res?.data;
        if (body?.success === false) { setError(body.message || 'Failed'); return; }
        setData(body?.data);
        return;
      }
      if (tab === 'realtime') {
        const res = await adminReportsAPI.realtimeMetrics();
        const body = res?.data;
        if (body?.success === false) { setError(body.message || 'Failed'); return; }
        setRealtime(body?.data);
        return;
      }
      const map = {
        sales: adminReportsAPI.sales,
        users: adminReportsAPI.users,
        inventory: adminReportsAPI.inventory,
        subscriptions: adminReportsAPI.subscriptions,
        financial: adminReportsAPI.financial,
      };
      const res = await map[tab](params);
      const body = res?.data;
      if (body?.success === false) { setError(body.message || 'Failed'); return; }
      setData(body?.data);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [tab, range]);

  useEffect(() => { load(); }, [load]);

  // ─── PDF export (client-side, jspdf) ───
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      if (!data) throw new Error('No data to export');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      // ── Header band ──
      doc.setFillColor(111, 66, 193);
      doc.rect(0, 0, pageWidth, 90, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('e-GAS', margin, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Admin Performance Report', margin, 60);
      doc.setFontSize(9);
      doc.text(
        `${tab.replace('-', ' ').toUpperCase()} · ${RANGE_LABELS[rangeKey]}`,
        margin,
        76
      );
      doc.text(
        `${range.startDate} → ${range.endDate}`,
        pageWidth - margin,
        76,
        { align: 'right' }
      );
      y = 115;

      // ── Section title helper ──
      const sectionTitle = (title) => {
        if (y > pageHeight - 120) { doc.addPage(); y = margin; }
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
      };

      // ── KPI table ──
      const summary = data.summary || {};
      const summaryRows = Object.entries(summary)
        .filter(([k]) => !k.toLowerCase().includes('change'))
        .map(([k, v]) => [prettify(k), typeof v === 'number' ? v.toLocaleString() : String(v ?? '—')]);

      if (tab === 'business-health') {
        sectionTitle('Overall Health Score');
        doc.setFontSize(46);
        doc.setTextColor(
          data.overallScore >= 85 ? 16 : data.overallScore >= 70 ? 14 : data.overallScore >= 50 ? 245 : 220,
          data.overallScore >= 85 ? 185 : data.overallScore >= 70 ? 165 : data.overallScore >= 50 ? 158 : 38,
          data.overallScore >= 85 ? 129 : data.overallScore >= 70 ? 14 : 11 : 38
        );
        doc.setFont('helvetica', 'bold');
        doc.text(String(data.overallScore), margin, y + 40);
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `/100 — ${String(data.grade || '').toUpperCase()}`,
          margin + 90,
          y + 40
        );
        y += 70;

        sectionTitle('Component Breakdown');
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Component', 'Score', 'Details']],
          body: (data.components || []).map((c) => [
            c.label,
            `${c.score}/100`,
            Object.entries(c)
              .filter(([k]) => !['key', 'label', 'score'].includes(k))
              .map(([k, v]) => `${prettify(k)}: ${v}`)
              .join(' · '),
          ]),
          styles: { fontSize: 9, cellPadding: 6 },
          headStyles: { fillColor: [111, 66, 193], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
        });
        y = doc.lastAutoTable.finalY + 20;
      } else {
        sectionTitle('Summary');
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Metric', 'Value']],
          body: summaryRows,
          styles: { fontSize: 10, cellPadding: 6 },
          headStyles: { fillColor: [111, 66, 193], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: { 0: { fontStyle: 'bold' } },
        });
        y = doc.lastAutoTable.finalY + 20;

        // ── Tab-specific detail tables ──
        if (tab === 'sales' && data.charts?.topProducts?.length) {
          sectionTitle('Top Products');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Product', 'Units sold', 'Revenue']],
            body: data.charts.topProducts.map((p) => [
              p.name || '—',
              String(p.unitsSold ?? 0),
              `₦${Number(p.revenue || 0).toLocaleString()}`,
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        if (tab === 'inventory' && data.charts?.lowStockAlerts?.length) {
          sectionTitle('Low Stock Alerts');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Product', 'Current stock', 'Status']],