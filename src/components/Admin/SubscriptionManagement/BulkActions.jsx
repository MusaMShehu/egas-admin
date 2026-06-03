// // components/BulkActions.js
// import React, { useState } from 'react';
// import { FaChevronDown, FaCheck, FaPause, FaTimes, FaCalendarAlt, FaTrash, FaBan } from 'react-icons/fa';
// import RoleBasedAccess from './RoleBasedAccess';

// const BulkActions = ({ selectedCount, onBulkAction, userRole }) => {
//   const [showDropdown, setShowDropdown] = useState(false);

//   const handleAction = (action, data = null) => {
//     onBulkAction(action, data);
//     setShowDropdown(false);
//   };

//   return (
//     <div className="asm-bulk-actions-bar">
//       <div className="asm-bulk-actions-info">
//         <strong>{selectedCount}</strong> subscription(s) selected
//       </div>
      
//       <div className="asm-bulk-actions-dropdown">
//         <button
//           className="asm-btn asm-btn-primary asm-bulk-actions-toggle"
//           onClick={() => setShowDropdown(!showDropdown)}
//         >
//           Bulk Actions <FaChevronDown className="asm-icon" />
//         </button>
        
//         {showDropdown && (
//           <div className="asm-bulk-actions-menu">
//             <RoleBasedAccess permission="subscriptions:update">
//               <div className="asm-bulk-action-group">
//                 <h4>Update Status</h4>
//                 <button onClick={() => handleAction('updateStatus', { status: 'active' })}>
//                   <FaCheck className="asm-icon" /> Set as Active
//                 </button>
//                 <button onClick={() => handleAction('updateStatus', { status: 'paused' })}>
//                   <FaPause className="asm-icon" /> Set as Paused
//                 </button>
//                 <button onClick={() => handleAction('updateStatus', { status: 'cancelled' })}>
//                   <FaTimes className="asm-icon" /> Set as Cancelled
//                 </button>
//               </div>
//             </RoleBasedAccess>

//             <RoleBasedAccess permission="subscriptions:update">
//               <div className="asm-bulk-action-group">
//                 <h4>Update Frequency</h4>
//                 <button onClick={() => handleAction('updateFrequency', { frequency: 'Weekly' })}>
//                   <FaCalendarAlt className="asm-icon" /> Set to Weekly
//                 </button>
//                 <button onClick={() => handleAction('updateFrequency', { frequency: 'Monthly' })}>
//                   <FaCalendarAlt className="asm-icon" /> Set to Monthly
//                 </button>
//               </div>
//             </RoleBasedAccess>

//             <RoleBasedAccess permission="subscriptions:delete">
//               <div className="asm-bulk-action-group">
//                 <h4>Danger Zone</h4>
//                 <button 
//                   onClick={() => handleAction('delete')}
//                   className="asm-bulk-action-danger"
//                 >
//                   <FaTrash className="asm-icon" /> Delete Selected
//                 </button>
//               </div>
//             </RoleBasedAccess>
//           </div>
//         )}
//       </div>
      
//       <button
//         className="asm-btn asm-btn-outline asm-bulk-clear"
//         onClick={() => handleAction('clear')}
//       >
//         <FaBan className="asm-icon" /> Clear Selection
//       </button>
//     </div>
//   );
// };

// export default BulkActions;























// src/components/admin/BulkActions.jsx
import React, { useState } from 'react';
import { 
  FaChevronDown, 
  FaCheck, 
  FaPause, 
  FaTimes, 
  FaCalendarAlt, 
  FaTrash, 
  FaBan,
  FaSyncAlt
} from 'react-icons/fa';
import RoleBasedAccess from '../../common/RoleBasedAccess';

const BulkActions = ({ 
  selectedCount, 
  onBulkAction, 
  userRole,
  showSyncAction = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action, data = null) => {
    setLoading(true);
    await onBulkAction(action, data);
    setLoading(false);
    setShowDropdown(false);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="asm-bulk-actions-bar">
      <div className="asm-bulk-actions-info">
        <strong>{selectedCount}</strong> subscription(s) selected
      </div>
      
      <div className="asm-bulk-actions-dropdown">
        <button
          className="asm-btn asm-btn-primary asm-bulk-actions-toggle"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
        >
          Bulk Actions <FaChevronDown className="asm-icon" />
        </button>
        
        {showDropdown && (
          <div className="asm-bulk-actions-menu">
            <RoleBasedAccess permission="subscriptions:update">
              <div className="asm-bulk-action-group">
                <h4>Update Status</h4>
                <button onClick={() => handleAction('updateStatus', { status: 'active' })}>
                  <FaCheck className="asm-icon" /> Set as Active
                </button>
                <button onClick={() => handleAction('updateStatus', { status: 'paused' })}>
                  <FaPause className="asm-icon" /> Set as Paused
                </button>
                <button onClick={() => handleAction('updateStatus', { status: 'cancelled' })}>
                  <FaTimes className="asm-icon" /> Set as Cancelled
                </button>
              </div>
            </RoleBasedAccess>

            <RoleBasedAccess permission="subscriptions:update">
              <div className="asm-bulk-action-group">
                <h4>Update Frequency</h4>
                <button onClick={() => handleAction('updateFrequency', { frequency: 'Weekly' })}>
                  <FaCalendarAlt className="asm-icon" /> Set to Weekly
                </button>
                <button onClick={() => handleAction('updateFrequency', { frequency: 'Monthly' })}>
                  <FaCalendarAlt className="asm-icon" /> Set to Monthly
                </button>
              </div>
            </RoleBasedAccess>

            <RoleBasedAccess permission="subscriptions:update">
              <div className="asm-bulk-action-group">
                <h4>Bulk Actions</h4>
                <button onClick={() => handleAction('pause')}>
                  <FaPause className="asm-icon" /> Pause Selected
                </button>
                <button onClick={() => handleAction('resume')}>
                  <FaCheck className="asm-icon" /> Resume Selected
                </button>
                <button onClick={() => handleAction('cancel')}>
                  <FaTimes className="asm-icon" /> Cancel Selected
                </button>
              </div>
            </RoleBasedAccess>

            {showSyncAction && (
              <RoleBasedAccess permission="subscriptions:update">
                <div className="asm-bulk-action-group">
                  <h4>Sync Actions</h4>
                  <button onClick={() => handleAction('sync')}>
                    <FaSyncAlt className="asm-icon" /> Sync with Deliveries
                  </button>
                </div>
              </RoleBasedAccess>
            )}

            <RoleBasedAccess permission="subscriptions:delete">
              <div className="asm-bulk-action-group">
                <h4>Danger Zone</h4>
                <button 
                  onClick={() => handleAction('delete')}
                  className="asm-bulk-action-danger"
                >
                  <FaTrash className="asm-icon" /> Delete Selected
                </button>
              </div>
            </RoleBasedAccess>
          </div>
        )}
      </div>
      
      <button
        className="asm-btn asm-btn-outline asm-bulk-clear"
        onClick={() => handleAction('clear')}
        disabled={loading}
      >
        <FaBan className="asm-icon" /> Clear Selection
      </button>

      {loading && (
        <div className="asm-bulk-loading">
          <div className="asm-spinner"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default BulkActions;