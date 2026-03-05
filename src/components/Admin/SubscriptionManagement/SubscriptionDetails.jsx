// // components/SubscriptionDetails.js
// import React, { useState } from 'react';
// import { 
//   FaArrowLeft, 
//   FaPause, 
//   FaPlay, 
//   FaTimes, 
//   FaTrash, 
//   FaSpinner, 
//   FaBoxOpen,
//   FaHistory,
//   FaUser,
//   FaTruck,
//   FaInfoCircle
// } from 'react-icons/fa';
// import RoleBasedAccess from './RoleBasedAccess';
// import './SubscriptionDetails.css';

// const SubscriptionDetails = ({
//   subscription,
//   onBack,
//   onUpdateSubscription,
//   onDeleteSubscription,
//   onPauseSubscription,
//   onResumeSubscription,
//   onCancelSubscription,
//   userRole
// }) => {
//   const [activeTab, setActiveTab] = useState('details');
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);

//   const handleAction = async (action) => {
//     setActionLoading(action);
//     setLoading(true);
    
//     try {
//       switch (action) {
//         case 'pause':
//           await onPauseSubscription(subscription._id);
//           break;
//         case 'resume':
//           await onResumeSubscription(subscription._id);
//           break;
//         case 'cancel':
//           if (window.confirm('Are you sure you want to cancel this subscription?')) {
//             await onCancelSubscription(subscription._id);
//           }
//           break;
//         case 'delete':
//           if (window.confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
//             await onDeleteSubscription(subscription._id);
//           }
//           break;
//         default:
//           break;
//       }
//     } finally {
//       setActionLoading(null);
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN'
//     }).format(amount);
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       active: { class: 'asm-status-active', label: 'Active' },
//       paused: { class: 'asm-status-paused', label: 'Paused' },
//       cancelled: { class: 'asm-status-cancelled', label: 'Cancelled' },
//       expired: { class: 'asm-status-expired', label: 'Expired' },
//       pending: { class: 'asm-status-pending', label: 'Pending' }
//     };
    
//     const config = statusConfig[status] || { class: 'asm-status-default', label: status };
//     return <span className={`asm-status-badge ${config.class}`}>{config.label}</span>;
//   };

//   const getRemainingDays = () => {
//     if (subscription.status === 'paused' && subscription.remainingDays !== null) {
//       return subscription.remainingDays;
//     }
    
//     if (subscription.endDate) {
//       const now = new Date();
//       const end = new Date(subscription.endDate);
//       const diffTime = end - now;
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       return Math.max(diffDays, 0);
//     }
    
//     return null;
//   };

//   const remainingDays = getRemainingDays();

//   return (
//     <div className="asm-subscription-details">
//       <div className="asm-details-header">
//         <button onClick={onBack} className="asm-btn asm-btn-back">
//           <FaArrowLeft className="asm-icon" /> Back to List
//         </button>
//         <h1>Subscription Details</h1>
//         <div className="asm-header-actions">
//           {subscription.status === 'active' && (
//             <RoleBasedAccess permission="subscriptions:update">
//               <button
//                 onClick={() => handleAction('pause')}
//                 className="asm-btn asm-btn-warning"
//                 disabled={loading}
//               >
//                 {actionLoading === 'pause' ? (
//                   <FaSpinner className="asm-icon asm-spin" />
//                 ) : (
//                   <FaPause className="asm-icon" />
//                 )}
//                 Pause
//               </button>
//             </RoleBasedAccess>
//           )}
          
//           {subscription.status === 'paused' && (
//             <RoleBasedAccess permission="subscriptions:update">
//               <button
//                 onClick={() => handleAction('resume')}
//                 className="asm-btn asm-btn-success"
//                 disabled={loading}
//               >
//                 {actionLoading === 'resume' ? (
//                   <FaSpinner className="asm-icon asm-spin" />
//                 ) : (
//                   <FaPlay className="asm-icon" />
//                 )}
//                 Resume
//               </button>
//             </RoleBasedAccess>
//           )}
          
//           {(subscription.status === 'active' || subscription.status === 'paused') && (
//             <RoleBasedAccess permission="subscriptions:update">
//               <button
//                 onClick={() => handleAction('cancel')}
//                 className="asm-btn asm-btn-warning"
//                 disabled={loading}
//               >
//                 {actionLoading === 'cancel' ? (
//                   <FaSpinner className="asm-icon asm-spin" />
//                 ) : (
//                   <FaTimes className="asm-icon" />
//                 )}
//                 Cancel
//               </button>
//             </RoleBasedAccess>
//           )}
          
//           <RoleBasedAccess permission="subscriptions:delete">
//             <button
//               onClick={() => handleAction('delete')}
//               className="asm-btn asm-btn-danger"
//               disabled={loading}
//             >
//               {actionLoading === 'delete' ? (
//                 <FaSpinner className="asm-icon asm-spin" />
//               ) : (
//                 <FaTrash className="asm-icon" />
//               )}
//               Delete
//             </button>
//           </RoleBasedAccess>
//         </div>
//       </div>

//       <div className="asm-details-overview">
//         <div className="asm-overview-card">
//           <div className="asm-overview-main">
//             <h2>{subscription.planName}</h2>
//             <div className="asm-subscription-meta">
//               <span className="asm-reference">Ref: {subscription.reference}</span>
//               {getStatusBadge(subscription.status)}
//             </div>
//           </div>
//           <div className="asm-overview-price">
//             <div className="asm-price-amount">{formatCurrency(subscription.price)}</div>
//             <div className="asm-price-period">{subscription.frequency}</div>
//           </div>
//         </div>

//         {remainingDays !== null && (
//           <div className="asm-remaining-days-card">
//             <div className="asm-days-count">{remainingDays}</div>
//             <div className="asm-days-label">Days Remaining</div>
//           </div>
//         )}
//       </div>

//       <div className="asm-details-tabs">
//         <nav className="asm-tab-nav">
//           <button
//             className={`asm-tab-button ${activeTab === 'details' ? 'asm-active' : ''}`}
//             onClick={() => setActiveTab('details')}
//           >
//             <FaInfoCircle className="asm-icon" /> Details
//           </button>
//           <button
//             className={`asm-tab-button ${activeTab === 'customer' ? 'asm-active' : ''}`}
//             onClick={() => setActiveTab('customer')}
//           >
//             <FaUser className="asm-icon" /> Customer
//           </button>
//           <button
//             className={`asm-tab-button ${activeTab === 'deliveries' ? 'asm-active' : ''}`}
//             onClick={() => setActiveTab('deliveries')}
//           >
//             <FaTruck className="asm-icon" /> Deliveries
//           </button>
//           <button
//             className={`asm-tab-button ${activeTab === 'history' ? 'asm-active' : ''}`}
//             onClick={() => setActiveTab('history')}
//           >
//             <FaHistory className="asm-icon" /> History
//           </button>
//         </nav>

//         <div className="asm-tab-content">
//           {activeTab === 'details' && (
//             <div className="asm-details-grid">
//               <div className="asm-detail-item">
//                 <label>Plan Type</label>
//                 <span className="asm-plan-type">{subscription.planType}</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>Cylinder Size</label>
//                 <span>{subscription.size}</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>Frequency</label>
//                 <span>{subscription.frequency}</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>Subscription Period</label>
//                 <span>{subscription.subscriptionPeriod} month(s)</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>Start Date</label>
//                 <span>{formatDate(subscription.startDate)}</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>End Date</label>
//                 <span>{subscription.endDate ? formatDate(subscription.endDate) : 'N/A'}</span>
//               </div>
//               <div className="asm-detail-item">
//                 <label>Created</label>
//                 <span>{formatDate(subscription.createdAt)}</span>
//               </div>
//               {subscription.updatedAt && (
//                 <div className="asm-detail-item">
//                   <label>Last Updated</label>
//                   <span>{formatDate(subscription.updatedAt)}</span>
//                 </div>
//               )}
//               {subscription.pausedAt && (
//                 <div className="asm-detail-item">
//                   <label>Paused Since</label>
//                   <span>{formatDate(subscription.pausedAt)}</span>
//                 </div>
//               )}
//               {subscription.cancelledAt && (
//                 <div className="asm-detail-item">
//                   <label>Cancelled At</label>
//                   <span>{formatDate(subscription.cancelledAt)}</span>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'customer' && subscription.userId && (
//             <div className="asm-customer-info">
//               <div className="asm-customer-header">
//                 <h3>Customer Information</h3>
//               </div>
//               <div className="asm-details-grid">
//                 <div className="asm-detail-item">
//                   <label>Name</label>
//                   <span>{subscription.userId.firstName} {subscription.userId.lastName}</span>
//                 </div>
//                 <div className="asm-detail-item">
//                   <label>Email</label>
//                   <span>{subscription.userId.email}</span>
//                 </div>
//                 <div className="asm-detail-item">
//                   <label>Phone</label>
//                   <span>{subscription.userId.phone || 'N/A'}</span>
//                 </div>
//                 <div className="asm-detail-item">
//                   <label>Address</label>
//                   <span>{subscription.userId.address || 'N/A'}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'deliveries' && (
//             <div className="asm-deliveries-list">
//               <div className="asm-section-header">
//                 <h3>Delivery History</h3>
//                 <span className="asm-delivery-count">
//                   {subscription.deliveries?.length || 0} deliveries
//                 </span>
//               </div>
              
//               {subscription.deliveries && subscription.deliveries.length > 0 ? (
//                 <div className="asm-deliveries-table">
//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Order ID</th>
//                         <th>Date</th>
//                         <th>Status</th>
//                         <th>Amount</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {subscription.deliveries.map(delivery => (
//                         <tr key={delivery._id}>
//                           <td>{delivery.orderId}</td>
//                           <td>{formatDate(delivery.createdAt)}</td>
//                           <td>
//                             <span className={`asm-status-badge asm-status-${delivery.orderStatus?.toLowerCase()}`}>
//                               {delivery.orderStatus}
//                             </span>
//                           </td>
//                           <td>{formatCurrency(delivery.totalAmount)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="asm-empty-state">
//                   <FaBoxOpen className="asm-icon asm-empty-icon" />
//                   <p>No deliveries found for this subscription</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'history' && (
//             <div className="asm-history-list">
//               <div className="asm-section-header">
//                 <h3>Subscription History</h3>
//               </div>
              
//               <div className="asm-timeline">
//                 <div className="asm-timeline-item">
//                   <div className="asm-timeline-marker"></div>
//                   <div className="asm-timeline-content">
//                     <h4>Subscription Created</h4>
//                     <p>{formatDate(subscription.createdAt)}</p>
//                   </div>
//                 </div>

//                 {subscription.pauseHistory?.map((pause, index) => (
//                   <div key={index} className="asm-timeline-item">
//                     <div className="asm-timeline-marker asm-paused"></div>
//                     <div className="asm-timeline-content">
//                       <h4>Subscription Paused</h4>
//                       <p>Paused: {formatDate(pause.pausedAt)}</p>
//                       {pause.resumedAt && (
//                         <p>Resumed: {formatDate(pause.resumedAt)}</p>
//                       )}
//                       {pause.durationMs && (
//                         <p>Duration: {Math.round(pause.durationMs / (1000 * 60 * 60 * 24))} days</p>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {subscription.cancelledAt && (
//                   <div className="asm-timeline-item">
//                     <div className="asm-timeline-marker asm-cancelled"></div>
//                     <div className="asm-timeline-content">
//                       <h4>Subscription Cancelled</h4>
//                       <p>{formatDate(subscription.cancelledAt)}</p>
//                     </div>
//                   </div>
//                 )}

//                 {subscription.updatedAt && subscription.updatedAt !== subscription.createdAt && (
//                   <div className="asm-timeline-item">
//                     <div className="asm-timeline-marker asm-updated"></div>
//                     <div className="asm-timeline-content">
//                       <h4>Subscription Updated</h4>
//                       <p>Last updated: {formatDate(subscription.updatedAt)}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionDetails;



// components/SubscriptionDetails.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPause,
  FaPlay,
  FaTimes,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaGasPump,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaHistory,
  FaTruck,
  FaInfoCircle,
  FaCalendarDay,
  FaCalendarCheck
} from 'react-icons/fa';
import './SubscriptionDetails.css';

const SubscriptionDetails = ({
  subscription,
  deliveries,
  syncStatus,
  onBack,
  onUpdateSubscription,
  onDeleteSubscription,
  onPauseSubscription,
  onResumeSubscription,
  onCancelSubscription,
  onSyncSubscription,
  userRole,
  loading
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    if (subscription) {
      setFormData({
        frequency: subscription.frequency,
        size: subscription.size,
        status: subscription.status,
        planName: subscription.planName,
        subscriptionPeriod: subscription.subscriptionPeriod,
        price: subscription.price
      });
    }
  }, [subscription]);

  const handleSync = async () => {
    setSyncResult(null);
    const result = await onSyncSubscription(subscription._id);
    setSyncResult(result);
    setTimeout(() => setSyncResult(null), 5000);
  };

  const handleSave = async () => {
    const result = await onUpdateSubscription(subscription._id, formData);
    if (result.success) {
      setEditMode(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateRemainingDays = () => {
    const now = new Date();
    const end = new Date(subscription.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateTotalPauseDuration = () => {
    if (!subscription.pauseHistory || subscription.pauseHistory.length === 0) return 0;
    
    const totalMs = subscription.pauseHistory.reduce((total, pause) => {
      return total + (pause.durationMs || 0);
    }, 0);
    
    return Math.round(totalMs / (1000 * 60 * 60 * 24));
  };

  // Filter deliveries by status
  const upcomingDeliveries = useMemo(() => {
    return deliveries
      .filter(d => d.status !== 'delivered' && d.status !== 'failed')
      .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  }, [deliveries]);

  const pastDeliveries = useMemo(() => {
    return deliveries
      .filter(d => d.status === 'delivered' || d.status === 'failed')
      .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));
  }, [deliveries]);

  const outOfSyncDeliveries = useMemo(() => {
    if (!syncStatus || !syncStatus.outOfSyncDeliveries) return [];
    return syncStatus.outOfSyncDeliveries;
  }, [syncStatus]);

  if (!subscription) {
    return (
      <div className="asd-subscription-details">
        <div className="asd-header">
          <button onClick={onBack} className="asd-back-btn">
            <FaArrowLeft /> Back to List
          </button>
        </div>
        <div className="asd-loading">
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asd-subscription-details">
      <div className="asd-header">
        <div className="asd-header-left">
          <button onClick={onBack} className="asd-back-btn">
            <FaArrowLeft /> Back to List
          </button>
          <h1>Subscription Details</h1>
        </div>
        
        <div className="asd-header-actions">
          {/* Sync Status Badge */}
          <div className={`asd-sync-status ${syncStatus?.isSynced ? 'synced' : 'out-of-sync'}`}>
            {syncStatus?.isSynced ? (
              <>
                <FaCheckCircle className="asd-icon" />
                <span>In Sync</span>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="asd-icon" />
                <span>{syncStatus?.outOfSyncCount || 0} out of sync</span>
              </>
            )}
          </div>

          {!syncStatus?.isSynced && (
            <button
              onClick={handleSync}
              className="asd-btn asd-btn-sync"
              disabled={loading}
            >
              <FaSync className={`asd-icon ${loading ? 'spin' : ''}`} />
              {loading ? 'Syncing...' : 'Sync Deliveries'}
            </button>
          )}

          {userRole === 'admin' && subscription.status === 'active' && (
            <button
              onClick={() => onPauseSubscription(subscription._id)}
              className="asd-btn asd-btn-pause"
            >
              <FaPause className="asd-icon" /> Pause
            </button>
          )}

          {userRole === 'admin' && subscription.status === 'paused' && (
            <button
              onClick={() => onResumeSubscription(subscription._id)}
              className="asd-btn asd-btn-resume"
            >
              <FaPlay className="asd-icon" /> Resume
            </button>
          )}

          {userRole === 'admin' && subscription.status === 'active' && (
            <button
              onClick={() => onCancelSubscription(subscription._id)}
              className="asd-btn asd-btn-cancel"
            >
              <FaTimes className="asd-icon" /> Cancel
            </button>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="asd-btn asd-btn-edit"
            >
              <FaEdit className="asd-icon" /> Edit
            </button>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => onDeleteSubscription(subscription._id)}
              className="asd-btn asd-btn-delete"
            >
              <FaTrash className="asd-icon" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Sync Result Message */}
      {syncResult && (
        <div className={`asd-sync-result ${syncResult.success ? 'success' : 'error'}`}>
          {syncResult.success ? (
            <FaCheckCircle className="asd-icon" />
          ) : (
            <FaExclamationTriangle className="asd-icon" />
          )}
          {syncResult.message}
        </div>
      )}

      {/* Out of Sync Warning */}
      {!syncStatus?.isSynced && syncStatus?.outOfSyncCount > 0 && (
        <div className="asd-out-of-sync-warning">
          <div className="asd-warning-header">
            <FaExclamationTriangle className="asd-icon" />
            <strong>Out of Sync Deliveries Detected</strong>
          </div>
          <p>
            {syncStatus.outOfSyncCount} delivery(s) are not synchronized with subscription status.
            The subscription is <strong>{subscription.status}</strong> but some deliveries are not.
          </p>
          <div className="asd-warning-actions">
            <button onClick={handleSync} className="asd-btn asd-btn-sm asd-btn-warning">
              <FaSync className="asd-icon" /> Sync Now
            </button>
            <button
              className="asd-btn asd-btn-sm asd-btn-outline"
              onClick={() => document.querySelector('.asd-out-of-sync-section').scrollIntoView()}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      <div className="asd-content">
        <div className="asd-main-info">
          <div className="asd-card">
            <div className="asd-card-header">
              <h2>Subscription Information</h2>
              <span className={`asd-status-badge status-${subscription.status}`}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-info-grid">
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaGasPump className="asd-icon" /> Plan
                  </span>
                  <span className="asd-info-value">{subscription.planName}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaGasPump className="asd-icon" /> Size
                  </span>
                  <span className="asd-info-value">{subscription.size}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaClock className="asd-icon" /> Frequency
                  </span>
                  <span className="asd-info-value">{subscription.frequency}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaCalendarAlt className="asd-icon" /> Period
                  </span>
                  <span className="asd-info-value">
                    {subscription.subscriptionPeriod} month(s)
                  </span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaDollarSign className="asd-icon" /> Price
                  </span>
                  <span className="asd-info-value">₦{subscription.price?.toLocaleString()}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaCalendarDay className="asd-icon" /> Start Date
                  </span>
                  <span className="asd-info-value">
                    {formatDate(subscription.startDate)}
                  </span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaCalendarCheck className="asd-icon" /> End Date
                  </span>
                  <span className="asd-info-value">
                    {formatDate(subscription.endDate)}
                    <span className="asd-remaining-days">
                      ({calculateRemainingDays()} days remaining)
                    </span>
                  </span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaSync className="asd-icon" /> Sync Status
                  </span>
                  <span className={`asd-info-value ${syncStatus?.isSynced ? 'synced' : 'out-of-sync'}`}>
                    {syncStatus?.isSynced ? 'In Sync' : `${syncStatus?.outOfSyncCount} out of sync`}
                  </span>
                </div>

                {subscription.pausedAt && (
                  <div className="asd-info-item">
                    <span className="asd-info-label">
                      <FaPause className="asd-icon" /> Paused Since
                    </span>
                    <span className="asd-info-value">
                      {formatDate(subscription.pausedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="asd-card">
            <div className="asd-card-header">
              <h2>Customer Information</h2>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-info-grid">
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaUser className="asd-icon" /> Customer
                  </span>
                  <span className="asd-info-value">
                    {subscription.userId?.firstName} {subscription.userId?.lastName}
                  </span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaUser className="asd-icon" /> Email
                  </span>
                  <span className="asd-info-value">{subscription.userId?.email}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaPhone className="asd-icon" /> Phone
                  </span>
                  <span className="asd-info-value">{subscription.userId?.phone}</span>
                </div>
                
                <div className="asd-info-item">
                  <span className="asd-info-label">
                    <FaMapMarkerAlt className="asd-icon" /> Address
                  </span>
                  <span className="asd-info-value">{subscription.userId?.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="asd-sidebar">
          {/* Pause History */}
          {subscription.pauseHistory && subscription.pauseHistory.length > 0 && (
            <div className="asd-card">
              <div className="asd-card-header">
                <h3>
                  <FaHistory className="asd-icon" /> Pause History
                </h3>
                <span className="asd-total-pause">
                  Total: {calculateTotalPauseDuration()} days
                </span>
              </div>
              
              <div className="asd-card-body">
                <div className="asd-pause-history">
                  {subscription.pauseHistory.slice(0, 3).map((pause, index) => (
                    <div key={index} className="asd-pause-record">
                      <div className="asd-pause-dates">
                        <div className="asd-pause-date">
                          <FaPause className="asd-icon" />
                          <span>{formatDate(pause.pausedAt)}</span>
                        </div>
                        {pause.resumedAt && (
                          <div className="asd-pause-date">
                            <FaPlay className="asd-icon" />
                            <span>{formatDate(pause.resumedAt)}</span>
                          </div>
                        )}
                      </div>
                      {pause.durationMs && (
                        <div className="asd-pause-duration">
                          Duration: {Math.round(pause.durationMs / (1000 * 60 * 60 * 24))} days
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Statistics */}
          <div className="asd-card">
            <div className="asd-card-header">
              <h3>
                <FaTruck className="asd-icon" /> Delivery Statistics
              </h3>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-delivery-stats">
                <div className="asd-delivery-stat">
                  <span className="asd-stat-label">Total Deliveries</span>
                  <span className="asd-stat-value">{deliveries.length}</span>
                </div>
                <div className="asd-delivery-stat">
                  <span className="asd-stat-label">Upcoming</span>
                  <span className="asd-stat-value">{upcomingDeliveries.length}</span>
                </div>
                <div className="asd-delivery-stat">
                  <span className="asd-stat-label">Delivered</span>
                  <span className="asd-stat-value">
                    {deliveries.filter(d => d.status === 'delivered').length}
                  </span>
                </div>
                <div className="asd-delivery-stat">
                  <span className="asd-stat-label">Out of Sync</span>
                  <span className={`asd-stat-value ${outOfSyncDeliveries.length > 0 ? 'warning' : ''}`}>
                    {outOfSyncDeliveries.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Out of Sync Deliveries Section */}
      {outOfSyncDeliveries.length > 0 && (
        <div className="asd-out-of-sync-section">
          <div className="asd-card">
            <div className="asd-card-header warning">
              <h3>
                <FaExclamationTriangle className="asd-icon" /> Out of Sync Deliveries
              </h3>
              <button onClick={handleSync} className="asd-btn asd-btn-sm asd-btn-warning">
                <FaSync className="asd-icon" /> Sync All
              </button>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-out-of-sync-table">
                <div className="asd-table-header">
                  <div>Delivery Date</div>
                  <div>Current Status</div>
                  <div>Expected Status</div>
                  <div>Agent</div>
                  <div>Address</div>
                  <div>Action</div>
                </div>
                
                {outOfSyncDeliveries.map(delivery => (
                  <div key={delivery._id} className="asd-table-row">
                    <div className="asd-delivery-date">
                      {formatDate(delivery.deliveryDate)}
                    </div>
                    <div className={`asd-status ${delivery.status}`}>
                      {delivery.status}
                    </div>
                    <div className="asd-expected-status">
                      {subscription.status === 'paused' ? 'paused' : 'active'}
                    </div>
                    <div className="asd-agent">
                      {delivery.deliveryAgent
                        ? `${delivery.deliveryAgent.firstName} ${delivery.deliveryAgent.lastName}`
                        : 'Not assigned'}
                    </div>
                    <div className="asd-address">
                      {delivery.address}
                    </div>
                    <div className="asd-action">
                      <button
                        className="asd-btn asd-btn-xs asd-btn-outline"
                        onClick={() => {
                          // Navigate to delivery details
                          window.open(`/dashboard/deliveries/${delivery._id}`, '_blank');
                        }}
                      >
                        <FaInfoCircle className="asd-icon" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deliveries */}
      {upcomingDeliveries.length > 0 && (
        <div className="asd-upcoming-deliveries">
          <div className="asd-card">
            <div className="asd-card-header">
              <h3>
                <FaTruck className="asd-icon" /> Upcoming Deliveries
              </h3>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-deliveries-list">
                {upcomingDeliveries.slice(0, 5).map(delivery => (
                  <div key={delivery._id} className="asd-delivery-item">
                    <div className="asd-delivery-date">
                      <FaCalendarAlt className="asd-icon" />
                      {formatDate(delivery.deliveryDate)}
                    </div>
                    <div className={`asd-delivery-status ${delivery.status}`}>
                      {delivery.status.replace('_', ' ')}
                    </div>
                    <div className="asd-delivery-agent">
                      {delivery.deliveryAgent
                        ? `${delivery.deliveryAgent.firstName} ${delivery.deliveryAgent.lastName}`
                        : 'Not assigned'}
                    </div>
                    <div className="asd-delivery-address">
                      {delivery.address}
                    </div>
                  </div>
                ))}
              </div>
              
              {upcomingDeliveries.length > 5 && (
                <div className="asd-more-deliveries">
                  + {upcomingDeliveries.length - 5} more deliveries scheduled
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editMode && (
        <div className="asd-edit-form">
          <div className="asd-card">
            <div className="asd-card-header">
              <h3>Edit Subscription</h3>
              <button
                onClick={() => setEditMode(false)}
                className="asd-btn asd-btn-outline"
              >
                Cancel
              </button>
            </div>
            
            <div className="asd-card-body">
              <div className="asd-form">
                <div className="asd-form-group">
                  <label>Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
                
                <div className="asd-form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    placeholder="e.g., 6kg"
                  />
                </div>
                
                <div className="asd-form-group">
                  <label>Subscription Period (months)</label>
                  <input
                    type="number"
                    value={formData.subscriptionPeriod}
                    onChange={(e) => setFormData({...formData, subscriptionPeriod: e.target.value})}
                    min="1"
                    max="12"
                  />
                </div>
                
                <div className="asd-form-group">
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    min="0"
                  />
                </div>
                
                <div className="asd-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div className="asd-form-actions">
                  <button onClick={handleSave} className="asd-btn asd-btn-primary">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="asd-btn asd-btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;