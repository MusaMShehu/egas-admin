// // components/AnalyticsDashboard.js
// import React, { useState, useEffect } from 'react';
// import { 
//   FaArrowLeft, 
//   FaListAlt, 
//   FaPlayCircle, 
//   FaMoneyBillWave, 
//   FaChartLine,
//   FaSpinner,
//   FaChartBar,
//   FaCalendarAlt,
//   FaDollarSign
// } from 'react-icons/fa';
// import './AnalyticsDashboard.css';

// const AnalyticsDashboard = ({ subscriptions, onBack }) => {
//   const [timeRange, setTimeRange] = useState('month');
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     calculateAnalytics();
//   }, [subscriptions, timeRange]);

//   const calculateAnalytics = () => {
//     setLoading(true);
    
//     // Simulate analytics calculation
//     const stats = {
//       totals: {
//         total: subscriptions.length,
//         active: subscriptions.filter(s => s.status === 'active').length,
//         paused: subscriptions.filter(s => s.status === 'paused').length,
//         cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
//         expired: subscriptions.filter(s => s.status === 'expired').length,
//         pending: subscriptions.filter(s => s.status === 'pending').length
//       },
//       revenue: {
//         total: subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0),
//         active: subscriptions
//           .filter(s => s.status === 'active')
//           .reduce((sum, sub) => sum + (sub.price || 0), 0)
//       },
//       distributions: {
//         planType: calculatePlanTypeDistribution(),
//         frequency: calculateFrequencyDistribution(),
//         status: calculateStatusDistribution()
//       },
//       growth: calculateGrowth()
//     };

//     setAnalytics(stats);
//     setLoading(false);
//   };

//   const calculatePlanTypeDistribution = () => {
//     const distribution = {};
//     subscriptions.forEach(sub => {
//       distribution[sub.planType] = (distribution[sub.planType] || 0) + 1;
//     });
//     return Object.entries(distribution).map(([type, count]) => ({
//       _id: type,
//       count,
//       percentage: ((count / subscriptions.length) * 100).toFixed(1)
//     }));
//   };

//   const calculateFrequencyDistribution = () => {
//     const distribution = {};
//     subscriptions.forEach(sub => {
//       distribution[sub.frequency] = (distribution[sub.frequency] || 0) + 1;
//     });
//     return Object.entries(distribution).map(([frequency, count]) => ({
//       _id: frequency,
//       count
//     }));
//   };

//   const calculateStatusDistribution = () => {
//     const distribution = {};
//     subscriptions.forEach(sub => {
//       distribution[sub.status] = (distribution[sub.status] || 0) + 1;
//     });
//     return distribution;
//   };

//   const calculateGrowth = () => {
//     // Simple growth calculation based on creation dates
//     const now = new Date();
//     const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    
//     const currentPeriodSubs = subscriptions.filter(sub => 
//       new Date(sub.createdAt) >= lastMonth
//     ).length;
    
//     const previousPeriodSubs = subscriptions.filter(sub => {
//       const subDate = new Date(sub.createdAt);
//       const twoMonthsAgo = new Date(now);
//       twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
//       return subDate >= twoMonthsAgo && subDate < lastMonth;
//     }).length;

//     const growth = previousPeriodSubs > 0 
//       ? ((currentPeriodSubs - previousPeriodSubs) / previousPeriodSubs) * 100 
//       : currentPeriodSubs > 0 ? 100 : 0;

//     return {
//       current: currentPeriodSubs,
//       previous: previousPeriodSubs,
//       growth: Math.round(growth)
//     };
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN'
//     }).format(amount);
//   };

//   if (loading) {
//     return (
//       <div className="asm-analytics-dashboard">
//         <div className="asm-dashboard-header">
//           <button onClick={onBack} className="asm-btn asm-btn-back">
//             <FaArrowLeft className="asm-icon" /> Back to Subscriptions
//           </button>
//           <h1>Subscription Analytics</h1>
//         </div>
//         <div className="asm-loading-analytics">
//           <FaSpinner className="asm-icon asm-spin" />
//           <p>Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="asm-analytics-dashboard">
//       <div className="asm-dashboard-header">
//         <button onClick={onBack} className="asm-btn asm-btn-back">
//           <FaArrowLeft className="asm-icon" /> Back to Subscriptions
//         </button>
//         <h1>Subscription Analytics</h1>
//         <div className="asm-time-range-selector">
//           <select 
//             value={timeRange} 
//             onChange={(e) => setTimeRange(e.target.value)}
//             className="asm-time-range-select"
//           >
//             <option value="week">Last Week</option>
//             <option value="month">Last Month</option>
//             <option value="quarter">Last Quarter</option>
//             <option value="year">Last Year</option>
//             <option value="all">All Time</option>
//           </select>
//         </div>
//       </div>

//       {analytics && (
//         <div className="asm-analytics-content">
//           {/* Overview Cards */}
//           <div className="asm-overview-cards">
//             <div className="asm-stat-card">
//               <div className="asm-stat-icon asm-total">
//                 <FaListAlt className="asm-icon" />
//               </div>
//               <div className="asm-stat-info">
//                 <h3>{analytics.totals.total}</h3>
//                 <p>Total Subscriptions</p>
//               </div>
//             </div>

//             <div className="asm-stat-card">
//               <div className="asm-stat-icon asm-active">
//                 <FaPlayCircle className="asm-icon" />
//               </div>
//               <div className="asm-stat-info">
//                 <h3>{analytics.totals.active}</h3>
//                 <p>Active</p>
//                 <span className="asm-stat-percentage">
//                   {((analytics.totals.active / analytics.totals.total) * 100).toFixed(1)}%
//                 </span>
//               </div>
//             </div>

//             <div className="asm-stat-card">
//               <div className="asm-stat-icon asm-revenue">
//                 <FaMoneyBillWave className="asm-icon" />
//               </div>
//               <div className="asm-stat-info">
//                 <h3>{formatCurrency(analytics.revenue.active)}</h3>
//                 <p>Active Revenue</p>
//                 <span className="asm-stat-percentage">
//                   Total: {formatCurrency(analytics.revenue.total)}
//                 </span>
//               </div>
//             </div>

//             <div className="asm-stat-card">
//               <div className="asm-stat-icon asm-growth">
//                 <FaChartLine className="asm-icon" />
//               </div>
//               <div className="asm-stat-info">
//                 <h3>{analytics.growth.growth}%</h3>
//                 <p>Growth Rate</p>
//                 <span className="asm-stat-trend">
//                   {analytics.growth.growth >= 0 ? '↑' : '↓'} from previous period
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Charts and Distributions */}
//           <div className="asm-analytics-grid">
//             {/* Plan Type Distribution */}
//             <div className="asm-chart-card">
//               <h3>
//                 <FaChartBar className="asm-icon" /> Plan Type Distribution
//               </h3>
//               <div className="asm-distribution-chart">
//                 {analytics.distributions.planType.map(item => (
//                   <div key={item._id} className="asm-distribution-item">
//                     <div className="asm-distribution-bar">
//                       <div 
//                         className="asm-bar-fill"
//                         style={{ width: `${item.percentage}%` }}
//                       ></div>
//                     </div>
//                     <div className="asm-distribution-label">
//                       <span className="asm-type-name">{item._id}</span>
//                       <span className="asm-type-count">
//                         {item.count} ({item.percentage}%)
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Status Distribution */}
//             <div className="asm-chart-card">
//               <h3>
//                 <FaChartBar className="asm-icon" /> Status Overview
//               </h3>
//               <div className="asm-status-grid">
//                 {Object.entries(analytics.totals).map(([status, count]) => (
//                   status !== 'total' && count > 0 && (
//                     <div key={status} className="asm-status-item">
//                       <span className={`asm-status-indicator asm-status-${status}`}></span>
//                       <span className="asm-status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
//                       <span className="asm-status-count">{count}</span>
//                       <span className="asm-status-percentage">
//                         {((count / analytics.totals.total) * 100).toFixed(1)}%
//                       </span>
//                     </div>
//                   )
//                 ))}
//               </div>
//             </div>

//             {/* Frequency Distribution */}
//             <div className="asm-chart-card">
//               <h3>
//                 <FaCalendarAlt className="asm-icon" /> Delivery Frequency
//               </h3>
//               <div className="asm-frequency-list">
//                 {analytics.distributions.frequency.map(item => (
//                   <div key={item._id} className="asm-frequency-item">
//                     <span className="asm-frequency-name">{item._id}</span>
//                     <div className="asm-frequency-bar">
//                       <div 
//                         className="asm-bar-fill"
//                         style={{ 
//                           width: `${(item.count / analytics.totals.total) * 100}%` 
//                         }}
//                       ></div>
//                     </div>
//                     <span className="asm-frequency-count">{item.count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Revenue by Plan Type */}
//             <div className="asm-chart-card">
//               <h3>
//                 <FaDollarSign className="asm-icon" /> Revenue by Plan Type
//               </h3>
//               <div className="asm-revenue-list">
//                 {analytics.distributions.planType.map(item => {
//                   const revenue = subscriptions
//                     .filter(sub => sub.planType === item._id)
//                     .reduce((sum, sub) => sum + (sub.price || 0), 0);
                  
//                   return (
//                     <div key={item._id} className="asm-revenue-item">
//                       <span className="asm-revenue-type">{item._id}</span>
//                       <span className="asm-revenue-amount">{formatCurrency(revenue)}</span>
//                       <div className="asm-revenue-bar">
//                         <div 
//                           className="asm-bar-fill asm-revenue"
//                           style={{ 
//                             width: `${(revenue / analytics.revenue.total) * 100}%` 
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Summary Statistics */}
//           <div className="asm-summary-section">
//             <h3>Key Metrics</h3>
//             <div className="asm-metrics-grid">
//               <div className="asm-metric-item">
//                 <label>Average Subscription Value</label>
//                 <span className="asm-metric-value">
//                   {formatCurrency(analytics.revenue.total / analytics.totals.total)}
//                 </span>
//               </div>
//               <div className="asm-metric-item">
//                 <label>Active Subscription Rate</label>
//                 <span className="asm-metric-value">
//                   {((analytics.totals.active / analytics.totals.total) * 100).toFixed(1)}%
//                 </span>
//               </div>
//               <div className="asm-metric-item">
//                 <label>Monthly Recurring Revenue</label>
//                 <span className="asm-metric-value">
//                   {formatCurrency(analytics.revenue.active)}
//                 </span>
//               </div>
//               <div className="asm-metric-item">
//                 <label>Churn Rate</label>
//                 <span className="asm-metric-value">
//                   {((analytics.totals.cancelled / analytics.totals.total) * 100).toFixed(1)}%
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AnalyticsDashboard;

// components/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaListAlt, 
  FaPlayCircle, 
  FaMoneyBillWave, 
  FaChartLine,
  FaSpinner,
  FaChartBar,
  FaCalendarAlt,
  FaDollarSign,
  FaSyncAlt
} from 'react-icons/fa';
import { useAdminSubscription } from '../../../hooks/useAdminSubscription';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({});
  
  const { 
    subscriptions: allSubscriptions, 
    loading, 
    error, 
    fetchAnalyticsSubscriptions,
    fetchSubscriptions // Keep this for backward compatibility
  } = useAdminSubscription();

  // Fetch all subscriptions for analytics (no pagination)
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, filters]);

  const loadAnalyticsData = async () => {
    try {
      // Build params for analytics (no pagination, all data)
      const params = {
        ...filters,
        limit: 10000, // Large number to get all data
        page: 1,
        ...(timeRange !== 'all' && getTimeRangeFilter(timeRange))
      };

      let result;
      
      // Try to use the analytics-specific function first
      if (fetchAnalyticsSubscriptions) {
        result = await fetchAnalyticsSubscriptions(params);
      } else {
        // Fallback to regular fetch with large limit
        result = await fetchSubscriptions(params);
      }
      
      if (result.success) {
        calculateAnalytics(result.data || []);
      } else {
        console.error('Failed to load analytics data:', result.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getTimeRangeFilter = (range) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return {}; // All time - no date filter
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  const calculateAnalytics = (subscriptions) => {
    if (!subscriptions || subscriptions.length === 0) {
      setAnalytics({
        totals: {
          total: 0,
          active: 0,
          paused: 0,
          cancelled: 0,
          expired: 0,
          pending: 0
        },
        revenue: {
          total: 0,
          active: 0
        },
        distributions: {
          planType: [],
          frequency: [],
          status: {}
        },
        growth: {
          current: 0,
          previous: 0,
          growth: 0
        }
      });
      return;
    }

    const stats = {
      totals: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        paused: subscriptions.filter(s => s.status === 'paused').length,
        cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
        expired: subscriptions.filter(s => s.status === 'expired').length,
        pending: subscriptions.filter(s => s.status === 'pending').length
      },
      revenue: {
        total: subscriptions.reduce((sum, sub) => sum + (Number(sub.price) || 0), 0),
        active: subscriptions
          .filter(s => s.status === 'active')
          .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0)
      },
      distributions: {
        planType: calculatePlanTypeDistribution(subscriptions),
        frequency: calculateFrequencyDistribution(subscriptions),
        status: calculateStatusDistribution(subscriptions)
      },
      growth: calculateGrowth(subscriptions, timeRange)
    };

    setAnalytics(stats);
  };

  const calculatePlanTypeDistribution = (subscriptions) => {
    const distribution = {};
    subscriptions.forEach(sub => {
      const type = sub.planType || 'unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return Object.entries(distribution).map(([type, count]) => ({
      _id: type,
      count,
      percentage: subscriptions.length > 0 ? ((count / subscriptions.length) * 100).toFixed(1) : '0.0'
    }));
  };

  const calculateFrequencyDistribution = (subscriptions) => {
    const distribution = {};
    subscriptions.forEach(sub => {
      const frequency = sub.frequency || 'unknown';
      distribution[frequency] = (distribution[frequency] || 0) + 1;
    });
    return Object.entries(distribution).map(([frequency, count]) => ({
      _id: frequency,
      count
    }));
  };

  const calculateStatusDistribution = (subscriptions) => {
    const distribution = {};
    subscriptions.forEach(sub => {
      const status = sub.status || 'unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  };

  const calculateGrowth = (subscriptions, range) => {
    if (range === 'all' || subscriptions.length === 0) {
      return {
        current: 0,
        previous: 0,
        growth: 0
      };
    }

    const now = new Date();
    let currentStart, previousStart, previousEnd;
    
    switch (range) {
      case 'week':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 7);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentStart);
        break;
      case 'month':
        currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 1);
        previousStart = new Date(currentStart);
        previousStart.setMonth(previousStart.getMonth() - 1);
        previousEnd = new Date(currentStart);
        break;
      case 'quarter':
        currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 3);
        previousStart = new Date(currentStart);
        previousStart.setMonth(previousStart.getMonth() - 3);
        previousEnd = new Date(currentStart);
        break;
      case 'year':
        currentStart = new Date(now);
        currentStart.setFullYear(now.getFullYear() - 1);
        previousStart = new Date(currentStart);
        previousStart.setFullYear(previousStart.getFullYear() - 1);
        previousEnd = new Date(currentStart);
        break;
      default:
        return {
          current: 0,
          previous: 0,
          growth: 0
        };
    }

    const currentPeriodSubs = subscriptions.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate >= currentStart && subDate <= now;
    }).length;
    
    const previousPeriodSubs = subscriptions.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate >= previousStart && subDate < previousEnd;
    }).length;

    const growth = previousPeriodSubs > 0 
      ? ((currentPeriodSubs - previousPeriodSubs) / previousPeriodSubs) * 100 
      : currentPeriodSubs > 0 ? 100 : 0;

    return {
      current: currentPeriodSubs,
      previous: previousPeriodSubs,
      growth: Math.round(growth)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (loading && !analytics) {
    return (
      <div className="asm-analytics-dashboard">
        <div className="asm-dashboard-header">
          <button onClick={onBack} className="asm-btn asm-btn-back">
            <FaArrowLeft className="asm-icon" /> Back to Subscriptions
          </button>
          <h1>Subscription Analytics</h1>
        </div>
        <div className="asm-loading-analytics">
          <FaSpinner className="asm-icon asm-spin" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="asm-analytics-dashboard">
        <div className="asm-dashboard-header">
          <button onClick={onBack} className="asm-btn asm-btn-back">
            <FaArrowLeft className="asm-icon" /> Back to Subscriptions
          </button>
          <h1>Subscription Analytics</h1>
        </div>
        <div className="asm-error-container">
          <div className="asm-error-icon">⚠️</div>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="asm-btn asm-btn-retry">
            <FaSyncAlt className="asm-icon" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asm-analytics-dashboard">
      <div className="asm-dashboard-header">
        <div className="asm-header-left">
          <button onClick={onBack} className="asm-btn asm-btn-back">
            <FaArrowLeft className="asm-icon" /> Back to Subscriptions
          </button>
          <h1>Subscription Analytics</h1>
        </div>
        
        <div className="asm-header-right">
          <div className="asm-time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="asm-time-range-select"
              disabled={loading}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="asm-btn asm-btn-refresh"
            disabled={loading}
            title="Refresh analytics"
          >
            <FaSyncAlt className={`asm-icon ${loading ? 'asm-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {analytics && (
        <div className="asm-analytics-content">
          {/* Overview Cards */}
          <div className="asm-overview-cards">
            <div className="asm-stat-card">
              <div className="asm-stat-icon asm-total">
                <FaListAlt className="asm-icon" />
              </div>
              <div className="asm-stat-info">
                <h3>{analytics.totals.total.toLocaleString()}</h3>
                <p>Total Subscriptions</p>
                <span className="asm-stat-period">
                  {timeRange === 'all' ? 'All Time' : `Last ${timeRange}`}
                </span>
              </div>
            </div>

            <div className="asm-stat-card">
              <div className="asm-stat-icon asm-active">
                <FaPlayCircle className="asm-icon" />
              </div>
              <div className="asm-stat-info">
                <h3>{analytics.totals.active.toLocaleString()}</h3>
                <p>Active</p>
                <span className="asm-stat-percentage">
                  {analytics.totals.total > 0 
                    ? `${((analytics.totals.active / analytics.totals.total) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="asm-stat-card">
              <div className="asm-stat-icon asm-revenue">
                <FaMoneyBillWave className="asm-icon" />
              </div>
              <div className="asm-stat-info">
                <h3>{formatCurrency(analytics.revenue.active)}</h3>
                <p>Active Revenue</p>
                <span className="asm-stat-total">
                  Total: {formatCurrency(analytics.revenue.total)}
                </span>
              </div>
            </div>

            <div className="asm-stat-card">
              <div className="asm-stat-icon asm-growth">
                <FaChartLine className="asm-icon" />
              </div>
              <div className="asm-stat-info">
                <h3 className={analytics.growth.growth >= 0 ? 'asm-positive' : 'asm-negative'}>
                  {analytics.growth.growth}%
                </h3>
                <p>Growth Rate</p>
                <span className={`asm-stat-trend ${analytics.growth.growth >= 0 ? 'asm-up' : 'asm-down'}`}>
                  {analytics.growth.growth >= 0 ? '↑' : '↓'} from previous period
                </span>
              </div>
            </div>
          </div>

          {/* Charts and Distributions */}
          <div className="asm-analytics-grid">
            {/* Plan Type Distribution */}
            <div className="asm-chart-card">
              <h3>
                <FaChartBar className="asm-icon" /> Plan Type Distribution
              </h3>
              <div className="asm-distribution-chart">
                {analytics.distributions.planType.length > 0 ? (
                  analytics.distributions.planType.map(item => (
                    <div key={item._id} className="asm-distribution-item">
                      <div className="asm-distribution-bar">
                        <div 
                          className="asm-bar-fill"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="asm-distribution-label">
                        <span className="asm-type-name">{item._id}</span>
                        <span className="asm-type-count">
                          {item.count.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="asm-empty-data">
                    No plan type data available
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="asm-chart-card">
              <h3>
                <FaChartBar className="asm-icon" /> Status Overview
              </h3>
              <div className="asm-status-grid">
                {Object.entries(analytics.totals).map(([status, count]) => (
                  status !== 'total' && count > 0 && (
                    <div key={status} className="asm-status-item">
                      <span className={`asm-status-indicator asm-status-${status}`}></span>
                      <span className="asm-status-name">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="asm-status-count">{count.toLocaleString()}</span>
                      <span className="asm-status-percentage">
                        {analytics.totals.total > 0 
                          ? `${((count / analytics.totals.total) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                  )
                ))}
                {analytics.totals.total === 0 && (
                  <div className="asm-empty-data">
                    No status data available
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Distribution */}
            <div className="asm-chart-card">
              <h3>
                <FaCalendarAlt className="asm-icon" /> Delivery Frequency
              </h3>
              <div className="asm-frequency-list">
                {analytics.distributions.frequency.length > 0 ? (
                  analytics.distributions.frequency.map(item => (
                    <div key={item._id} className="asm-frequency-item">
                      <span className="asm-frequency-name">{item._id}</span>
                      <div className="asm-frequency-bar">
                        <div 
                          className="asm-bar-fill"
                          style={{ 
                            width: `${analytics.totals.total > 0 
                              ? (item.count / analytics.totals.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="asm-frequency-count">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="asm-empty-data">
                    No frequency data available
                  </div>
                )}
              </div>
            </div>

            {/* Revenue by Plan Type */}
            <div className="asm-chart-card">
              <h3>
                <FaDollarSign className="asm-icon" /> Revenue by Plan Type
              </h3>
              <div className="asm-revenue-list">
                {analytics.distributions.planType.length > 0 ? (
                  analytics.distributions.planType.map(item => {
                    const revenue = allSubscriptions
                      .filter(sub => sub.planType === item._id)
                      .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);
                    
                    return (
                      <div key={item._id} className="asm-revenue-item">
                        <span className="asm-revenue-type">{item._id}</span>
                        <span className="asm-revenue-amount">{formatCurrency(revenue)}</span>
                        <div className="asm-revenue-bar">
                          <div 
                            className="asm-bar-fill asm-revenue"
                            style={{ 
                              width: `${analytics.revenue.total > 0 
                                ? (revenue / analytics.revenue.total) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="asm-empty-data">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="asm-summary-section">
            <h3>Key Metrics</h3>
            <div className="asm-metrics-grid">
              <div className="asm-metric-item">
                <label>Average Subscription Value</label>
                <span className="asm-metric-value">
                  {formatCurrency(
                    analytics.totals.total > 0 
                      ? analytics.revenue.total / analytics.totals.total 
                      : 0
                  )}
                </span>
              </div>
              <div className="asm-metric-item">
                <label>Active Subscription Rate</label>
                <span className="asm-metric-value">
                  {analytics.totals.total > 0 
                    ? `${((analytics.totals.active / analytics.totals.total) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="asm-metric-item">
                <label>Monthly Recurring Revenue</label>
                <span className="asm-metric-value">
                  {formatCurrency(analytics.revenue.active)}
                </span>
              </div>
              <div className="asm-metric-item">
                <label>Churn Rate</label>
                <span className="asm-metric-value">
                  {analytics.totals.total > 0 
                    ? `${((analytics.totals.cancelled / analytics.totals.total) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;