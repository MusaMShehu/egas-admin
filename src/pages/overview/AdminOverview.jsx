// // src/pages/admin/overview/AdminOverview.jsx
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   FaUsers, FaCalendarCheck, FaShoppingCart, FaMoneyBillWave,
//   FaSyncAlt, FaExclamationTriangle, FaBell,
// } from 'react-icons/fa';
// import { adminDashboardAPI } from '../../api/endpoints';
// import { useSnackbar } from '../../hooks/useSnackbar';
// import { useLiveEvent } from '../../contexts/LiveContext';
// import PageHeader from '../../components/ui/PageHeader';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import StatCard from '../../components/ui/StatCard';
// import Badge from '../../components/ui/Badge';
// import EmptyState from '../../components/ui/EmptyState';
// import SkeletonLoader from '../../components/ui/SkeletonLoader';
// import '../../styles/modules/overview.css';

// const valueOf = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x ?? 0);
// const growthOf = (x) =>
//   x && typeof x === 'object' && 'growth' in x ? x.growth?.day ?? null : null;

// const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

// const AdminOverview = () => {
//   const [stats, setStats] = useState(null);
//   const [activities, setActivities] = useState([]);
//   const [weeklyRevenue, setWeeklyRevenue] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { error: showError } = useSnackbar();

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await adminDashboardAPI.getOverview();
//       const body = res?.data;
//       if (body?.success === false) {
//         setError(body.message || 'Failed to load dashboard');
//         return;
//       }
//       setStats(body?.data?.stats || null);
//       setActivities(body?.data?.recentActivities || []);
//       setWeeklyRevenue(body?.data?.weeklyRevenue || []);
//     } catch (err) {
//       setError(err?.message || 'Network error');
//       showError(err?.message || 'Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, [showError]);

//   useEffect(() => { load(); }, [load]);

//   // Refresh on key operational events
//   useLiveEvent('order.created', load);
//   useLiveEvent('refill_request.confirmed', load);
//   useLiveEvent('settlement.paid', load);

//   const statCards = stats
//     ? [
//         {
//           label: 'Total Users',
//           value: valueOf(stats.totalUsers).toLocaleString(),
//           change: growthOf(stats.totalUsers),
//           icon: <FaUsers />,
//           color: 'primary',
//         },
//         {
//           label: 'Active Subscriptions',
//           value: valueOf(stats.activeSubscriptions).toLocaleString(),
//           change: growthOf(stats.activeSubscriptions),
//           icon: <FaCalendarCheck />,
//           color: 'success',
//         },
//         {
//           label: 'Total Orders',
//           value: valueOf(stats.totalOrders).toLocaleString(),
//           change: growthOf(stats.totalOrders),
//           icon: <FaShoppingCart />,
//           color: 'info',
//         },
//         {
//           label: "Today's Revenue",
//           value: `₦${Number(valueOf(stats.todaysRevenue)).toLocaleString()}`,
//           change: growthOf(stats.todaysRevenue),
//           icon: <FaMoneyBillWave />,
//           color: 'remnant',
//         },
//       ]
//     : [];

//   return (
//     <div className="admin-overview-page">
//       <PageHeader
//         title="Overview"
//         subtitle="Snapshot of everything happening on e-GAS right now"
//         actions={
//           <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
//             Refresh
//           </Button>
//         }
//       />

//       {error ? (
//         <Card padding="lg">
//           <EmptyState
//             icon={<FaExclamationTriangle />}
//             title="Couldn't load dashboard"
//             description={error}
//             action={<Button onClick={load}>Retry</Button>}
//           />
//         </Card>
//       ) : loading && !stats ? (
//         <>
//           <div className="overview-stats">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} padding="md">
//                 <SkeletonLoader lines={2} />
//               </Card>
//             ))}
//           </div>
//           <Card padding="lg"><SkeletonLoader type="table" rows={5} columns={3} /></Card>
//         </>
//       ) : (
//         <>
//           <div className="overview-stats">
//             {statCards.map((s, i) => (
//               <StatCard
//                 key={i}
//                 label={s.label}
//                 value={s.value}
//                 change={s.change}
//                 icon={s.icon}
//                 color={s.color}
//               />
//             ))}
//           </div>

//           <div className="overview-grid">
//             <Card title="Weekly revenue" subtitle="Completed payments, last 7 days">
//               {weeklyRevenue.length === 0 ? (
//                 <EmptyState title="No completed payments in the last 7 days" />
//               ) : (
//                 <div className="overview-bars">
//                   {weeklyRevenue.map((row) => {
//                     const max = Math.max(
//                       ...weeklyRevenue.map((r) => Number(r.revenue) || 0),
//                       1
//                     );
//                     const h = ((Number(row.revenue) || 0) / max) * 100;
//                     return (
//                       <div key={row._id} className="overview-bar">
//                         <div className="overview-bar__fill" style={{ height: `${h}%` }} />
//                         <div className="overview-bar__label">{row._id?.slice(5) || ''}</div>
//                         <div className="overview-bar__value">
//                           ₦{Number(row.revenue || 0).toLocaleString()}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </Card>

//             <Card title="Recent activity" subtitle="Latest 5 events across the system">
//               {activities.length === 0 ? (
//                 <EmptyState icon={<FaBell />} title="No recent activity" />
//               ) : (
//                 <ul className="overview-activities">
//                   {activities.slice(0, 5).map((a) => (
//                     <li key={a._id} className="overview-activity">
//                       <div className="overview-activity__head">
//                         <Badge variant="info" size="sm">{a.type || 'system'}</Badge>
//                         <span className="overview-activity__time">{fmt(a.createdAt)}</span>
//                       </div>
//                       <div className="overview-activity__desc">{a.description || '—'}</div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </Card>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminOverview;






















// src/pages/admin/overview/AdminOverview.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaCalendarCheck, FaShoppingCart, FaMoneyBillWave,
  FaSyncAlt, FaExclamationTriangle, FaBell, FaArrowRight,
  FaTruck, FaUserCheck, FaRecycle, FaIndustry, FaBox,
  FaCheckCircle, FaClock,
} from 'react-icons/fa';
import { adminDashboardAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLiveEvent } from '../../contexts/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import '../../styles/modules/overview.css';

const valueOf = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x ?? 0);
const growthDay = (x) =>
  x && typeof x === 'object' && 'growth' in x ? x.growth?.day ?? null : null;

const SEVERITY_ICON = {
  danger:  <FaExclamationTriangle />,
  warning: <FaClock />,
  info:    <FaBell />,
  success: <FaCheckCircle />,
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, alertsRes, overviewRes] = await Promise.all([
        adminDashboardAPI.getStats(),
        adminDashboardAPI.getAlerts(),
        adminDashboardAPI.getOverview(),
      ]);
      const statsBody = statsRes?.data;
      const alertsBody = alertsRes?.data;
      const overviewBody = overviewRes?.data;

      if (statsBody?.success === false) {
        setError(statsBody.message || 'Failed to load stats');
      } else {
        setStats(statsBody?.data?.stats || null);
      }
      if (alertsBody?.success) {
        setAlerts(alertsBody.data || []);
      }
      if (overviewBody?.success) {
        setOverview(overviewBody.data || null);
      }
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  // Live refresh on key events
  useLiveEvent('refill_request.confirmed', load);
  useLiveEvent('settlement.paid', load);
  useLiveEvent('dispute.created', load);
  useLiveEvent('refill_request.rejected', load);

  // Build KPI list from stats (growth-aware) with fallbacks to overview flat values
  const kpis = stats
    ? [
        { key: 'users', label: 'Total Users', value: valueOf(stats.totalUsers), change: growthDay(stats.totalUsers), icon: <FaUsers />, tone: 'primary' },
        { key: 'active', label: 'Active Users', value: valueOf(stats.activeUsers), change: growthDay(stats.activeUsers), icon: <FaUserCheck />, tone: 'info' },
        { key: 'subs', label: 'Active Subs', value: valueOf(stats.activeSubscriptions), change: growthDay(stats.activeSubscriptions), icon: <FaCalendarCheck />, tone: 'success' },
        { key: 'orders', label: 'Total Orders', value: valueOf(stats.totalOrders), change: growthDay(stats.totalOrders), icon: <FaShoppingCart />, tone: 'warning' },
        { key: 'deliv', label: "Today's Deliveries", value: valueOf(stats.todaysDeliveries), change: growthDay(stats.todaysDeliveries), icon: <FaTruck />, tone: 'info' },
        { key: 'rev', label: "Today's Revenue", value: `₦${Number(valueOf(stats.todaysRevenue)).toLocaleString()}`, change: growthDay(stats.todaysRevenue), icon: <FaMoneyBillWave />, tone: 'remnant' },
      ]
    : overview?.stats
    ? [
        { key: 'users', label: 'Total Users', value: overview.stats.totalUsers ?? 0, icon: <FaUsers />, tone: 'primary' },
        { key: 'subs', label: 'Active Subs', value: overview.stats.activeSubscriptions ?? 0, icon: <FaCalendarCheck />, tone: 'success' },
        { key: 'orders', label: 'Total Orders', value: overview.stats.totalOrders ?? 0, icon: <FaShoppingCart />, tone: 'warning' },
        { key: 'rev', label: "Today's Revenue", value: `₦${Number(overview.stats.todaysRevenue || 0).toLocaleString()}`, icon: <FaMoneyBillWave />, tone: 'remnant' },
      ]
    : [];

  const weeklyRevenue = overview?.weeklyRevenue || [];
  const activities = overview?.recentActivities || [];
  const maxRevenue = Math.max(1, ...weeklyRevenue.map((r) => Number(r.revenue) || 0));

  return (
    <div className="admin-overview-page">
      <PageHeader
        title="Overview"
        subtitle="Everything happening across e-GAS right now"
        actions={
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />

      {/* ── ALERTS PANEL ── */}
      {alerts.length > 0 && (
        <div className="overview-alerts">
          <div className="overview-alerts__head">
            <h3>
              <FaExclamationTriangle /> Needs your attention
            </h3>
            <span>{alerts.reduce((s, a) => s + a.count, 0)} total items</span>
          </div>
          <div className="overview-alerts__grid">
            {alerts.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`overview-alert overview-alert--${a.severity}`}
                onClick={() => navigate(a.href)}
              >
                <div className="overview-alert__icon">{SEVERITY_ICON[a.severity] || <FaBell />}</div>
                <div className="overview-alert__body">
                  <div className="overview-alert__count">{a.count}</div>
                  <div className="overview-alert__label">{a.label}</div>
                  <div className="overview-alert__desc">{a.description}</div>
                </div>
                <FaArrowRight className="overview-alert__arrow" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI STRIP (compact) ── */}
      {error ? (
        <Card padding="lg">
          <EmptyState
            icon={<FaExclamationTriangle />}
            title="Couldn't load dashboard"
            description={error}
            action={<Button onClick={load}>Retry</Button>}
          />
        </Card>
      ) : loading && kpis.length === 0 ? (
        <div className="overview-kpis">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="mini-stat"><SkeletonLoader lines={2} /></div>
          ))}
        </div>
      ) : (
        <div className="overview-kpis">
          {kpis.map((k) => (
            <div key={k.key} className={`mini-stat mini-stat--${k.tone}`}>
              <div className="mini-stat__top">
                <span className="mini-stat__icon">{k.icon}</span>
                {k.change != null && (
                  <span className={`mini-stat__trend ${k.change >= 0 ? 'up' : 'down'}`}>
                    {k.change >= 0 ? '+' : ''}{Number(k.change).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="mini-stat__value">{k.value}</div>
              <div className="mini-stat__label">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHART + ACTIVITY GRID ── */}
      <div className="overview-grid">
        <Card title="Weekly revenue" subtitle="Completed orders, last 7 days">
          {weeklyRevenue.length === 0 ? (
            <EmptyState title="No completed orders in the last 7 days" />
          ) : (
            <div className="overview-bars">
              {weeklyRevenue.map((row) => {
                const h = ((Number(row.revenue) || 0) / maxRevenue) * 100;
                return (
                  <div key={row._id} className="overview-bar">
                    <div className="overview-bar__fill" style={{ height: `${h}%` }} />
                    <div className="overview-bar__label">{String(row._id || '').slice(5)}</div>
                    <div className="overview-bar__value">₦{Number(row.revenue || 0).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Recent activity" subtitle="Latest events">
          {activities.length === 0 ? (
            <EmptyState icon={<FaBell />} title="No recent activity" />
          ) : (
            <ul className="overview-activities">
              {activities.slice(0, 8).map((a) => (
                <li key={a._id} className="overview-activity">
                  <div className="overview-activity__head">
                    <Badge variant="info" size="sm">{a.type || 'system'}</Badge>
                    <span className="overview-activity__time">{fmt(a.createdAt)}</span>
                  </div>
                  <div className="overview-activity__desc">{a.description || '—'}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;