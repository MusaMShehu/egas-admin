// // src/pages/admin/support/AdminSupport.jsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   FaSyncAlt, FaSearch, FaExclamationTriangle, FaInbox, FaPaperclip,
//   FaCheckCircle, FaTimesCircle,
// } from 'react-icons/fa';
// import { adminSupportAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import { useLiveEvent } from '../../contexts/LiveContext';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import DataTable from '../../components/ui/DataTable';
// import Modal from '../../components/ui/Modal';
// import FormField from '../../components/ui/FormField';
// import FormRow from '../../components/ui/FormRow';
// import EmptyState from '../../components/ui/EmptyState';
// import '../../styles/modules/support.css';

// const STATUS_VARIANT = {
//   open: 'warning',
//   'in-progress': 'info',
//   resolved: 'success',
//   closed: 'neutral',
// };

// const CATEGORY_VARIANT = {
//   delivery: 'info', payment: 'warning',
//   product: 'primary', account: 'neutral', other: 'neutral',
// };

// const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];
// const CATEGORY_OPTIONS = ['delivery', 'payment', 'product', 'account', 'other'];

// const AdminSupport = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [status, setStatus] = useState('all');
//   const [category, setCategory] = useState('all');
//   const [search, setSearch] = useState('');
//   const [selected, setSelected] = useState(null);

//   const { error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = {
//         limit: 100,
//         ...(status !== 'all' && { status }),
//         ...(category !== 'all' && { category }),
//         ...(search.trim() && { search: search.trim() }),
//       };
//       const res = await adminSupportAPI.list(params);
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load tickets');
//         return;
//       }
//       setTickets(body?.data?.tickets || body?.tickets || []);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//       showError(err?.message || 'Failed to load');
//     } finally {
//       setLoading(false);
//     }
//   }, [status, category, search, showError]);

//   useEffect(() => { load(); }, [load]);
//   useLiveEvent('support.created', load);
//   useLiveEvent('support.resolved', load);

//   const columns = [
//     {
//       key: 'ticketId',
//       label: '#',
//       render: (t) => <strong>{t.ticketId || '—'}</strong>,
//     },
//     {
//       key: 'subject',
//       label: 'Subject',
//       render: (t) => (
//         <div>
//           <div>{t.subject}</div>
//           <div className="sup-muted">
//             {t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : '—'}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'category',
//       label: 'Category',
//       render: (t) => (
//         <Badge variant={CATEGORY_VARIANT[t.category] || 'neutral'}>{t.category || '—'}</Badge>
//       ),
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (t) => (
//         <Badge variant={STATUS_VARIANT[t.status] || 'neutral'} dot>
//           {t.status}
//         </Badge>
//       ),
//     },
//     {
//       key: 'responses',
//       label: 'Replies',
//       align: 'right',
//       render: (t) => t.responses?.length ?? 0,
//     },
//     {
//       key: 'createdAt',
//       label: 'Opened',
//       render: (t) => (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'),
//     },
//   ];

//   return (
//     <div className="support-page">
//       <PageHeader
//         title="Support"
//         subtitle={`${tickets.length} tickets on this view`}
//         actions={
//           <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//             Refresh
//           </Button>
//         }
//       />

//       <Card padding="md">
//         <div className="sup-filters">
//           <div className="sup-filters__group sup-filters__group--grow">
//             <label>Search</label>
//             <div className="sup-search">
//               <FaSearch />
//               <input
//                 type="text"
//                 placeholder="Ticket #, subject, customer…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="sup-filters__group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="all">All statuses</option>
//               {STATUS_OPTIONS.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div>
//           <div className="sup-filters__group">
//             <label>Category</label>
//             <select value={category} onChange={(e) => setCategory(e.target.value)}>
//               <option value="all">All categories</option>
//               {CATEGORY_OPTIONS.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </Card>

//       {error ? (
//         <Card padding="lg">
//           <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load tickets"
//             description={error} action={<Button onClick={load}>Retry</Button>} />
//         </Card>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={tickets}
//           loading={loading}
//           rowKey={(t) => t._id}
//           onRowClick={(t) => setSelected(t)}
//           emptyState={
//             <div className="sup-empty">
//               <FaInbox />
//               <p>No tickets match your filters</p>
//             </div>
//           }
//           pagination={{ page: 1, pageSize: 20, total: tickets.length, onChange: () => {} }}
//         />
//       )}

//       {selected && (
//         <TicketDetailModal
//           ticket={selected}
//           onClose={() => setSelected(null)}
//           onRefresh={load}
//         />
//       )}
//     </div>
//   );
// };

// const TicketDetailModal = ({ ticket, onClose, onRefresh }) => {
//   const [status, setStatus] = useState(ticket.status);
//   const [reply, setReply] = useState('');
//   const [files, setFiles] = useState([]);
//   const [busy, setBusy] = useState(null);
//   const { success, error: showError } = useSnackbar();

//   const handleStatusChange = async (newStatus) => {
//     setBusy('status');
//     try {
//       await adminSupportAPI.updateStatus(ticket._id, newStatus);
//       success('Ticket status updated');
//       setStatus(newStatus);
//       onRefresh?.();
//     } catch (err) {
//       showError(err?.message || 'Status change failed');
//     } finally { setBusy(null); }
//   };

//   const handleReply = async () => {
//     if (!reply.trim() && files.length === 0) return;
//     setBusy('reply');
//     try {
//       await adminSupportAPI.respond(ticket._id, reply.trim(), files);
//       success('Reply sent');
//       setReply('');
//       setFiles([]);
//       onRefresh?.();
//     } catch (err) {
//       showError(err?.message || 'Reply failed');
//     } finally { setBusy(null); }
//   };

//   const onFileInput = (e) => {
//     const picked = Array.from(e.target.files || []);
//     const valid = picked.filter((f) => f.size <= 5 * 1024 * 1024);
//     if (valid.length !== picked.length) showError('Files over 5MB are skipped');
//     setFiles(valid);
//   };

//   const attachmentsOf = (arr) =>
//     (arr || []).map((a) => ({
//       url: a.secure_url || a.url,
//       name: a.original_filename || a.public_id?.split('/').pop() || 'attachment',
//     }));

//   return (
//     <Modal
//       open
//       onClose={onClose}
//       title={`Ticket ${ticket.ticketId}`}
//       subtitle={ticket.subject}
//       size="lg"
//       footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
//     >
//       <div className="sup-detail">
//         <div className="sup-detail__meta">
//           <Badge variant={STATUS_VARIANT[ticket.status]} dot>{ticket.status}</Badge>
//           <Badge variant={CATEGORY_VARIANT[ticket.category]}>{ticket.category}</Badge>
//           <span className="sup-muted">
//             {ticket.user
//               ? `${ticket.user.firstName || ''} ${ticket.user.lastName || ''} — ${ticket.user.email || ''}`
//               : '—'}
//           </span>
//         </div>

//         <Card padding="md">
//           <h4 className="sup-section-title">Description</h4>
//           <p>{ticket.description}</p>
//           {attachmentsOf(ticket.images).length > 0 && (
//             <div className="sup-attachments">
//               {attachmentsOf(ticket.images).map((f, i) => (
//                 <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="sup-attachment">
//                   <FaPaperclip /> {f.name}
//                 </a>
//               ))}
//             </div>
//           )}
//         </Card>

//         <Card padding="md">
//           <h4 className="sup-section-title">Conversation</h4>
//           {(ticket.responses || []).length === 0 ? (
//             <p className="sup-muted">No replies yet.</p>
//           ) : (
//             <div className="sup-thread">
//               {ticket.responses.map((r, i) => (
//                 <div key={i} className={`sup-message ${r.isAdminResponse ? 'sup-message--admin' : 'sup-message--customer'}`}>
//                   <div className="sup-message__head">
//                     <strong>
//                       {r.user
//                         ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim()
//                         : '—'}
//                     </strong>
//                     <span className="sup-muted">
//                       {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
//                     </span>
//                   </div>
//                   <div className="sup-message__body">{r.message}</div>
//                   {attachmentsOf(r.attachments).length > 0 && (
//                     <div className="sup-attachments">
//                       {attachmentsOf(r.attachments).map((f, j) => (
//                         <a key={j} href={f.url} target="_blank" rel="noopener noreferrer" className="sup-attachment">
//                           <FaPaperclip /> {f.name}
//                         </a>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </Card>

//         <Card padding="md">
//           <h4 className="sup-section-title">Update status</h4>
//           <div className="sup-status-actions">
//             {STATUS_OPTIONS.map((s) => (
//               <Button
//                 key={s}
//                 variant={s === status ? 'primary' : 'outline'}
//                 size="sm"
//                 loading={busy === 'status'}
//                 disabled={s === status}
//                 onClick={() => handleStatusChange(s)}
//               >{s}</Button>
//             ))}
//           </div>
//         </Card>

//         <Card padding="md">
//           <h4 className="sup-section-title">Reply</h4>
//           <FormRow cols={1}>
//             <FormField label="Message" name="reply" as="textarea" rows={3}
//               value={reply} onChange={(e) => setReply(e.target.value)} />
//             <FormField label="Attachments" name="files" type="file" multiple
//               onChange={onFileInput}
//               help="Max 5MB per file, images/pdf/docs" />
//           </FormRow>
//           {files.length > 0 && (
//             <div className="sup-file-list">
//               {files.map((f, i) => (
//                 <Badge key={i} variant="info">{f.name}</Badge>
//               ))}
//             </div>
//           )}
//           <div className="sup-reply-actions">
//             <Button variant="primary" loading={busy === 'reply'}
//               disabled={!reply.trim() && files.length === 0}
//               onClick={handleReply}>Send reply</Button>
//           </div>
//         </Card>
//       </div>
//     </Modal>
//   );
// };

// export default AdminSupport;























// src/pages/admin/support/AdminSupport.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaSearch, FaExclamationTriangle, FaInbox, FaPaperclip,
  FaEye, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';
import { adminSupportAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
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
import '../../styles/modules/support.css';

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