// // src/pages/admin/reports/AdminReports.jsx
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   FaSyncAlt, FaExclamationTriangle, FaDownload, FaChartLine,
//   FaUsers, FaBox, FaCalendarCheck, FaMoneyBillWave, FaClock,
// } from 'react-icons/fa';
// import { adminReportsAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import StatCard from '../../components/ui/StatCard';
// import Badge from '../../components/ui/Badge';
// import SkeletonLoader from '../../components/ui/SkeletonLoader';
// import EmptyState from '../../components/ui/EmptyState';
// import '../../styles/modules/reports.css';

// const TABS = [
//   { id: 'sales',       label: 'Sales',       icon: <FaChartLine /> },
//   { id: 'users',       label: 'Users',       icon: <FaUsers /> },
//   { id: 'inventory',   label: 'Inventory',   icon: <FaBox /> },
//   { id: 'subscriptions', label: 'Subscriptions', icon: <FaCalendarCheck /> },
//   { id: 'financial',   label: 'Financial',   icon: <FaMoneyBillWave /> },
//   { id: 'realtime',    label: 'Real-time',   icon: <FaClock /> },
// ];

// const defaultDateRange = () => {
//   const now = new Date();
//   const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//   return {
//     startDate: from.toISOString().slice(0, 10),
//     endDate: now.toISOString().slice(0, 10),
//   };
// };

// const AdminReports = () => {
//   const [tab, setTab] = useState('sales');
//   const [range, setRange] = useState(defaultDateRange);
//   const [data, setData] = useState(null);
//   const [realtime, setRealtime] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [exporting, setExporting] = useState(false);

//   const { success, error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = { startDate: range.startDate, endDate: range.endDate };
//       let res;
//       if (tab === 'sales')          res = await adminReportsAPI.sales(params);
//       else if (tab === 'users')     res = await adminReportsAPI.users(params);
//       else if (tab === 'inventory') res = await adminReportsAPI.inventory(params);
//       else if (tab === 'subscriptions') res = await adminReportsAPI.subscriptions(params);
//       else if (tab === 'financial') res = await adminReportsAPI.financial(params);
//       else if (tab === 'realtime')  res = await adminReportsAPI.realtimeMetrics();
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load report');
//         return;
//       }
//       if (tab === 'realtime') setRealtime(body?.data);
//       else setData(body?.data);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//     } finally {
//       setLoading(false);
//     }
//   }, [tab, range.startDate, range.endDate]);

//   useEffect(() => { load(); }, [load]);

//   const handleExport = async (format) => {
//     setExporting(true);
//     try {
//       const res = await adminReportsAPI.export(tab, {
//         format,
//         startDate: range.startDate,
//         endDate: range.endDate,
//       });
//       // Backend currently returns JSON for `json` and throws for `pdf`/`excel`.
//       // If it returns a Blob (future), we download it.
//       const payload = res?.data;
//       if (payload instanceof Blob) {
//         const url = window.URL.createObjectURL(payload);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `${tab}-report-${new Date().toISOString().slice(0, 10)}.${format === 'json' ? 'json' : format}`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//         success('Export downloaded');
//       } else if (payload?.success) {
//         const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `${tab}-report-${new Date().toISOString().slice(0, 10)}.json`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//         success('Export downloaded');
//       } else {
//         showError(payload?.message || 'Export failed');
//       }
//     } catch (err) {
//       showError(err?.message || 'Export failed');
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <div className="reports-page">
//       <PageHeader
//         title="Reports"
//         subtitle="Operational and financial reporting"
//         actions={
//           <>
//             <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//               Refresh
//             </Button>
//             <Button variant="outline" leftIcon={<FaDownload />}
//               onClick={() => handleExport('json')} loading={exporting}>
//               Export JSON
//             </Button>
//           </>
//         }
//       />

//       <Card padding="md">
//         <div className="reports-filters">
//           <div className="reports-filters__group">
//             <label>From</label>
//             <input type="date" value={range.startDate}
//               onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
//           </div>
//           <div className="reports-filters__group">
//             <label>To</label>
//             <input type="date" value={range.endDate}
//               onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
//           </div>
//         </div>
//       </Card>

//       <div className="reports-tabs">
//         {TABS.map((t) => (
//           <button
//             key={t.id}
//             type="button"
//             className={`reports-tab ${tab === t.id ? 'reports-tab--active' : ''}`}
//             onClick={() => setTab(t.id)}
//           >{t.icon} {t.label}</button>
//         ))}
//       </div>

//       {error ? (
//         <Card padding="lg">
//           <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load report"
//             description={error} action={<Button onClick={load}>Retry</Button>} />
//         </Card>
//       ) : loading ? (
//         <Card padding="lg"><SkeletonLoader lines={8} /></Card>
//       ) : tab === 'realtime' ? (
//         <RealtimeView data={realtime} />
//       ) : tab === 'sales' ? (
//         <SalesView data={data} />
//       ) : tab === 'users' ? (
//         <UsersView data={data} />
//       ) : tab === 'inventory' ? (
//         <InventoryView data={data} />
//       ) : tab === 'subscriptions' ? (
//         <SubscriptionsView data={data} />
//       ) : (
//         <FinancialView data={data} />
//       )}
//     </div>
//   );
// };

// // ─── Individual report views ───

// const SalesView = ({ data }) => {
//   const summary = data?.summary || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Total sales" value={`₦${Number(summary.totalSales || 0).toLocaleString()}`} color="primary" icon={<FaChartLine />} />
//         <StatCard label="Orders" value={summary.totalOrders || 0} color="info" icon={<FaChartLine />} />
//         <StatCard label="Avg order value" value={`₦${Number(summary.averageOrderValue || 0).toLocaleString()}`} color="success" icon={<FaChartLine />} />
//         <StatCard label="Conversion" value={`${(summary.conversionRate || 0).toFixed(1)}%`} color="remnant" icon={<FaChartLine />} />
//       </div>
//       <Card title="Top products">
//         {(data?.charts?.topProducts || []).length === 0 ? (
//           <EmptyState title="No sales in this range" />
//         ) : (
//           <ul className="report-list">
//             {data.charts.topProducts.map((p, i) => (
//               <li key={i}>
//                 <span>{p.name || '—'}</span>
//                 <span>{p.unitsSold} units · ₦{Number(p.revenue || 0).toLocaleString()}</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </div>
//   );
// };

// const UsersView = ({ data }) => {
//   const summary = data?.summary || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Total users" value={summary.totalUsers || 0} color="primary" icon={<FaUsers />} />
//         <StatCard label="New users" value={summary.newUsers || 0} color="success" icon={<FaUsers />} />
//         <StatCard label="Active users" value={summary.activeUsers || 0} color="info" icon={<FaUsers />} />
//       </div>
//       <Card title="User tiers">
//         {(data?.charts?.userTiers || []).length === 0 ? (
//           <EmptyState title="No user data" />
//         ) : (
//           <ul className="report-list">
//             {data.charts.userTiers.map((t, i) => (
//               <li key={i}>
//                 <span>{t.tier}</span>
//                 <span>{t.users} users · ₦{Number(t.avgSpend || 0).toLocaleString()} avg</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </div>
//   );
// };

// const InventoryView = ({ data }) => {
//   const summary = data?.summary || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Products" value={summary.totalProducts || 0} color="primary" icon={<FaBox />} />
//         <StatCard label="Low stock" value={summary.lowStockItems || 0} color="warning" icon={<FaBox />} />
//         <StatCard label="Out of stock" value={summary.outOfStockItems || 0} color="danger" icon={<FaBox />} />
//         <StatCard label="Inventory value" value={`₦${Number(summary.inventoryValue || 0).toLocaleString()}`} color="success" icon={<FaBox />} />
//       </div>
//       <Card title="Low stock alerts">
//         {(data?.charts?.lowStockAlerts || []).length === 0 ? (
//           <EmptyState title="All stock healthy" />
//         ) : (
//           <ul className="report-list">
//             {data.charts.lowStockAlerts.map((p, i) => (
//               <li key={i}>
//                 <span>{p.product}</span>
//                 <span><Badge variant={p.status === 'Critical' ? 'danger' : 'warning'}>{p.status}</Badge> {p.currentStock} units</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </div>
//   );
// };

// const SubscriptionsView = ({ data }) => {
//   const summary = data?.summary || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Total" value={summary.totalSubscriptions || 0} color="primary" icon={<FaCalendarCheck />} />
//         <StatCard label="Active" value={summary.activeSubscriptions || 0} color="success" icon={<FaCalendarCheck />} />
//         <StatCard label="MRR" value={`₦${Number(summary.mrr || 0).toLocaleString()}`} color="remnant" icon={<FaCalendarCheck />} />
//         <StatCard label="Churn" value={`${(summary.churnRate || 0).toFixed(1)}%`} color="warning" icon={<FaCalendarCheck />} />
//       </div>
//       <Card title="Plan distribution">
//         {(data?.charts?.planDistribution || []).length === 0 ? (
//           <EmptyState title="No plans yet" />
//         ) : (
//           <ul className="report-list">
//             {data.charts.planDistribution.map((p, i) => (
//               <li key={i}>
//                 <span>{p.plan}</span>
//                 <span>{p.subscribers} subscribers · {p.percentage.toFixed(1)}%</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </Card>
//     </div>
//   );
// };

// const FinancialView = ({ data }) => {
//   const summary = data?.summary || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Revenue" value={`₦${Number(summary.totalRevenue || 0).toLocaleString()}`} color="primary" icon={<FaMoneyBillWave />} />
//         <StatCard label="Expenses" value={`₦${Number(summary.totalExpenses || 0).toLocaleString()}`} color="danger" icon={<FaMoneyBillWave />} />
//         <StatCard label="Net profit" value={`₦${Number(summary.netProfit || 0).toLocaleString()}`} color="success" icon={<FaMoneyBillWave />} />
//         <StatCard label="Margin" value={`${(summary.profitMargin || 0).toFixed(1)}%`} color="remnant" icon={<FaMoneyBillWave />} />
//       </div>
//     </div>
//   );
// };

// const RealtimeView = ({ data }) => {
//   const m = data?.metrics || {};
//   return (
//     <div className="report-view">
//       <div className="report-stats">
//         <StatCard label="Active users" value={m.activeUsers ?? 0} color="primary" icon={<FaClock />} />
//         <StatCard label="Live orders" value={m.liveOrders ?? 0} color="info" icon={<FaClock />} />
//         <StatCard label="Revenue today" value={`₦${Number(m.revenueToday || 0).toLocaleString()}`} color="remnant" icon={<FaClock />} />
//         <StatCard label="Active subs" value={m.subscriptionsActive ?? 0} color="success" icon={<FaClock />} />
//       </div>
//       <Card title="System">
//         <div className="realtime-grid">
//           <Cell label="Health" value={`${m.systemHealth ?? 0}%`} />
//           <Cell label="Uptime" value={`${m.uptime ?? 0}%`} />
//           <Cell label="Response" value={`${m.responseTime ?? 0}ms`} />
//           <Cell label="Error rate" value={`${(m.errorRate ?? 0).toFixed(2)}%`} />
//         </div>
//       </Card>
//     </div>
//   );
// };

// const Cell = ({ label, value }) => (
//   <div className="rep-cell">
//     <div className="rep-cell__label">{label}</div>
//     <div className="rep-cell__value">{value}</div>
//   </div>
// );

// export default AdminReports;























// src/pages/admin/reports/AdminReports.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaExclamationTriangle, FaDownload, FaChartLine,
  FaUsers, FaBox, FaCalendarCheck, FaMoneyBillWave, FaClock,
  FaHeartbeat, FaFilePdf,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { adminReportsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import '../../styles/modules/reports.css';

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

      // if (tab === 'business-health') {
      //   sectionTitle('Overall Health Score');
      //   doc.setFontSize(46);
      //   doc.setTextColor(
      //     data.overallScore >= 85 ? 16 : data.overallScore >= 70 ? 14 : data.overallScore >= 50 ? 245 : 220,
      //     data.overallScore >= 85 ? 185 : data.overallScore >= 70 ? 165 : data.overallScore >= 50 ? 158 : 38,
      //     data.overallScore >= 85 ? 129 : data.overallScore >= 70 ? 14 : 11 : 38
      //   );
      //   doc.setFont('helvetica', 'bold');
      //   doc.text(String(data.overallScore), margin, y + 40);
      if (tab === 'business-health') {
  sectionTitle('Overall Health Score');
  doc.setFontSize(46);
  doc.setTextColor(
    data.overallScore >= 85 ? 16 : data.overallScore >= 70 ? 14 : data.overallScore >= 50 ? 245 : 220,
    data.overallScore >= 85 ? 185 : data.overallScore >= 70 ? 165 : data.overallScore >= 50 ? 158 : 38,
    data.overallScore >= 85 ? 129 : data.overallScore >= 70 ? 14 : data.overallScore >= 50 ? 11 : 38
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
            // ...continuing from: head: [['Product', 'Current stock', 'Status']],
            body: data.charts.lowStockAlerts.map((p) => [
              p.product || '—',
              String(p.currentStock ?? 0),
              p.status || '—',
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        if (tab === 'subscriptions' && data.charts?.byPlan?.length) {
          sectionTitle('Plan Distribution');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Plan', 'Subscribers', 'Revenue']],
            body: data.charts.byPlan.map((p) => [
              p._id || '—',
              String(p.count ?? 0),
              `₦${Number(p.revenue || 0).toLocaleString()}`,
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        if (tab === 'users' && data.charts?.byRole?.length) {
          sectionTitle('Users by Role');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Role', 'Users']],
            body: data.charts.byRole.map((r) => [r._id || '—', String(r.count ?? 0)]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }
      }

      // ── Footer on each page ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `e-GAS Admin · Generated ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 24
        );
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 24, {
          align: 'right',
        });
      }

      const filename = `e-gas-${tab}-${range.startDate}_to_${range.endDate}.pdf`;
      doc.save(filename);
      success('PDF downloaded');
    } catch (err) {
      showError(err?.message || 'PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports-page">
      <PageHeader
        title="Reports"
        subtitle="Deep business performance, health, and financial analytics"
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
            <Button variant="danger" leftIcon={<FaFilePdf />}
              onClick={handleExportPdf}
              loading={exporting}
              disabled={!data}>
              Download PDF
            </Button>
          </>
        }
      />

      {/* Date range selector */}
      <Card padding="md">
        <div className="reports-filters">
          <div className="reports-filters__group reports-filters__group--grow">
            <label>Range</label>
            <div className="reports-presets">
              {Object.keys(RANGE_LABELS).filter((k) => k !== 'custom').map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`reports-preset ${rangeKey === k ? 'reports-preset--active' : ''}`}
                  onClick={() => setPreset(k)}
                >
                  {RANGE_LABELS[k]}
                </button>
              ))}
              <button
                type="button"
                className={`reports-preset ${rangeKey === 'custom' ? 'reports-preset--active' : ''}`}
                onClick={() => setRangeKey('custom')}
              >
                Custom
              </button>
            </div>
          </div>
          {rangeKey === 'custom' && (
            <>
              <div className="reports-filters__group">
                <label>From</label>
                <input type="date" value={range.startDate}
                  onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
              </div>
              <div className="reports-filters__group">
                <label>To</label>
                <input type="date" value={range.endDate}
                  onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="reports-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`reports-tab ${tab === t.id ? 'reports-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load report"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : loading ? (
        <Card padding="lg"><SkeletonLoader lines={10} /></Card>
      ) : tab === 'business-health' ? (
        <BusinessHealthView data={data} />
      ) : tab === 'realtime' ? (
        <RealtimeView data={realtime} />
      ) : tab === 'sales' ? (
        <SalesView data={data} />
      ) : tab === 'users' ? (
        <UsersView data={data} />
      ) : tab === 'inventory' ? (
        <InventoryView data={data} />
      ) : tab === 'subscriptions' ? (
        <SubscriptionsView data={data} />
      ) : (
        <FinancialView data={data} />
      )}
    </div>
  );
};

// ─── Helpers ───
function prettify(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

const StatRow = ({ items }) => (
  <div className="report-stats">
    {items.map((it, i) => (
      <div key={i} className={`mini-stat mini-stat--${it.tone || 'primary'}`}>
        <div className="mini-stat__value">{it.value}</div>
        <div className="mini-stat__label">{it.label}</div>
        {it.change != null && (
          <div className={`report-trend ${it.change >= 0 ? 'up' : 'down'}`}>
            {it.change >= 0 ? '+' : ''}{Number(it.change).toFixed(1)}%
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Business Health ───
const BusinessHealthView = ({ data }) => {
  if (!data) return <EmptyState title="No data" />;
  const score = data.overallScore ?? 0;
  const grade = data.grade || '—';
  const gradeColor =
    score >= 85 ? 'success' :
    score >= 70 ? 'info' :
    score >= 50 ? 'warning' : 'danger';

  return (
    <div className="report-view">
      <Card padding="lg">
        <div className="health-hero">
          <div className={`health-score health-score--${gradeColor}`}>
            <div className="health-score__number">{score}</div>
            <div className="health-score__suffix">/100</div>
          </div>
          <div className="health-hero__text">
            <h2>Overall business health</h2>
            <Badge variant={gradeColor} dot>{String(grade).toUpperCase()}</Badge>
            <p>
              Composite score across disputes, reconciliation, deliveries,
              retention, support, and inventory. Higher is better.
            </p>
          </div>
        </div>
      </Card>

      <div className="health-components">
        {(data.components || []).map((c) => (
          <Card key={c.key} padding="md">
            <div className="health-comp">
              <div className="health-comp__head">
                <span>{c.label}</span>
                <Badge
                  variant={c.score >= 85 ? 'success' : c.score >= 70 ? 'info' : c.score >= 50 ? 'warning' : 'danger'}
                  dot
                >
                  {c.score}/100
                </Badge>
              </div>
              <div className="health-bar">
                <div
                  className="health-bar__fill"
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <div className="health-comp__details">
                {Object.entries(c)
                  .filter(([k]) => !['key', 'label', 'score'].includes(k))
                  .map(([k, v]) => (
                    <span key={k} className="health-comp__detail">
                      {prettify(k)}: <strong>{v}</strong>
                    </span>
                  ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Sales ───
// const SalesView = ({ data }) => {
//   if (!data) return <EmptyState title="No sales data" />;
//   const s = data.summary || {};
//   return (
//     <div className="report-view">
//       <StatRow items={[
//         { label: 'Total sales', value: `₦${Number(s.totalSales || 0).toLocaleString()}`, change: s.salesChange, tone: 'primary' },
//         { label: 'Orders', value: Number(s.totalOrders || 0).toLocaleString(), change: s.ordersChange, tone: 'info' },
//         { label: 'Avg order value', value: `₦${Number(s.averageOrderValue || 0).toLocaleString()}`, change: s.aovChange, tone: 'success' },
//       ]} />

//       <div className="report-grid-2">
//         <Card title="Top products">
//           {(data.charts?.topProducts || []).length === 0 ? (
//             <EmptyState title="No product sales in this range" />
//           ) : (
//             <DataTable
//               columns={[
//                 { key: 'name', label: 'Product' },
//                 { key: 'unitsSold', label: 'Units', align: 'right' },
//                 {
//                   key: 'revenue', label: 'Revenue', align: 'right',
//                   render: (p) => `₦${Number(p.revenue || 0).toLocaleString()}`,
//                 },
//               ]}
//               data={data.charts.topProducts}
//               searchable={false}
//               pagination={false}
//             />
//           )}
//         </Card>

//         <Card title="Payment methods">
//           {(data.charts?.paymentMethodDistribution || []).length === 0 ? (
//             <EmptyState title="No payment data" />
//           ) : (
//             <ul className="report-list">
//               {data.charts.paymentMethodDistribution.map((p, i) => (
//                 <li key={i}>
//                   <span>{p._id || '—'}</span>
//                   <span>{p.count} orders · ₦{Number(p.revenue || 0).toLocaleString()}</span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </Card>
//       </div>

//       {(data.charts?.dailySales || []).length > 0 && (
//         <Card title="Daily sales" subtitle="Revenue and order count per day">
//           <DataTable
//             columns={[
//               { key: '_id', label: 'Date' },
//               { key: 'orders', label: 'Orders', align: 'right' },
//               {
//                 key: 'revenue', label: 'Revenue', align: 'right',
//                 render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
//               },
//             ]}
//             data={data.charts.dailySales}
//             searchable={false}
//             pagination={false}
//           />
//         </Card>
//       )}
//     </div>
//   );
// };


const SalesView = ({ data }) => {
  if (!data) return <EmptyState title="No sales data" />;

  const s = data.summary || {};
  const charts = data.charts || {};

  // Normalize payment method data to an array.
  const rawPaymentMethods = charts.paymentMethodDistribution;

  const paymentMethods = Array.isArray(rawPaymentMethods)
    ? rawPaymentMethods
    : Array.isArray(rawPaymentMethods?.items)
      ? rawPaymentMethods.items
      : Array.isArray(rawPaymentMethods?.data)
        ? rawPaymentMethods.data
        : rawPaymentMethods && typeof rawPaymentMethods === 'object'
          ? rawPaymentMethods._id
            ? [rawPaymentMethods]
            : Object.entries(rawPaymentMethods).map(([method, stats]) => ({
                _id: method,
                count:
                  typeof stats === 'object'
                    ? stats?.count ?? 0
                    : stats ?? 0,
                revenue:
                  typeof stats === 'object'
                    ? stats?.revenue ?? 0
                    : 0,
              }))
          : [];

  const topProducts = Array.isArray(charts.topProducts)
    ? charts.topProducts
    : [];

  const dailySales = Array.isArray(charts.dailySales)
    ? charts.dailySales
    : [];

  return (
    <div className="report-view">
      <StatRow
        items={[
          {
            label: 'Total sales',
            value: `₦${Number(s.totalSales || 0).toLocaleString()}`,
            change: s.salesChange,
            tone: 'primary',
          },
          {
            label: 'Orders',
            value: Number(s.totalOrders || 0).toLocaleString(),
            change: s.ordersChange,
            tone: 'info',
          },
          {
            label: 'Avg order value',
            value: `₦${Number(s.averageOrderValue || 0).toLocaleString()}`,
            change: s.aovChange,
            tone: 'success',
          },
        ]}
      />

      <div className="report-grid-2">
        <Card title="Top products">
          {topProducts.length === 0 ? (
            <EmptyState title="No product sales in this range" />
          ) : (
            <DataTable
              columns={[
                { key: 'name', label: 'Product' },
                { key: 'unitsSold', label: 'Units', align: 'right' },
                {
                  key: 'revenue',
                  label: 'Revenue',
                  align: 'right',
                  render: (p) =>
                    `₦${Number(p.revenue || 0).toLocaleString()}`,
                },
              ]}
              data={topProducts}
              searchable={false}
              pagination={false}
            />
          )}
        </Card>

        <Card title="Payment methods">
          {paymentMethods.length === 0 ? (
            <EmptyState title="No payment data" />
          ) : (
            <ul className="report-list">
              {paymentMethods.map((p, i) => (
                <li key={p._id || i}>
                  <span>{p._id || p.name || p.method || '—'}</span>
                  <span>
                    {Number(p.count || 0).toLocaleString()} orders · ₦
                    {Number(p.revenue || 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {dailySales.length > 0 && (
        <Card
          title="Daily sales"
          subtitle="Revenue and order count per day"
        >
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              { key: 'orders', label: 'Orders', align: 'right' },
              {
                key: 'revenue',
                label: 'Revenue',
                align: 'right',
                render: (r) =>
                  `₦${Number(r.revenue || 0).toLocaleString()}`,
              },
            ]}
            data={dailySales}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};


// ─── Users ───
const UsersView = ({ data }) => {
  if (!data) return <EmptyState title="No user data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Total users', value: Number(s.totalUsers || 0).toLocaleString(), tone: 'primary' },
        { label: 'New users', value: Number(s.newUsers || 0).toLocaleString(), change: s.registrationChange, tone: 'success' },
        { label: 'Active users', value: Number(s.activeUsers || 0).toLocaleString(), tone: 'info' },
      ]} />

      <div className="report-grid-2">
        <Card title="By role">
          {(data.charts?.byRole || []).length === 0 ? (
            <EmptyState title="No role data" />
          ) : (
            <ul className="report-list">
              {data.charts.byRole.map((r, i) => (
                <li key={i}><span>{r._id || '—'}</span><span>{r.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Top cities">
          {(data.charts?.byCity || []).length === 0 ? (
            <EmptyState title="No city data" />
          ) : (
            <ul className="report-list">
              {data.charts.byCity.map((c, i) => (
                <li key={i}><span>{c._id || '—'}</span><span>{c.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {(data.charts?.dailyRegistrations || []).length > 0 && (
        <Card title="Daily registrations">
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              { key: 'count', label: 'New users', align: 'right' },
            ]}
            data={data.charts.dailyRegistrations}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Inventory ───
const InventoryView = ({ data }) => {
  if (!data) return <EmptyState title="No inventory data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Products', value: Number(s.totalProducts || 0).toLocaleString(), tone: 'primary' },
        { label: 'Low stock', value: Number(s.lowStockItems || 0).toLocaleString(), tone: 'warning' },
        { label: 'Out of stock', value: Number(s.outOfStockItems || 0).toLocaleString(), tone: 'danger' },
        { label: 'Inventory value', value: `₦${Number(s.inventoryValue || 0).toLocaleString()}`, tone: 'success' },
      ]} />

      {(data.charts?.lowStockAlerts || []).length > 0 && (
        <Card title="Low stock alerts" subtitle="Reorder these soon">
          <DataTable
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'category', label: 'Category' },
              { key: 'currentStock', label: 'Current', align: 'right' },
              { key: 'minimumRequired', label: 'Min', align: 'right' },
              {
                key: 'status', label: 'Status',
                render: (r) => (
                  <Badge variant={r.status === 'Critical' ? 'danger' : 'warning'} dot>
                    {r.status}
                  </Badge>
                ),
              },
            ]}
            data={data.charts.lowStockAlerts}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}

      {(data.charts?.categoryDistribution || []).length > 0 && (
        <Card title="By category">
          <DataTable
            columns={[
              { key: '_id', label: 'Category' },
              { key: 'count', label: 'Products', align: 'right' },
              { key: 'stock', label: 'Units', align: 'right' },
              {
                key: 'value', label: 'Value', align: 'right',
                render: (r) => `₦${Number(r.value || 0).toLocaleString()}`,
              },
            ]}
            data={data.charts.categoryDistribution}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Subscriptions ───
const SubscriptionsView = ({ data }) => {
  if (!data) return <EmptyState title="No subscription data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Active', value: Number(s.activeSubscriptions || 0).toLocaleString(), tone: 'success' },
        { label: 'New', value: Number(s.newSubscriptions || 0).toLocaleString(), change: s.subscriptionsChange, tone: 'info' },
        { label: 'MRR', value: `₦${Number(s.mrr || 0).toLocaleString()}`, tone: 'primary' },
        { label: 'Churn', value: `${Number(s.churnRate || 0).toFixed(1)}%`, tone: 'danger' },
        { label: 'ARPU', value: `₦${Number(s.arpu || 0).toLocaleString()}`, tone: 'remnant' },
      ]} />

      <div className="report-grid-2">
        <Card title="By plan">
          {(data.charts?.byPlan || []).length === 0 ? (
            <EmptyState title="No plan data" />
          ) : (
            <DataTable
              columns={[
                { key: '_id', label: 'Plan' },
                { key: 'count', label: 'Subs', align: 'right' },
                {
                  key: 'revenue', label: 'Revenue', align: 'right',
                  render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
                },
              ]}
              data={data.charts.byPlan}
              searchable={false}
              pagination={false}
            />
          )}
        </Card>
        <Card title="By frequency">
          {(data.charts?.byFrequency || []).length === 0 ? (
            <EmptyState title="No frequency data" />
          ) : (
            <ul className="report-list">
              {data.charts.byFrequency.map((f, i) => (
                <li key={i}><span>{f._id || '—'}</span><span>{f.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Financial ───
const FinancialView = ({ data }) => {
  if (!data) return <EmptyState title="No financial data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Total revenue', value: `₦${Number(s.totalRevenue || 0).toLocaleString()}`, change: s.revenueChange, tone: 'primary' },
        { label: 'Total expenses', value: `₦${Number(s.totalExpenses || 0).toLocaleString()}`, tone: 'danger' },
        { label: 'Gross profit', value: `₦${Number(s.grossProfit || 0).toLocaleString()}`, tone: 'success' },
        { label: 'Profit margin', value: `${Number(s.profitMargin || 0).toFixed(1)}%`, tone: 'info' },
        { label: 'Cash flow', value: `₦${Number(s.cashFlow || 0).toLocaleString()}`, tone: 'remnant' },
        { label: 'ROI', value: `${Number(s.roi || 0).toFixed(1)}%`, tone: 'warning' },
      ]} />

      {(data.charts?.dailyRevenue || []).length > 0 && (
        <Card title="Daily revenue" subtitle="Completed orders per day">
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              {
                key: 'revenue', label: 'Revenue', align: 'right',
                render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
              },
            ]}
            data={data.charts.dailyRevenue}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Real-time ───
const RealtimeView = ({ data }) => {
  if (!data) return <EmptyState title="No real-time data" />;
  const m = data.metrics || data;
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Active users', value: Number(m.activeUsers || 0).toLocaleString(), tone: 'primary' },
        { label: 'Live orders', value: Number(m.liveOrders || 0).toLocaleString(), tone: 'info' },
        { label: 'Revenue today', value: `₦${Number(m.revenueToday || 0).toLocaleString()}`, tone: 'remnant' },
        { label: 'Active subs', value: Number(m.subscriptionsActive || 0).toLocaleString(), tone: 'success' },
      ]} />

      <Card title="System">
        <div className="realtime-grid">
          <Cell label="Health" value={`${m.systemHealth ?? 0}%`} />
          <Cell label="Uptime" value={`${m.uptime ?? 0}%`} />
          <Cell label="Response" value={`${m.responseTime ?? 0}ms`} />
          <Cell label="Error rate" value={`${Number(m.errorRate || 0).toFixed(2)}%`} />
        </div>
      </Card>
    </div>
  );
};

const Cell = ({ label, value }) => (
  <div className="rep-cell">
    <div className="rep-cell__label">{label}</div>
    <div className="rep-cell__value">{value}</div>
  </div>
);

export default AdminReports;