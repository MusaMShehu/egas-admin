<<<<<<< HEAD
// // components/AdminDeliveryManagement.jsx
// import React, { useState, useEffect } from "react";
// import {
//   FaUserCheck,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaSync,
//   FaPlus,
//   FaEye,
//   FaSearch,
// } from "react-icons/fa";
// import "./DeliveryManagement.css";

// const AdminDeliveryManagement = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({});
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [filters, setFilters] = useState({
//     status: "",
//     deliveryDate: "",
//     search: "",
//     remnantType: '',
//   });
//   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [agents, setAgents] = useState([]);
//   const [selectedAgent, setSelectedAgent] = useState("");
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   useEffect(() => {
//     fetchDeliveries();
//     fetchStats();
//     fetchAgents();
//   }, [page, rowsPerPage, filters]);

//   // Update the fetchDeliveries function to include remnantType filter
//   const fetchDeliveries = async () => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         page: page + 1,
//         limit: rowsPerPage,
//         ...filters,
//       }).toString();

//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery?${queryParams}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         setDeliveries(data.data);
//         setTotal(data.total);
//       }
//     } catch (error) {
//       showSnackbar("Error fetching deliveries", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/delivery/stats",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.success) {
//         setStats(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   const fetchAgents = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/users?role=delivery",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();
//       console.log("Agents API response:", data);

//       if (data.success) {
//         const agentsArray = Array.isArray(data.data)
//           ? data.data
//           : data.data?.users || [];
//         setAgents(agentsArray);
//       } else {
//         setAgents([]);
//       }
//     } catch (error) {
//       console.error("Error fetching agents:", error);
//       setAgents([]);
//     }
//   };

//   const handleAssignAgent = (delivery) => {
//     setSelectedDelivery(delivery);
//     setSelectedAgent("");
//     setAssignDialogOpen(true);
//   };

//   const confirmAssignAgent = async () => {
//     if (!selectedAgent) {
//       showSnackbar("Please select an agent", "error");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedDelivery._id}/assign`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ deliveryAgentId: selectedAgent }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery assigned successfully", "success");
//         setAssignDialogOpen(false);
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar("Error assigning delivery", "error");
//     }
//   };

//   const generateSchedules = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/delivery/generate-schedules",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ daysAhead: 7 }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar(
//           `Generated ${data.generatedCount} delivery schedules`,
//           "success"
//         );
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error generating schedules", "error");
//     }
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//     setTimeout(() => {
//       setSnackbar({ ...snackbar, open: false });
//     }, 6000);
//   };

//   const getStatusClass = (status) => {
//     const statusMap = {
//       pending: "adm-status-pending",
//       assigned: "adm-status-assigned",
//       accepted: "adm-status-accepted",
//       out_for_delivery: "adm-status-out_for_delivery",
//       delivered: "adm-status-delivered",
//       failed: "adm-status-failed",
//       cancelled: "adm-status-pending",
//     };
//     return `adm-status-chip ${statusMap[status] || "adm-status-pending"}`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleChangePage = (newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleFilterChange = (filter, value) => {
//     setFilters((prev) => ({ ...prev, [filter]: value }));
//     setPage(0);
//   };

//   const totalPages = Math.ceil(total / rowsPerPage);

//   return (
//     <div className="adm-delivery-management">
//       {/* Header and Stats */}
//       <div className="adm-delivery-header">
//         <h1 className="adm-delivery-title">Delivery Management</h1>
//         <button className="adm-btn adm-btn-primary" onClick={generateSchedules}>
//           <FaPlus className="adm-icon" />
//           Generate Schedules
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="adm-stats-grid">
//         <div className="adm-stat-card">
//           <div className="adm-stat-label">Total Today</div>
//           <div className="adm-stat-value">{stats.today?.total || 0}</div>
//         </div>
//         <div className="adm-stat-card success">
//           <div className="adm-stat-label">Delivered Today</div>
//           <div className="adm-stat-value">{stats.today?.delivered || 0}</div>
//         </div>
//         <div className="adm-stat-card warning">
//           <div className="adm-stat-label">Pending Today</div>
//           <div className="adm-stat-value">{stats.today?.pending || 0}</div>
//         </div>
//         <div className="adm-stat-card error">
//           <div className="adm-stat-label">Failed Today</div>
//           <div className="adm-stat-value">{stats.today?.failed || 0}</div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="adm-filters-card">
//         <div className="adm-filters-grid">
//           <div className="adm-form-group">
//             <label className="adm-form-label">Search</label>
//             <div style={{ position: "relative" }}>
//               <FaSearch
//                 className="adm-icon"
//                 style={{
//                   position: "absolute",
//                   left: "12px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#7f8c8d",
//                 }}
//               />
//               <input
//                 type="text"
//                 className="adm-form-input"
//                 style={{ paddingLeft: "40px" }}
//                 value={filters.search}
//                 onChange={(e) => handleFilterChange("search", e.target.value)}
//                 placeholder="Search by customer, address, or plan..."
//               />
//             </div>
//           </div>
//           <div className="adm-form-group">
//             <label className="adm-form-label">Status</label>
//             <select
//               className="adm-form-select"
//               value={filters.status}
//               onChange={(e) => handleFilterChange("status", e.target.value)}
//             >
//               <option value="">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="assigned">Assigned</option>
//               <option value="accepted">Accepted</option>
//               <option value="out_for_delivery">Out for Delivery</option>
//               <option value="delivered">Delivered</option>
//               <option value="failed">Failed</option>
//             </select>
//           </div>
//           <div className="adm-form-group">
//             <label className="adm-form-label">Delivery Date</label>
//             <input
//               type="date"
//               className="adm-form-input"
//               value={filters.deliveryDate}
//               onChange={(e) =>
//                 handleFilterChange("deliveryDate", e.target.value)
//               }
//             />
//           </div>

//           {/* In the filters section, add a filter for remnant deliveries */}
//           <div className="adm-form-group">
//             <label className="adm-form-label">Remnant Type</label>
//             <select
//               className="adm-form-select"
//               value={filters.remnantType || ""}
//               onChange={(e) =>
//                 handleFilterChange("remnantType", e.target.value)
//               }
//             >
//               <option value="">All Types</option>
//               <option value="partial">Partial Deliveries</option>
//               <option value="remnant">Remnant Deliveries</option>
//               <option value="regular">Regular Deliveries</option>
//             </select>
//           </div>
//           <div className="adm-form-group">
//             <button
//               className="adm-btn adm-btn-outline"
//               onClick={fetchDeliveries}
//             >
//               <FaSync className="adm-icon" />
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Delivery List */}
//       {loading ? (
//         <div className="adm-loading">
//           <div className="adm-spinner"></div>
//         </div>
//       ) : (
//         <div className="adm-table-container">
//           <table className="adm-delivery-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Plan</th>
//                 <th>Delivery Date</th>
//                 <th>Address</th>
//                 <th>Agent</th>
//                 <th>Status</th>
//                 <th>Remnant</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {deliveries.map((delivery) => (
//                 <tr key={delivery._id}>
//                   <td>
//                     <div className="adm-customer-info">
//                       <div className="adm-customer-name">
//                         {delivery.customerName}
//                       </div>
//                       <div className="adm-customer-phone">
//                         {delivery.customerPhone}
//                       </div>
//                     </div>
//                   </td>
//                   <td>
//                     <div className="adm-plan-info">
//                       <div className="adm-plan-name">
//                         {delivery.planDetails.planName}
//                       </div>
//                       <div className="adm-plan-details">
//                         {delivery.planDetails.size} •{" "}
//                         {delivery.planDetails.frequency}
//                         {delivery.isRemnantDelivery && (
//                           <span className="adm-remnant-badge">(Remnant)</span>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                   <td>{formatDate(delivery.deliveryDate)}</td>
//                   <td>
//                     <div className="adm-address">{delivery.address}</div>
//                   </td>
//                   <td>
//                     {delivery.deliveryAgent ? (
//                       <div className="adm-agent-info">
//                         {delivery.deliveryAgent.firstName}{" "}
//                         {delivery.deliveryAgent.lastName}
//                       </div>
//                     ) : (
//                       <div className="adm-agent-unassigned">Not assigned</div>
//                     )}
//                   </td>
//                   <td>
//                     <span className={getStatusClass(delivery.status)}>
//                       {delivery.status.replace(/_/g, " ").toUpperCase()}
//                     </span>
//                   </td>
//                   {/* ADD THE REMNANT COLUMN HERE */}
//                   <td>
//                     <div className="adm-remnant-info">
//                       {delivery.partialDelivery?.isPartial ? (
//                         <div className="adm-partial-delivery">
//                           <div className="adm-delivered-kg">
//                             Delivered: {delivery.deliveredKg}kg
//                           </div>
//                           <div className="adm-remaining-kg">
//                             Remaining: {delivery.remainingKg}kg
//                           </div>
//                         </div>
//                       ) : delivery.isRemnantDelivery ? (
//                         <div className="adm-remnant-delivery">
//                           <div className="adm-requested-kg">
//                             Requested: {delivery.requestedKg}kg
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="adm-no-remnant">
//                           <span className="adm-remnant-na">—</span>
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                   <td>
//                     {!delivery.deliveryAgent &&
//                       delivery.status === "pending" && (
//                         <button
//                           className="adm-btn adm-btn-outline adm-btn-small"
//                           onClick={() => handleAssignAgent(delivery)}
//                         >
//                           <FaUserCheck className="adm-icon" />
//                           Assign
//                         </button>
//                       )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="adm-pagination">
//             <div className="adm-pagination-info">
//               Showing {deliveries.length} of {total} deliveries
//             </div>
//             <div className="adm-pagination-controls">
//               <select
//                 className="adm-pagination-select"
//                 value={rowsPerPage}
//                 onChange={handleChangeRowsPerPage}
//               >
//                 <option value={5}>5 per page</option>
//                 <option value={10}>10 per page</option>
//                 <option value={25}>25 per page</option>
//               </select>

//               <div className="adm-pagination-buttons">
//                 <button
//                   className="adm-page-btn"
//                   disabled={page === 0}
//                   onClick={() => handleChangePage(page - 1)}
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                   const pageNumber = i + Math.max(0, page - 2);
//                   if (pageNumber >= totalPages) return null;

//                   return (
//                     <button
//                       key={pageNumber}
//                       className={`adm-page-btn ${
//                         page === pageNumber ? "active" : ""
//                       }`}
//                       onClick={() => handleChangePage(pageNumber)}
//                     >
//                       {pageNumber + 1}
//                     </button>
//                   );
//                 })}

//                 <button
//                   className="adm-page-btn"
//                   disabled={page >= totalPages - 1}
//                   onClick={() => handleChangePage(page + 1)}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && deliveries.length === 0 && (
//         <div className="adm-empty-state">
//           <h3>No deliveries found</h3>
//           <p>No delivery orders match your current filters.</p>
//         </div>
//       )}

//       {/* Assign Agent Dialog */}
//       {assignDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Assign Delivery Agent</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Assign delivery to {selectedDelivery?.customerName} for{" "}
//                 {selectedDelivery?.planDetails?.planName}
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Select Agent</label>
//                 <select
//                   className="adm-form-select"
//                   value={selectedAgent}
//                   onChange={(e) => setSelectedAgent(e.target.value)}
//                 >
//                   <option value="">Choose an agent...</option>
//                   {agents.map((agent) => (
//                     <option key={agent._id} value={agent._id}>
//                       {agent.firstName} {agent.lastName} - {agent.phone}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setAssignDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-primary"
//                 onClick={confirmAssignAgent}
//               >
//                 Assign Agent
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Snackbar */}
//       {snackbar.open && (
//         <div className={`adm-snackbar ${snackbar.severity}`}>
//           {snackbar.severity === "success" ? (
//             <FaCheckCircle className="adm-icon" />
//           ) : (
//             <FaTimesCircle className="adm-icon" />
//           )}
//           {snackbar.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDeliveryManagement;


// components/AdminDeliveryManagement.jsx
// import React, { useState, useEffect } from "react";
// import {
//   FaUserCheck,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaSync,
//   FaPlus,
//   FaEye,
//   FaSearch,
//   FaPause,
//   FaPlay,
//   FaExclamationTriangle,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import "./DeliveryManagement.css";

// const AdminDeliveryManagement = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({});
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [filters, setFilters] = useState({
//     status: "",
//     deliveryDate: "",
//     search: "",
//     remnantType: '',
//     syncStatus: '',
//   });
//   const [assignDialogOpen, setAssignDialogOpen] = useState(false);
//   const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
//   const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [agents, setAgents] = useState([]);
//   const [selectedAgent, setSelectedAgent] = useState("");
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   useEffect(() => {
//     fetchDeliveries();
//     fetchStats();
//     fetchAgents();
//   }, [page, rowsPerPage, filters]);

//   const fetchDeliveries = async () => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         page: page + 1,
//         limit: rowsPerPage,
//         ...filters,
//       }).toString();

//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery?${queryParams}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         // Enhance deliveries with subscription sync status
//         const enhancedDeliveries = data.data.map(delivery => ({
//           ...delivery,
//           syncStatus: checkDeliverySyncStatus(delivery)
//         }));
//         setDeliveries(enhancedDeliveries);
//         setTotal(data.total);
//       }
//     } catch (error) {
//       showSnackbar("Error fetching deliveries", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/delivery/stats",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.success) {
//         setStats(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   const fetchAgents = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/users?role=delivery",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         const agentsArray = Array.isArray(data.data)
//           ? data.data
//           : data.data?.users || [];
//         setAgents(agentsArray);
//       } else {
//         setAgents([]);
//       }
//     } catch (error) {
//       console.error("Error fetching agents:", error);
//       setAgents([]);
//     }
//   };

//   const checkDeliverySyncStatus = (delivery) => {
//     if (!delivery.subscriptionId) return { isSynced: true };

//     const subscription = delivery.subscriptionId;
//     const shouldBePaused = subscription.status === "paused" && delivery.status !== "paused";
//     const shouldBeActive = subscription.status === "active" && delivery.status === "paused";

//     return {
//       isSynced: !shouldBePaused && !shouldBeActive,
//       subscriptionStatus: subscription.status,
//       action: shouldBePaused ? "pause" : shouldBeActive ? "resume" : null,
//       requiresSync: shouldBePaused || shouldBeActive
//     };
//   };

//   const handleSyncDelivery = async (deliveryId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/delivery/${deliveryId}/sync-subscription`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar(`Delivery synced: ${data.data.action}`, "success");
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message || "Sync failed", "error");
//       }
//     } catch (error) {
//       showSnackbar("Error syncing delivery", "error");
//     }
//   };

//   const handlePauseSubscription = async (subscriptionId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/subscriptions/${subscriptionId}/admin-pause`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Subscription and deliveries paused", "success");
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar("Error pausing subscription", "error");
//     }
//   };

//   const handleResumeSubscription = async (subscriptionId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/subscriptions/${subscriptionId}/admin-resume`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Subscription and deliveries resumed", "success");
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar("Error resuming subscription", "error");
//     }
//   };

//   const handleAssignAgent = (delivery) => {
//     setSelectedDelivery(delivery);
//     setSelectedAgent("");
//     setAssignDialogOpen(true);
//   };

//   const confirmAssignAgent = async () => {
//     if (!selectedAgent) {
//       showSnackbar("Please select an agent", "error");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedDelivery._id}/assign`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ deliveryAgentId: selectedAgent }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery assigned successfully", "success");
//         setAssignDialogOpen(false);
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar("Error assigning delivery", "error");
//     }
//   };

//   const generateSchedules = async () => {
//     try {
//       const response = await fetch(
//         "https://egas-server-1.onrender.com/api/v1/admin/delivery/generate-schedules",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ daysAhead: 7 }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar(
//           `Generated ${data.generatedCount} delivery schedules`,
//           "success"
//         );
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error generating schedules", "error");
//     }
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//     setTimeout(() => {
//       setSnackbar({ ...snackbar, open: false });
//     }, 6000);
//   };

//   const getStatusClass = (status) => {
//     const statusMap = {
//       pending: "adm-status-pending",
//       assigned: "adm-status-assigned",
//       accepted: "adm-status-accepted",
//       out_for_delivery: "adm-status-out_for_delivery",
//       delivered: "adm-status-delivered",
//       failed: "adm-status-failed",
//       cancelled: "adm-status-pending",
//       paused: "adm-status-paused",
//     };
//     return `adm-status-chip ${statusMap[status] || "adm-status-pending"}`;
//   };

//   const getSyncStatusClass = (syncStatus) => {
//     if (!syncStatus.requiresSync) return "adm-sync-synced";
//     return syncStatus.action === "pause" ? "adm-sync-needs-pause" : "adm-sync-needs-resume";
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleChangePage = (newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleFilterChange = (filter, value) => {
//     setFilters((prev) => ({ ...prev, [filter]: value }));
//     setPage(0);
//   };

//   const totalPages = Math.ceil(total / rowsPerPage);

//   return (
//     <div className="adm-delivery-management">
//       {/* Header and Stats */}
//       <div className="adm-delivery-header">
//         <h1 className="adm-delivery-title">Delivery Management</h1>
//         <button className="adm-btn adm-btn-primary" onClick={generateSchedules}>
//           <FaPlus className="adm-icon" />
//           Generate Schedules
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="adm-stats-grid">
//         <div className="adm-stat-card">
//           <div className="adm-stat-label">Total Today</div>
//           <div className="adm-stat-value">{stats.today?.total || 0}</div>
//         </div>
//         <div className="adm-stat-card success">
//           <div className="adm-stat-label">Delivered Today</div>
//           <div className="adm-stat-value">{stats.today?.delivered || 0}</div>
//         </div>
//         <div className="adm-stat-card warning">
//           <div className="adm-stat-label">Pending Today</div>
//           <div className="adm-stat-value">{stats.today?.pending || 0}</div>
//         </div>
//         <div className="adm-stat-card error">
//           <div className="adm-stat-label">Failed Today</div>
//           <div className="adm-stat-value">{stats.today?.failed || 0}</div>
//         </div>
//         <div className="adm-stat-card info">
//           <div className="adm-stat-label">Out of Sync</div>
//           <div className="adm-stat-value">
//             {deliveries.filter(d => d.syncStatus?.requiresSync).length}
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="adm-filters-card">
//         <div className="adm-filters-grid">
//           <div className="adm-form-group">
//             <label className="adm-form-label">Search</label>
//             <div style={{ position: "relative" }}>
//               <FaSearch
//                 className="adm-icon"
//                 style={{
//                   position: "absolute",
//                   left: "12px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#7f8c8d",
//                 }}
//               />
//               <input
//                 type="text"
//                 className="adm-form-input"
//                 style={{ paddingLeft: "40px" }}
//                 value={filters.search}
//                 onChange={(e) => handleFilterChange("search", e.target.value)}
//                 placeholder="Search by customer, address, or plan..."
//               />
//             </div>
//           </div>
//           <div className="adm-form-group">
//             <label className="adm-form-label">Status</label>
//             <select
//               className="adm-form-select"
//               value={filters.status}
//               onChange={(e) => handleFilterChange("status", e.target.value)}
//             >
//               <option value="">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="assigned">Assigned</option>
//               <option value="accepted">Accepted</option>
//               <option value="out_for_delivery">Out for Delivery</option>
//               <option value="delivered">Delivered</option>
//               <option value="failed">Failed</option>
//               <option value="paused">Paused</option>
//             </select>
//           </div>
//           <div className="adm-form-group">
//             <label className="adm-form-label">Delivery Date</label>
//             <input
//               type="date"
//               className="adm-form-input"
//               value={filters.deliveryDate}
//               onChange={(e) =>
//                 handleFilterChange("deliveryDate", e.target.value)
//               }
//             />
//           </div>
//           <div className="adm-form-group">
//             <label className="adm-form-label">Sync Status</label>
//             <select
//               className="adm-form-select"
//               value={filters.syncStatus || ""}
//               onChange={(e) => handleFilterChange("syncStatus", e.target.value)}
//             >
//               <option value="">All Sync Status</option>
//               <option value="synced">Synced</option>
//               <option value="needs_pause">Needs Pause</option>
//               <option value="needs_resume">Needs Resume</option>
//             </select>
//           </div>
//           <div className="adm-form-group">
//             <button
//               className="adm-btn adm-btn-outline"
//               onClick={fetchDeliveries}
//             >
//               <FaSync className="adm-icon" />
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Delivery List */}
//       {loading ? (
//         <div className="adm-loading">
//           <div className="adm-spinner"></div>
//         </div>
//       ) : (
//         <div className="adm-table-container">
//           <table className="adm-delivery-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Plan</th>
//                 <th>Delivery Date</th>
//                 <th>Address</th>
//                 <th>Agent</th>
//                 <th>Status</th>
//                 <th>Sync</th>
//                 <th>Remnant</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {deliveries.map((delivery) => {
//                 const syncStatus = delivery.syncStatus;
                
//                 return (
//                   <tr key={delivery._id} className={!syncStatus.isSynced ? "adm-row-out-of-sync" : ""}>
//                     <td>
//                       <div className="adm-customer-info">
//                         <div className="adm-customer-name">
//                           {delivery.customerName}
//                         </div>
//                         <div className="adm-customer-phone">
//                           {delivery.customerPhone}
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="adm-plan-info">
//                         <div className="adm-plan-name">
//                           {delivery.planDetails.planName}
//                         </div>
//                         <div className="adm-plan-details">
//                           {delivery.planDetails.size} •{" "}
//                           {delivery.planDetails.frequency}
//                           {delivery.isRemnantDelivery && (
//                             <span className="adm-remnant-badge">(Remnant)</span>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="adm-delivery-date-cell">
//                         {formatDate(delivery.deliveryDate)}
//                         {delivery.originalDeliveryDate && (
//                           <div className="adm-original-date">
//                             Original: {formatDate(delivery.originalDeliveryDate)}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="adm-address">{delivery.address}</div>
//                     </td>
//                     <td>
//                       {delivery.deliveryAgent ? (
//                         <div className="adm-agent-info">
//                           {delivery.deliveryAgent.firstName}{" "}
//                           {delivery.deliveryAgent.lastName}
//                         </div>
//                       ) : (
//                         <div className="adm-agent-unassigned">Not assigned</div>
//                       )}
//                     </td>
//                     <td>
//                       <span className={getStatusClass(delivery.status)}>
//                         {delivery.status.replace(/_/g, " ").toUpperCase()}
//                       </span>
//                     </td>
//                     <td>
//                       <div className={`adm-sync-status ${getSyncStatusClass(syncStatus)}`}>
//                         {syncStatus.requiresSync ? (
//                           <>
//                             <FaExclamationTriangle className="adm-icon" />
//                             <span className="adm-sync-action">
//                               {syncStatus.action === "pause" ? "Needs Pause" : "Needs Resume"}
//                             </span>
//                             <button
//                               className="adm-btn adm-btn-xs adm-btn-outline"
//                               onClick={() => handleSyncDelivery(delivery._id)}
//                             >
//                               <FaSync /> Sync
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <FaCheckCircle className="adm-icon" />
//                             <span>Synced</span>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="adm-remnant-info">
//                         {delivery.partialDelivery?.isPartial ? (
//                           <div className="adm-partial-delivery">
//                             <div className="adm-delivered-kg">
//                               Delivered: {delivery.deliveredKg}kg
//                             </div>
//                             <div className="adm-remaining-kg">
//                               Remaining: {delivery.remainingKg}kg
//                             </div>
//                           </div>
//                         ) : delivery.isRemnantDelivery ? (
//                           <div className="adm-remnant-delivery">
//                             <div className="adm-requested-kg">
//                               Requested: {delivery.requestedKg}kg
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="adm-no-remnant">
//                             <span className="adm-remnant-na">—</span>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="adm-action-buttons">
//                         {!delivery.deliveryAgent &&
//                           delivery.status === "pending" && (
//                             <button
//                               className="adm-btn adm-btn-outline adm-btn-small"
//                               onClick={() => handleAssignAgent(delivery)}
//                             >
//                               <FaUserCheck className="adm-icon" />
//                               Assign
//                             </button>
//                           )}
                        
//                         {delivery.subscriptionId && (
//                           <div className="adm-subscription-actions">
//                             {delivery.subscriptionId.status === "active" ? (
//                               <button
//                                 className="adm-btn adm-btn-warning adm-btn-xs"
//                                 onClick={() => handlePauseSubscription(delivery.subscriptionId._id)}
//                                 title="Pause Subscription"
//                               >
//                                 <FaPause />
//                               </button>
//                             ) : (
//                               <button
//                                 className="adm-btn adm-btn-success adm-btn-xs"
//                                 onClick={() => handleResumeSubscription(delivery.subscriptionId._id)}
//                                 title="Resume Subscription"
//                               >
//                                 <FaPlay />
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="adm-pagination">
//             <div className="adm-pagination-info">
//               Showing {deliveries.length} of {total} deliveries
//             </div>
//             <div className="adm-pagination-controls">
//               <select
//                 className="adm-pagination-select"
//                 value={rowsPerPage}
//                 onChange={handleChangeRowsPerPage}
//               >
//                 <option value={5}>5 per page</option>
//                 <option value={10}>10 per page</option>
//                 <option value={25}>25 per page</option>
//               </select>

//               <div className="adm-pagination-buttons">
//                 <button
//                   className="adm-page-btn"
//                   disabled={page === 0}
//                   onClick={() => handleChangePage(page - 1)}
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                   const pageNumber = i + Math.max(0, page - 2);
//                   if (pageNumber >= totalPages) return null;

//                   return (
//                     <button
//                       key={pageNumber}
//                       className={`adm-page-btn ${
//                         page === pageNumber ? "active" : ""
//                       }`}
//                       onClick={() => handleChangePage(pageNumber)}
//                     >
//                       {pageNumber + 1}
//                     </button>
//                   );
//                 })}

//                 <button
//                   className="adm-page-btn"
//                   disabled={page >= totalPages - 1}
//                   onClick={() => handleChangePage(page + 1)}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && deliveries.length === 0 && (
//         <div className="adm-empty-state">
//           <h3>No deliveries found</h3>
//           <p>No delivery orders match your current filters.</p>
//         </div>
//       )}

//       {/* Assign Agent Dialog */}
//       {assignDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Assign Delivery Agent</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Assign delivery to {selectedDelivery?.customerName} for{" "}
//                 {selectedDelivery?.planDetails?.planName}
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Select Agent</label>
//                 <select
//                   className="adm-form-select"
//                   value={selectedAgent}
//                   onChange={(e) => setSelectedAgent(e.target.value)}
//                 >
//                   <option value="">Choose an agent...</option>
//                   {agents.map((agent) => (
//                     <option key={agent._id} value={agent._id}>
//                       {agent.firstName} {agent.lastName} - {agent.phone}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setAssignDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-primary"
//                 onClick={confirmAssignAgent}
//               >
//                 Assign Agent
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Snackbar */}
//       {snackbar.open && (
//         <div className={`adm-snackbar ${snackbar.severity}`}>
//           {snackbar.severity === "success" ? (
//             <FaCheckCircle className="adm-icon" />
//           ) : (
//             <FaTimesCircle className="adm-icon" />
//           )}
//           {snackbar.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDeliveryManagement;




=======
// components/AdminDeliveryManagement.jsx
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
import React, { useState, useEffect } from "react";
import {
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaPlus,
  FaEye,
  FaSearch,
<<<<<<< HEAD
  FaPause,
  FaPlay,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaGasPump,
  FaFilter,
} from "react-icons/fa";
import "./DeliveryManagement.css";
import "./SharedPartialDeliveryStyle.css";
=======
} from "react-icons/fa";
import "./DeliveryManagement.css";
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b

const AdminDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    deliveryDate: "",
    search: "",
<<<<<<< HEAD
    remnantType: "",
    syncStatus: "",
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
=======
    remnantType: '',
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
    fetchAgents();
  }, [page, rowsPerPage, filters]);

<<<<<<< HEAD
=======
  // Update the fetchDeliveries function to include remnantType filter
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      }).toString();

      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
<<<<<<< HEAD
        // Enhance deliveries with subscription sync status
        const enhancedDeliveries = data.data.map((delivery) => ({
          ...delivery,
          syncStatus: checkDeliverySyncStatus(delivery),
        }));
        setDeliveries(enhancedDeliveries);
=======
        setDeliveries(data.data);
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
        setTotal(data.total);
      }
    } catch (error) {
      showSnackbar("Error fetching deliveries", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "https://egas-server-1.onrender.com/api/v1/admin/delivery/stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(
        "https://egas-server-1.onrender.com/api/v1/admin/users?role=delivery",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
<<<<<<< HEAD
=======
      console.log("Agents API response:", data);
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b

      if (data.success) {
        const agentsArray = Array.isArray(data.data)
          ? data.data
          : data.data?.users || [];
        setAgents(agentsArray);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    }
  };

<<<<<<< HEAD
  const checkDeliverySyncStatus = (delivery) => {
    if (!delivery.subscriptionId) return { isSynced: true };

    const subscription = delivery.subscriptionId;
    const shouldBePaused =
      subscription.status === "paused" && delivery.status !== "paused";
    const shouldBeActive =
      subscription.status === "active" && delivery.status === "paused";

    return {
      isSynced: !shouldBePaused && !shouldBeActive,
      subscriptionStatus: subscription.status,
      action: shouldBePaused ? "pause" : shouldBeActive ? "resume" : null,
      requiresSync: shouldBePaused || shouldBeActive,
    };
  };

  const handleSyncDelivery = async (deliveryId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/delivery/${deliveryId}/sync-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar(`Delivery synced: ${data.data.action}`, "success");
        fetchDeliveries();
      } else {
        showSnackbar(data.message || "Sync failed", "error");
      }
    } catch (error) {
      showSnackbar("Error syncing delivery", "error");
    }
  };

  const handlePauseSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/subscriptions/${subscriptionId}/admin-pause`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar("Subscription and deliveries paused", "success");
        fetchDeliveries();
      } else {
        showSnackbar(data.message, "error");
      }
    } catch (error) {
      showSnackbar("Error pausing subscription", "error");
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/subscriptions/${subscriptionId}/admin-resume`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar("Subscription and deliveries resumed", "success");
        fetchDeliveries();
      } else {
        showSnackbar(data.message, "error");
      }
    } catch (error) {
      showSnackbar("Error resuming subscription", "error");
    }
  };

=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
  const handleAssignAgent = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedAgent("");
    setAssignDialogOpen(true);
  };

  const confirmAssignAgent = async () => {
    if (!selectedAgent) {
      showSnackbar("Please select an agent", "error");
      return;
    }

    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedDelivery._id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ deliveryAgentId: selectedAgent }),
        }
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery assigned successfully", "success");
        setAssignDialogOpen(false);
        fetchDeliveries();
      } else {
        showSnackbar(data.message, "error");
      }
    } catch (error) {
      showSnackbar("Error assigning delivery", "error");
    }
  };

  const generateSchedules = async () => {
    try {
      const response = await fetch(
        "https://egas-server-1.onrender.com/api/v1/admin/delivery/generate-schedules",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ daysAhead: 7 }),
        }
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar(
          `Generated ${data.generatedCount} delivery schedules`,
          "success"
        );
        fetchDeliveries();
      }
    } catch (error) {
      showSnackbar("Error generating schedules", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ ...snackbar, open: false });
    }, 6000);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: "adm-status-pending",
      assigned: "adm-status-assigned",
      accepted: "adm-status-accepted",
      out_for_delivery: "adm-status-out_for_delivery",
      delivered: "adm-status-delivered",
      failed: "adm-status-failed",
      cancelled: "adm-status-pending",
<<<<<<< HEAD
      paused: "adm-status-paused",
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
    };
    return `adm-status-chip ${statusMap[status] || "adm-status-pending"}`;
  };

<<<<<<< HEAD
  const getSyncStatusClass = (syncStatus) => {
    if (!syncStatus.requiresSync) return "adm-sync-synced";
    return syncStatus.action === "pause"
      ? "adm-sync-needs-pause"
      : "adm-sync-needs-resume";
  };

=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

<<<<<<< HEAD
  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filter, value) => {
    setFilters((prev) => ({ ...prev, [filter]: value }));
    setPage(0);
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="adm-delivery-management">
      {/* Header and Stats */}
      <div className="adm-delivery-header">
        <h1 className="adm-delivery-title">Delivery Management</h1>
        <button className="adm-btn adm-btn-primary" onClick={generateSchedules}>
          <FaPlus className="adm-icon" />
          Generate Schedules
        </button>
      </div>

      {/* Stats Grid */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Today</div>
          <div className="adm-stat-value">{stats.today?.total || 0}</div>
        </div>
        <div className="adm-stat-card success">
          <div className="adm-stat-label">Delivered Today</div>
          <div className="adm-stat-value">{stats.today?.delivered || 0}</div>
        </div>
        <div className="adm-stat-card warning">
          <div className="adm-stat-label">Pending Today</div>
          <div className="adm-stat-value">{stats.today?.pending || 0}</div>
        </div>
        <div className="adm-stat-card error">
          <div className="adm-stat-label">Failed Today</div>
          <div className="adm-stat-value">{stats.today?.failed || 0}</div>
        </div>
<<<<<<< HEAD
        <div className="adm-stat-card info">
          <div className="adm-stat-label">Out of Sync</div>
          <div className="adm-stat-value">
            {deliveries.filter((d) => d.syncStatus?.requiresSync).length}
          </div>
        </div>
        <div className="adm-stat-card info">
          <div className="adm-stat-label">Partial Deliveries</div>
          <div className="adm-stat-value">
            {deliveries.filter((d) => d.partialDelivery?.isPartial).length}
          </div>
        </div>
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
      </div>

      {/* Filters */}
      <div className="adm-filters-card">
        <div className="adm-filters-grid">
          <div className="adm-form-group">
            <label className="adm-form-label">Search</label>
            <div style={{ position: "relative" }}>
              <FaSearch
                className="adm-icon"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#7f8c8d",
                }}
              />
              <input
                type="text"
                className="adm-form-input"
                style={{ paddingLeft: "40px" }}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by customer, address, or plan..."
              />
            </div>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Status</label>
            <select
              className="adm-form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="accepted">Accepted</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
<<<<<<< HEAD
              <option value="paused">Paused</option>
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Delivery Date</label>
            <input
              type="date"
              className="adm-form-input"
              value={filters.deliveryDate}
              onChange={(e) =>
                handleFilterChange("deliveryDate", e.target.value)
              }
            />
          </div>
<<<<<<< HEAD
          <div className="adm-form-group">
            <label className="adm-form-label">Delivery Type</label>
            <select
              className="adm-form-select"
              value={filters.remnantType || ""}
              onChange={(e) => handleFilterChange("remnantType", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="partial">Partial</option>
              <option value="remnant">Remnant</option>
=======

          {/* In the filters section, add a filter for remnant deliveries */}
          <div className="adm-form-group">
            <label className="adm-form-label">Remnant Type</label>
            <select
              className="adm-form-select"
              value={filters.remnantType || ""}
              onChange={(e) =>
                handleFilterChange("remnantType", e.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="partial">Partial Deliveries</option>
              <option value="remnant">Remnant Deliveries</option>
              <option value="regular">Regular Deliveries</option>
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
            </select>
          </div>
          <div className="adm-form-group">
            <button
              className="adm-btn adm-btn-outline"
              onClick={fetchDeliveries}
            >
              <FaSync className="adm-icon" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      {loading ? (
        <div className="adm-loading">
          <div className="adm-spinner"></div>
        </div>
      ) : (
        <div className="adm-table-container">
          <table className="adm-delivery-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Delivery Date</th>
                <th>Address</th>
                <th>Agent</th>
                <th>Status</th>
<<<<<<< HEAD
                <th>Delivery Type</th>
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
                <th>Remnant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {deliveries.map((delivery) => {
                const syncStatus = delivery.syncStatus;
                const isPartialDelivery = delivery.partialDelivery?.isPartial;
                const isRemnantDelivery = delivery.isRemnantDelivery;

                return (
                  <tr
                    key={delivery._id}
                    className={
                      !syncStatus.isSynced
                        ? "adm-row-out-of-sync"
                        : isPartialDelivery
                        ? "adm-row-partial"
                        : isRemnantDelivery
                        ? "adm-row-remnant"
                        : ""
                    }
                  >
                    <td>
                      <div className="adm-customer-info">
                        <div className="adm-customer-name">
                          {delivery.customerName}
                          {isPartialDelivery && (
                            <span className="adm-partial-badge">Partial</span>
                          )}
                          {isRemnantDelivery && (
                            <span className="adm-remnant-badge">Remnant</span>
                          )}
                        </div>
                        <div className="adm-customer-phone">
                          {delivery.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-plan-info">
                        <div className="adm-plan-name">
                          {delivery.planDetails.planName}
                        </div>
                        <div className="adm-plan-details">
                          {delivery.planDetails.size} •{" "}
                          {delivery.planDetails.frequency}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-delivery-date-cell">
                        {formatDateShort(delivery.deliveryDate)}
                        {delivery.originalDeliveryDate && (
                          <div className="adm-original-date">
                            Original: {formatDateShort(delivery.originalDeliveryDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="adm-address">{delivery.address}</div>
                    </td>
                    <td>
                      {delivery.deliveryAgent ? (
                        <div className="adm-agent-info">
                          {delivery.deliveryAgent.firstName}{" "}
                          {delivery.deliveryAgent.lastName}
                        </div>
                      ) : (
                        <div className="adm-agent-unassigned">Not assigned</div>
                      )}
                    </td>
                    <td>
                      <span className={getStatusClass(delivery.status)}>
                        {delivery.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="adm-delivery-type">
                        {isPartialDelivery ? (
                          <div className="adm-type-partial">
                            <FaGasPump className="adm-icon-sm" />
                            <span>Partial</span>
                            <div className="adm-type-details">
                              {delivery.deliveredKg}kg delivered
                            </div>
                          </div>
                        ) : isRemnantDelivery ? (
                          <div className="adm-type-remnant">
                            <FaGasPump className="adm-icon-sm" />
                            <span>Remnant</span>
                            <div className="adm-type-details">
                              {delivery.requestedKg}kg requested
                            </div>
                          </div>
                        ) : (
                          <div className="adm-type-regular">
                            <FaCheckCircle className="adm-icon-sm" />
                            <span>Regular</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="adm-remnant-info">
                        {isPartialDelivery ? (
                          <div className="adm-partial-delivery-details">
                            <div className="adm-kg-breakdown">
                              <div className="adm-delivered-kg">
                                Delivered: {delivery.deliveredKg}kg
                              </div>
                              <div className="adm-remaining-kg">
                                Remnant: {delivery.remainingKg}kg
                              </div>
                            </div>
                            <div className="adm-partial-status">
                              {delivery.partialDeliveryRecorded
                                ? "Recorded"
                                : "Can Record"}
                            </div>
                          </div>
                        ) : isRemnantDelivery ? (
                          <div className="adm-remnant-delivery-details">
                            <div className="adm-requested-kg">
                              Requested: {delivery.requestedKg}kg
                            </div>
                            <div className="adm-remnant-status">
                              {delivery.remnantId ? "Linked to remnant" : "No remnant"}
                            </div>
                          </div>
                        ) : (
                          <div className="adm-no-remnant">
                            <span className="adm-remnant-na">—</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="adm-action-buttons">
                        {!delivery.deliveryAgent &&
                          delivery.status === "pending" && (
                            <button
                              className="adm-btn adm-btn-outline adm-btn-small"
                              onClick={() => handleAssignAgent(delivery)}
                            >
                              <FaUserCheck className="adm-icon" />
                              Assign
                            </button>
                          )}

                        {/* Partial delivery cannot be reassigned */}
                        {!isPartialDelivery && !delivery.deliveryAgent &&
                          delivery.status === "pending" && (
                            <button
                              className="adm-btn adm-btn-outline adm-btn-small"
                              onClick={() => handleAssignAgent(delivery)}
                            >
                              <FaUserCheck className="adm-icon" />
                              Assign
                            </button>
                          )}

                        {delivery.subscriptionId && (
                          <div className="adm-subscription-actions">
                            {delivery.subscriptionId.status === "active" ? (
                              <button
                                className="adm-btn adm-btn-warning adm-btn-xs"
                                onClick={() =>
                                  handlePauseSubscription(
                                    delivery.subscriptionId._id
                                  )
                                }
                                title="Pause Subscription"
                              >
                                <FaPause />
                              </button>
                            ) : (
                              <button
                                className="adm-btn adm-btn-success adm-btn-xs"
                                onClick={() =>
                                  handleResumeSubscription(
                                    delivery.subscriptionId._id
                                  )
                                }
                                title="Resume Subscription"
                              >
                                <FaPlay />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Sync button for out-of-sync deliveries */}
                        {syncStatus.requiresSync && (
                          <button
                            className="adm-btn adm-btn-outline adm-btn-xs"
                            onClick={() => handleSyncDelivery(delivery._id)}
                          >
                            <FaSync /> Sync
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
=======
              {deliveries.map((delivery) => (
                <tr key={delivery._id}>
                  <td>
                    <div className="adm-customer-info">
                      <div className="adm-customer-name">
                        {delivery.customerName}
                      </div>
                      <div className="adm-customer-phone">
                        {delivery.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="adm-plan-info">
                      <div className="adm-plan-name">
                        {delivery.planDetails.planName}
                      </div>
                      <div className="adm-plan-details">
                        {delivery.planDetails.size} •{" "}
                        {delivery.planDetails.frequency}
                        {delivery.isRemnantDelivery && (
                          <span className="adm-remnant-badge">(Remnant)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(delivery.deliveryDate)}</td>
                  <td>
                    <div className="adm-address">{delivery.address}</div>
                  </td>
                  <td>
                    {delivery.deliveryAgent ? (
                      <div className="adm-agent-info">
                        {delivery.deliveryAgent.firstName}{" "}
                        {delivery.deliveryAgent.lastName}
                      </div>
                    ) : (
                      <div className="adm-agent-unassigned">Not assigned</div>
                    )}
                  </td>
                  <td>
                    <span className={getStatusClass(delivery.status)}>
                      {delivery.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  {/* ADD THE REMNANT COLUMN HERE */}
                  <td>
                    <div className="adm-remnant-info">
                      {delivery.partialDelivery?.isPartial ? (
                        <div className="adm-partial-delivery">
                          <div className="adm-delivered-kg">
                            Delivered: {delivery.deliveredKg}kg
                          </div>
                          <div className="adm-remaining-kg">
                            Remaining: {delivery.remainingKg}kg
                          </div>
                        </div>
                      ) : delivery.isRemnantDelivery ? (
                        <div className="adm-remnant-delivery">
                          <div className="adm-requested-kg">
                            Requested: {delivery.requestedKg}kg
                          </div>
                        </div>
                      ) : (
                        <div className="adm-no-remnant">
                          <span className="adm-remnant-na">—</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {!delivery.deliveryAgent &&
                      delivery.status === "pending" && (
                        <button
                          className="adm-btn adm-btn-outline adm-btn-small"
                          onClick={() => handleAssignAgent(delivery)}
                        >
                          <FaUserCheck className="adm-icon" />
                          Assign
                        </button>
                      )}
                  </td>
                </tr>
              ))}
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
            </tbody>
          </table>

          {/* Pagination */}
          <div className="adm-pagination">
            <div className="adm-pagination-info">
              Showing {deliveries.length} of {total} deliveries
<<<<<<< HEAD
              {deliveries.filter((d) => d.partialDelivery?.isPartial).length >
                0 && (
                <span className="adm-partial-count">
                  • {deliveries.filter((d) => d.partialDelivery?.isPartial).length} partial
                </span>
              )}
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
            </div>
            <div className="adm-pagination-controls">
              <select
                className="adm-pagination-select"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
              </select>

              <div className="adm-pagination-buttons">
                <button
                  className="adm-page-btn"
                  disabled={page === 0}
                  onClick={() => handleChangePage(page - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + Math.max(0, page - 2);
                  if (pageNumber >= totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
                      className={`adm-page-btn ${
                        page === pageNumber ? "active" : ""
                      }`}
                      onClick={() => handleChangePage(pageNumber)}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}

                <button
                  className="adm-page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => handleChangePage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && deliveries.length === 0 && (
        <div className="adm-empty-state">
          <h3>No deliveries found</h3>
          <p>No delivery orders match your current filters.</p>
        </div>
      )}

      {/* Assign Agent Dialog */}
      {assignDialogOpen && (
        <div className="adm-dialog-overlay">
          <div className="adm-dialog">
            <div className="adm-dialog-header">
              <h2 className="adm-dialog-title">Assign Delivery Agent</h2>
            </div>
            <div className="adm-dialog-content">
              <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
                Assign delivery to {selectedDelivery?.customerName} for{" "}
                {selectedDelivery?.planDetails?.planName}
<<<<<<< HEAD
                {selectedDelivery?.partialDelivery?.isPartial && (
                  <span className="adm-partial-note">
                    <br />
                    <strong>Note:</strong> This is a partial delivery
                  </span>
                )}
=======
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
              </p>
              <div className="adm-form-group">
                <label className="adm-form-label">Select Agent</label>
                <select
                  className="adm-form-select"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.firstName} {agent.lastName} - {agent.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="adm-dialog-footer">
              <button
                className="adm-btn adm-btn-outline"
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="adm-btn adm-btn-primary"
                onClick={confirmAssignAgent}
              >
                Assign Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`adm-snackbar ${snackbar.severity}`}>
          {snackbar.severity === "success" ? (
            <FaCheckCircle className="adm-icon" />
          ) : (
            <FaTimesCircle className="adm-icon" />
          )}
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
export default AdminDeliveryManagement;
=======
export default AdminDeliveryManagement;
>>>>>>> 0246311345aff9fbd5c91b3f8a9ee3f8973a8d7b
