// // components/DeliveryAgentPortal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   FaCheckCircle,
//   FaTimesCircle,
//   FaDirections,
//   FaPhone,
//   FaMapMarkerAlt,
//   FaSync,
//   FaShippingFast,
//   FaHistory,
//   FaExclamationTriangle,
// } from "react-icons/fa";
// import "./DeliveryAgentPortal.css";

// const DeliveryAgentPortal = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
//   const [failureDialogOpen, setFailureDialogOpen] = useState(false);
//   const [partialDialogOpen, setPartialDialogOpen] = useState(false);
//   const [orderForPartial, setOrderForPartial] = useState(null);
//   const [deliveryNotes, setDeliveryNotes] = useState("");
//   const [failureReason, setFailureReason] = useState("");
//   const [failureNotes, setFailureNotes] = useState("");
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   useEffect(() => {
//     fetchDeliveries();
//   }, [selectedTab]);

//   const fetchDeliveries = async () => {
//     try {
//       setLoading(true);

//       // Determine delivery status based on selected tab
//       let status = "all";
//       if (selectedTab === 0)
//         status =
//           "assigned,accepted,out_for_delivery"; // Includes assigned, accepted, out_for_delivery
//       else if (selectedTab === 1) status = "delivered";
//       else if (selectedTab === 2) status = "failed";

//       // Fetch deliveries for the logged-in agent
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/agent/my-deliveries?status=${status}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token?.replace(/^"|"$/g, "")}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setDeliveries(data.data);
//       } else {
//         showSnackbar(data.message || "Failed to fetch deliveries", "error");
//       }
//     } catch (error) {
//       console.error("Error fetching deliveries:", error);
//       showSnackbar("Error fetching deliveries", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAcceptDelivery = async (orderId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/accept`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery accepted successfully", "success");
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error accepting delivery", "error");
//     }
//   };

//   const handleMarkOutForDelivery = async (orderId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/out-for-delivery`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as out for delivery", "success");
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error updating delivery status", "error");
//     }
//   };

//   const handleMarkDelivered = async () => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/delivered`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ notes: deliveryNotes }),
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as successful", "success");
//         setDeliveryDialogOpen(false);
//         setDeliveryNotes("");
//         setSelectedOrder(null);
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error marking delivery", "error");
//     }
//   };

//   const handleMarkFailed = async () => {
//     if (!failureReason.trim()) {
//       showSnackbar("Please provide a reason for failure", "error");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/failed`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             reason: failureReason,
//             notes: failureNotes,
//           }),
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as failed and rescheduled", "success");
//         setFailureDialogOpen(false);
//         setFailureReason("");
//         setFailureNotes("");
//         setSelectedOrder(null);
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error marking delivery as failed", "error");
//     }
//   };

//   const handleRecordPartialDelivery = async (
//     deliveredKg,
//     remainingKg,
//     notes
//   ) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderForPartial._id}/partial-delivery`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             deliveredKg,
//             remainingKg,
//             notes,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Partial delivery recorded successfully", "success");
//         setPartialDialogOpen(false);
//         setOrderForPartial(null);
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar(
//         error?.response?.data?.message || "Error recording partial delivery",
//         "error"
//       );
//     }
//   };

//   const openDirections = (address) => {
//     const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
//       address
//     )}`;
//     window.open(mapsUrl, "_blank");
//   };

//   const callCustomer = (phone) => {
//     window.open(`tel:${phone}`);
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//     setTimeout(() => {
//       setSnackbar({ ...snackbar, open: false });
//     }, 6000);
//   };

//   const getStatusClass = (status) => {
//     const statusMap = {
//       assigned: "adm-status-assigned",
//       accepted: "adm-status-accepted",
//       out_for_delivery: "adm-status-out_for_delivery",
//       delivered: "adm-status-delivered",
//       failed: "adm-status-failed",
//     };
//     return `adm-status-chip ${statusMap[status] || "adm-status-assigned"}`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleTabChange = (newValue) => {
//     setSelectedTab(newValue);
//   };

//   // Partial Delivery Dialog Component
//   const PartialDeliveryDialog = ({ open, onClose, order, onConfirm }) => {
//     const [deliveredKg, setDeliveredKg] = useState("");
//     const [remainingKg, setRemainingKg] = useState("");
//     const [notes, setNotes] = useState("");
//     const [error, setError] = useState("");

//     const expectedKg = order?.planDetails?.size
//       ? parseFloat(order.planDetails.size.split("kg")[0])
//       : 0;

//     React.useEffect(() => {
//       if (open && order) {
//         setDeliveredKg("");
//         setRemainingKg("");
//         setNotes("");
//         setError("");
//       }
//     }, [open, order]);

//     const handleSubmit = () => {
//       const delivered = parseFloat(deliveredKg);
//       const remaining = parseFloat(remainingKg);

//       if (!deliveredKg || !remainingKg) {
//         setError("Both fields are required");
//         return;
//       }

//       if (isNaN(delivered) || isNaN(remaining)) {
//         setError("Please enter valid numbers");
//         return;
//       }

//       if (delivered + remaining !== expectedKg) {
//         setError(`Total must equal ${expectedKg}kg`);
//         return;
//       }

//       onConfirm(Number(deliveredKg), Number(remainingKg), notes);
//     };

//     if (!open) return null;

//     return (
//       <div className="adm-dialog-overlay">
//         <div className="adm-dialog">
//           <div className="adm-dialog-header">
//             <h2 className="adm-dialog-title">Record Partial Delivery</h2>
//           </div>
//           <div className="adm-dialog-content">
//             <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//               Customer: <strong>{order.customerName}</strong>
//               <br />
//               Expected: <strong>{expectedKg}kg</strong>
//               <br />
//               Plan: <strong>{order.planDetails.planName}</strong>
//             </p>

//             {error && (
//               <div
//                 className="adm-alert adm-alert-error"
//                 style={{ marginBottom: "1rem" }}
//               >
//                 {error}
//               </div>
//             )}

//             <div className="adm-form-row">
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Delivered (kg)</label>
//                 <input
//                   type="number"
//                   className="adm-form-input"
//                   value={deliveredKg}
//                   onChange={(e) => {
//                     setDeliveredKg(e.target.value);
//                     if (expectedKg && e.target.value) {
//                       const remaining = expectedKg - parseFloat(e.target.value);
//                       setRemainingKg(remaining.toString());
//                     }
//                   }}
//                   min="0"
//                   max={expectedKg}
//                   step="0.5"
//                   placeholder="0"
//                 />
//               </div>

//               <div className="adm-form-group">
//                 <label className="adm-form-label">Remaining (kg)</label>
//                 <input
//                   type="number"
//                   className="adm-form-input"
//                   value={remainingKg}
//                   onChange={(e) => {
//                     setRemainingKg(e.target.value);
//                     if (expectedKg && e.target.value) {
//                       const delivered = expectedKg - parseFloat(e.target.value);
//                       setDeliveredKg(delivered.toString());
//                     }
//                   }}
//                   min="0"
//                   max={expectedKg}
//                   step="0.5"
//                   placeholder="0"
//                 />
//               </div>
//             </div>

//             <div className="adm-form-group">
//               <label className="adm-form-label">Notes (Optional)</label>
//               <textarea
//                 className="adm-form-textarea"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Add notes about why partial delivery was needed..."
//                 rows={3}
//               />
//             </div>

//             <div
//               className="adm-info-box"
//               style={{
//                 backgroundColor: "#f8f9fa",
//                 padding: "1rem",
//                 borderRadius: "4px",
//                 marginTop: "1rem",
//               }}
//             >
//               <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
//                 <strong>Note:</strong> The remaining {remainingKg || "..."}kg
//                 will be added to customer's accumulated remnant balance.
//                 Customer needs to confirm this entry.
//               </p>
//             </div>
//           </div>
//           <div className="adm-dialog-footer">
//             <button className="adm-btn adm-btn-outline" onClick={onClose}>
//               Cancel
//             </button>
//             <button
//               className="adm-btn adm-btn-warning"
//               onClick={handleSubmit}
//               disabled={!deliveredKg || !remainingKg}
//             >
//               <FaExclamationTriangle className="adm-icon" />
//               Record Partial Delivery
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Filter deliveries for display (as backup)
//   const getFilteredDeliveries = () => {
//     if (selectedTab === 0) {
//       return deliveries.filter((delivery) =>
//         ["assigned", "accepted", "out_for_delivery"].includes(delivery.status)
//       );
//     } else if (selectedTab === 1) {
//       return deliveries.filter((delivery) => delivery.status === "delivered");
//     } else if (selectedTab === 2) {
//       return deliveries.filter((delivery) => delivery.status === "failed");
//     }
//     return deliveries;
//   };

//   const displayDeliveries = getFilteredDeliveries();

//   if (loading) {
//     return (
//       <div className="adm-agent-portal">
//         <div className="adm-loading">
//           <div className="adm-spinner"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="adm-agent-portal">
//       <div className="adm-agent-header">
//         <h1 className="adm-agent-title">My Deliveries</h1>

//         <div className="adm-tabs">
//           <button
//             className={`adm-tab ${selectedTab === 0 ? "active" : ""}`}
//             onClick={() => handleTabChange(0)}
//           >
//             <FaShippingFast className="adm-icon" />
//             Active Deliveries
//             <span className="adm-tab-badge">
//               {
//                 deliveries.filter((d) =>
//                   ["assigned", "accepted", "out_for_delivery"].includes(
//                     d.status
//                   )
//                 ).length
//               }
//             </span>
//           </button>
//           <button
//             className={`adm-tab ${selectedTab === 1 ? "active" : ""}`}
//             onClick={() => handleTabChange(1)}
//           >
//             <FaHistory className="adm-icon" />
//             Delivery History
//             <span className="adm-tab-badge">
//               {deliveries.filter((d) => d.status === "delivered").length}
//             </span>
//           </button>
//           <button
//             className={`adm-tab ${selectedTab === 2 ? "active" : ""}`}
//             onClick={() => handleTabChange(2)}
//           >
//             <FaExclamationTriangle className="adm-icon" />
//             Failed Deliveries
//             <span className="adm-tab-badge">
//               {deliveries.filter((d) => d.status === "failed").length}
//             </span>
//           </button>
//         </div>
//       </div>

//       <div className="adm-deliveries-grid">
//         {displayDeliveries.map((order) => (
//           <div key={order._id} className="adm-delivery-card">
//             <div className="adm-card-content">
//               <div className="adm-card-header">
//                 <div className="adm-customer-info">
//                   <div className="adm-customer-name">{order.customerName}</div>

//                   <div className="adm-customer-detail">
//                     <FaMapMarkerAlt className="adm-icon" />
//                     <span>{order.address}</span>
//                   </div>

//                   <div className="adm-customer-detail">
//                     <FaPhone className="adm-icon" />
//                     <span>{order.customerPhone}</span>
//                   </div>

//                   <div className={getStatusClass(order.status)}>
//                     {order.status.replace(/_/g, " ").toUpperCase()}
//                   </div>

//                   <div className="adm-plan-details">
//                     <div className="adm-plan-detail">
//                       <strong>Plan:</strong> {order.planDetails?.planName} (
//                       {order.planDetails?.size})
//                     </div>
//                     <div className="adm-plan-detail">
//                       <strong>Delivery Date:</strong>{" "}
//                       {formatDate(order.deliveryDate)}
//                     </div>

//                     {order.retryCount > 0 && (
//                       <div className="adm-retry-badge">
//                         Retry Attempt: {order.retryCount}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="adm-action-buttons">
//                   {/* Action Buttons based on status */}
//                   {order.status === "assigned" && (
//                     <button
//                       className="adm-btn adm-btn-primary"
//                       onClick={() => handleAcceptDelivery(order._id)}
//                     >
//                       Accept Delivery
//                     </button>
//                   )}

//                   {order.status === "accepted" && (
//                     <button
//                       className="adm-btn adm-btn-warning"
//                       onClick={() => handleMarkOutForDelivery(order._id)}
//                     >
//                       Start Delivery
//                     </button>
//                   )}

//                   {["accepted", "out_for_delivery"].includes(order.status) && (
//                     <div className="adm-btn-group">
//                       <button
//                         className="adm-btn adm-btn-success adm-btn-small"
//                         onClick={() => {
//                           setSelectedOrder(order);
//                           setDeliveryDialogOpen(true);
//                         }}
//                       >
//                         <FaCheckCircle className="adm-icon" />
//                         Delivered
//                       </button>

//                       {/* Add Partial Delivery Button */}
//                       <button
//                         className="adm-btn adm-btn-warning adm-btn-small"
//                         onClick={() => {
//                           setOrderForPartial(order);
//                           setPartialDialogOpen(true);
//                         }}
//                       >
//                         <FaExclamationTriangle className="adm-icon" />
//                         Partial
//                       </button>

//                       <button
//                         className="adm-btn adm-btn-error adm-btn-small"
//                         onClick={() => {
//                           setSelectedOrder(order);
//                           setFailureDialogOpen(true);
//                         }}
//                       >
//                         <FaTimesCircle className="adm-icon" />
//                         Failed
//                       </button>
//                     </div>
//                   )}

//                   <button
//                     className="adm-btn adm-btn-outline adm-btn-small"
//                     onClick={() => openDirections(order.address)}
//                   >
//                     <FaDirections className="adm-icon" />
//                     Directions
//                   </button>

//                   <button
//                     className="adm-btn adm-btn-outline adm-btn-small"
//                     onClick={() => callCustomer(order.customerPhone)}
//                   >
//                     <FaPhone className="adm-icon" />
//                     Call Customer
//                   </button>
//                 </div>
//               </div>

//               {order.status === "delivered" && order.deliveredAt && (
//                 <div className="adm-delivery-status adm-status-success">
//                   <div>
//                     <strong>Delivered on:</strong>{" "}
//                     {formatDate(order.deliveredAt)}
//                   </div>
//                   {order.agentNotes && (
//                     <div>
//                       <strong>Notes:</strong> {order.agentNotes}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {order.status === "failed" && order.failedAt && (
//                 <div className="adm-delivery-status adm-status-failed">
//                   <div>
//                     <strong>Failed on:</strong> {formatDate(order.failedAt)}
//                   </div>
//                   <div>
//                     <strong>Reason:</strong> {order.failedReason}
//                   </div>
//                   {order.agentNotes && (
//                     <div>
//                       <strong>Notes:</strong> {order.agentNotes}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}

//         {displayDeliveries.length === 0 && (
//           <div className="adm-empty-state">
//             <h3>No deliveries found</h3>
//             <p>
//               {selectedTab === 0
//                 ? "You don't have any active deliveries assigned."
//                 : selectedTab === 1
//                 ? "No delivery history found."
//                 : "No failed deliveries found."}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Delivery Success Dialog */}
//       {deliveryDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Mark Delivery as Successful</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Confirm that you have successfully delivered to{" "}
//                 {selectedOrder?.customerName}
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">
//                   Delivery Notes (Optional)
//                 </label>
//                 <textarea
//                   className="adm-form-textarea"
//                   value={deliveryNotes}
//                   onChange={(e) => setDeliveryNotes(e.target.value)}
//                   placeholder="Add any notes about the delivery..."
//                   rows={3}
//                 />
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setDeliveryDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-success"
//                 onClick={handleMarkDelivered}
//               >
//                 <FaCheckCircle className="adm-icon" />
//                 Confirm Delivery
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delivery Failure Dialog */}
//       {failureDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Mark Delivery as Failed</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Please provide details about the delivery failure. The delivery
//                 will be automatically rescheduled for tomorrow.
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Failure Reason</label>
//                 <select
//                   className="adm-form-select"
//                   value={failureReason}
//                   onChange={(e) => setFailureReason(e.target.value)}
//                 >
//                   <option value="">Select a reason...</option>
//                   <option value="Customer not available">
//                     Customer not available
//                   </option>
//                   <option value="Wrong address">Wrong address</option>
//                   <option value="Customer refused delivery">
//                     Customer refused delivery
//                   </option>
//                   <option value="Safety concerns">Safety concerns</option>
//                   <option value="Vehicle breakdown">Vehicle breakdown</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Additional Notes</label>
//                 <textarea
//                   className="adm-form-textarea"
//                   value={failureNotes}
//                   onChange={(e) => setFailureNotes(e.target.value)}
//                   placeholder="Provide more details about the failure..."
//                   rows={3}
//                 />
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setFailureDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-error"
//                 onClick={handleMarkFailed}
//               >
//                 <FaTimesCircle className="adm-icon" />
//                 Mark as Failed
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Partial Delivery Dialog */}
//       <PartialDeliveryDialog
//         open={partialDialogOpen}
//         onClose={() => {
//           setPartialDialogOpen(false);
//           setOrderForPartial(null);
//         }}
//         order={orderForPartial}
//         onConfirm={handleRecordPartialDelivery}
//       />

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

// export default DeliveryAgentPortal;

// components/DeliveryAgentPortal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   FaCheckCircle,
//   FaTimesCircle,
//   FaDirections,
//   FaPhone,
//   FaMapMarkerAlt,
//   FaSync,
//   FaShippingFast,
//   FaHistory,
//   FaExclamationTriangle,
//   FaPauseCircle,
//   FaPlayCircle,
//   FaInfoCircle,
// } from "react-icons/fa";
// import "./DeliveryAgentPortal.css";

// const DeliveryAgentPortal = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
//   const [failureDialogOpen, setFailureDialogOpen] = useState(false);
//   const [partialDialogOpen, setPartialDialogOpen] = useState(false);
//   const [orderForPartial, setOrderForPartial] = useState(null);
//   const [deliveryNotes, setDeliveryNotes] = useState("");
//   const [failureReason, setFailureReason] = useState("");
//   const [failureNotes, setFailureNotes] = useState("");
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   useEffect(() => {
//     fetchDeliveries();
//   }, [selectedTab]);

//   const fetchDeliveries = async () => {
//     try {
//       setLoading(true);

//       // Determine delivery status based on selected tab
//       let status = "all";
//       if (selectedTab === 0)
//         status =
//           "assigned,accepted,out_for_delivery,paused"; // Includes paused deliveries
//       else if (selectedTab === 1) status = "delivered";
//       else if (selectedTab === 2) status = "failed";

//       // Fetch deliveries for the logged-in agent
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/agent/my-deliveries?status=${status}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token?.replace(/^"|"$/g, "")}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success) {
//         // Enhance deliveries with subscription info
//         const enhancedDeliveries = await Promise.all(
//           data.data.map(async (delivery) => {
//             // Fetch subscription details if available
//             if (delivery.subscriptionId) {
//               try {
//                 const subResponse = await fetch(
//                   `https://egas-server-1.onrender.com/api/v1/subscriptions/${delivery.subscriptionId._id || delivery.subscriptionId}`,
//                   {
//                     headers: {
//                       Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                   }
//                 );
//                 const subData = await subResponse.json();
//                 if (subData.success) {
//                   return {
//                     ...delivery,
//                     subscriptionDetails: subData.data
//                   };
//                 }
//               } catch (error) {
//                 console.error("Error fetching subscription:", error);
//               }
//             }
//             return delivery;
//           })
//         );
//         setDeliveries(enhancedDeliveries);
//       } else {
//         showSnackbar(data.message || "Failed to fetch deliveries", "error");
//       }
//     } catch (error) {
//       console.error("Error fetching deliveries:", error);
//       showSnackbar("Error fetching deliveries", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Check if delivery should be paused based on subscription
//   const checkDeliverySyncStatus = (delivery) => {
//     if (!delivery.subscriptionDetails) return { shouldBePaused: false };

//     const shouldBePaused = delivery.subscriptionDetails.status === "paused" &&
//                           delivery.status !== "paused" &&
//                           delivery.status !== "delivered" &&
//                           delivery.status !== "failed";

//     return {
//       shouldBePaused,
//       subscriptionStatus: delivery.subscriptionDetails.status,
//       subscriptionPausedAt: delivery.subscriptionDetails.pausedAt
//     };
//   };

//   const handleAcceptDelivery = async (orderId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/accept`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery accepted successfully", "success");
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error accepting delivery", "error");
//     }
//   };

//   const handleMarkOutForDelivery = async (orderId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/out-for-delivery`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as out for delivery", "success");
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error updating delivery status", "error");
//     }
//   };

//   const handleMarkDelivered = async () => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/delivered`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ notes: deliveryNotes }),
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as successful", "success");
//         setDeliveryDialogOpen(false);
//         setDeliveryNotes("");
//         setSelectedOrder(null);
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error marking delivery", "error");
//     }
//   };

//   const handleMarkFailed = async () => {
//     if (!failureReason.trim()) {
//       showSnackbar("Please provide a reason for failure", "error");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/failed`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             reason: failureReason,
//             notes: failureNotes,
//           }),
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Delivery marked as failed and rescheduled", "success");
//         setFailureDialogOpen(false);
//         setFailureReason("");
//         setFailureNotes("");
//         setSelectedOrder(null);
//         fetchDeliveries();
//       }
//     } catch (error) {
//       showSnackbar("Error marking delivery as failed", "error");
//     }
//   };

//   const handleRecordPartialDelivery = async (
//     deliveredKg,
//     remainingKg,
//     notes
//   ) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderForPartial._id}/partial-delivery`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             deliveredKg,
//             remainingKg,
//             notes,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showSnackbar("Partial delivery recorded successfully", "success");
//         setPartialDialogOpen(false);
//         setOrderForPartial(null);
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar(
//         error?.response?.data?.message || "Error recording partial delivery",
//         "error"
//       );
//     }
//   };

//   const handleSyncWithSubscription = async (deliveryId) => {
//     try {
//       const response = await fetch(
//         `https://egas-server-1.onrender.com/api/v1/deliveries/${deliveryId}/sync-subscription`,
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
//         showSnackbar("Delivery synced with subscription", "success");
//         fetchDeliveries();
//       } else {
//         showSnackbar(data.message, "error");
//       }
//     } catch (error) {
//       showSnackbar("Error syncing delivery", "error");
//     }
//   };

//   const openDirections = (address) => {
//     const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
//       address
//     )}`;
//     window.open(mapsUrl, "_blank");
//   };

//   const callCustomer = (phone) => {
//     window.open(`tel:${phone}`);
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//     setTimeout(() => {
//       setSnackbar({ ...snackbar, open: false });
//     }, 6000);
//   };

//   const getStatusClass = (status) => {
//     const statusMap = {
//       assigned: "adm-status-assigned",
//       accepted: "adm-status-accepted",
//       out_for_delivery: "adm-status-out_for_delivery",
//       delivered: "adm-status-delivered",
//       failed: "adm-status-failed",
//       paused: "adm-status-paused",
//     };
//     return `adm-status-chip ${statusMap[status] || "adm-status-assigned"}`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleTabChange = (newValue) => {
//     setSelectedTab(newValue);
//   };

//   // Filter deliveries for display
//   const getFilteredDeliveries = () => {
//     if (selectedTab === 0) {
//       return deliveries.filter((delivery) =>
//         ["assigned", "accepted", "out_for_delivery", "paused"].includes(delivery.status)
//       );
//     } else if (selectedTab === 1) {
//       return deliveries.filter((delivery) => delivery.status === "delivered");
//     } else if (selectedTab === 2) {
//       return deliveries.filter((delivery) => delivery.status === "failed");
//     }
//     return deliveries;
//   };

//   const displayDeliveries = getFilteredDeliveries();

//   if (loading) {
//     return (
//       <div className="adm-agent-portal">
//         <div className="adm-loading">
//           <div className="adm-spinner"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="adm-agent-portal">
//       <div className="adm-agent-header">
//         <h1 className="adm-agent-title">My Deliveries</h1>

//         <div className="adm-tabs">
//           <button
//             className={`adm-tab ${selectedTab === 0 ? "active" : ""}`}
//             onClick={() => handleTabChange(0)}
//           >
//             <FaShippingFast className="adm-icon" />
//             Active Deliveries
//             <span className="adm-tab-badge">
//               {
//                 deliveries.filter((d) =>
//                   ["assigned", "accepted", "out_for_delivery", "paused"].includes(
//                     d.status
//                   )
//                 ).length
//               }
//             </span>
//           </button>
//           <button
//             className={`adm-tab ${selectedTab === 1 ? "active" : ""}`}
//             onClick={() => handleTabChange(1)}
//           >
//             <FaHistory className="adm-icon" />
//             Delivery History
//             <span className="adm-tab-badge">
//               {deliveries.filter((d) => d.status === "delivered").length}
//             </span>
//           </button>
//           <button
//             className={`adm-tab ${selectedTab === 2 ? "active" : ""}`}
//             onClick={() => handleTabChange(2)}
//           >
//             <FaExclamationTriangle className="adm-icon" />
//             Failed Deliveries
//             <span className="adm-tab-badge">
//               {deliveries.filter((d) => d.status === "failed").length}
//             </span>
//           </button>
//         </div>
//       </div>

//       <div className="adm-deliveries-grid">
//         {displayDeliveries.map((order) => {
//           const syncStatus = checkDeliverySyncStatus(order);

//           return (
//             <div key={order._id} className={`adm-delivery-card ${order.status === "paused" ? "paused" : ""}`}>
//               {/* Sync Warning Banner */}
//               {syncStatus.shouldBePaused && (
//                 <div className="adm-sync-warning-banner">
//                   <FaExclamationTriangle className="adm-icon" />
//                   <div className="adm-sync-warning-content">
//                     <strong>Subscription Paused</strong>
//                     <span>This delivery should be paused</span>
//                     {syncStatus.subscriptionPausedAt && (
//                       <span className="adm-pause-date">
//                         Paused since: {formatDate(syncStatus.subscriptionPausedAt)}
//                       </span>
//                     )}
//                   </div>
//                   <button
//                     className="adm-btn adm-btn-sm adm-btn-outline"
//                     onClick={() => handleSyncWithSubscription(order._id)}
//                   >
//                     <FaSync /> Sync
//                   </button>
//                 </div>
//               )}

//               <div className="adm-card-content">
//                 <div className="adm-card-header">
//                   <div className="adm-customer-info">
//                     <div className="adm-customer-name">{order.customerName}</div>

//                     <div className="adm-customer-detail">
//                       <FaMapMarkerAlt className="adm-icon" />
//                       <span>{order.address}</span>
//                     </div>

//                     <div className="adm-customer-detail">
//                       <FaPhone className="adm-icon" />
//                       <span>{order.customerPhone}</span>
//                     </div>

//                     <div className={getStatusClass(order.status)}>
//                       {order.status.replace(/_/g, " ").toUpperCase()}
//                       {order.status === "paused" && " (Sub Paused)"}
//                     </div>

//                     <div className="adm-plan-details">
//                       <div className="adm-plan-detail">
//                         <strong>Plan:</strong> {order.planDetails?.planName} (
//                         {order.planDetails?.size})
//                       </div>
//                       <div className="adm-plan-detail">
//                         <strong>Delivery Date:</strong>{" "}
//                         {formatDate(order.deliveryDate)}
//                         {order.originalDeliveryDate && (
//                           <div className="adm-original-date">
//                             (Originally: {formatDate(order.originalDeliveryDate)})
//                           </div>
//                         )}
//                       </div>

//                       {/* Subscription Status Info */}
//                       {order.subscriptionDetails && (
//                         <div className="adm-subscription-info">
//                           <FaInfoCircle className="adm-icon-sm" />
//                           <span className={`adm-subscription-status status-${order.subscriptionDetails.status}`}>
//                             Subscription: {order.subscriptionDetails.status}
//                           </span>
//                         </div>
//                       )}

//                       {order.retryCount > 0 && (
//                         <div className="adm-retry-badge">
//                           Retry Attempt: {order.retryCount}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="adm-action-buttons">
//                     {/* Action Buttons based on status */}
//                     {order.status === "assigned" && (
//                       <button
//                         className="adm-btn adm-btn-primary"
//                         onClick={() => handleAcceptDelivery(order._id)}
//                       >
//                         Accept Delivery
//                       </button>
//                     )}

//                     {order.status === "accepted" && (
//                       <button
//                         className="adm-btn adm-btn-warning"
//                         onClick={() => handleMarkOutForDelivery(order._id)}
//                       >
//                         Start Delivery
//                       </button>
//                     )}

//                     {["accepted", "out_for_delivery", "paused"].includes(order.status) && (
//                       <div className="adm-btn-group">
//                         {order.status !== "paused" && (
//                           <>
//                             <button
//                               className="adm-btn adm-btn-success adm-btn-small"
//                               onClick={() => {
//                                 setSelectedOrder(order);
//                                 setDeliveryDialogOpen(true);
//                               }}
//                             >
//                               <FaCheckCircle className="adm-icon" />
//                               Delivered
//                             </button>

//                             <button
//                               className="adm-btn adm-btn-warning adm-btn-small"
//                               onClick={() => {
//                                 setOrderForPartial(order);
//                                 setPartialDialogOpen(true);
//                               }}
//                             >
//                               <FaExclamationTriangle className="adm-icon" />
//                               Partial
//                             </button>
//                           </>
//                         )}

//                         <button
//                           className="adm-btn adm-btn-error adm-btn-small"
//                           onClick={() => {
//                             setSelectedOrder(order);
//                             setFailureDialogOpen(true);
//                           }}
//                         >
//                           <FaTimesCircle className="adm-icon" />
//                           Failed
//                         </button>
//                       </div>
//                     )}

//                     <div className="adm-navigation-buttons">
//                       <button
//                         className="adm-btn adm-btn-outline adm-btn-small"
//                         onClick={() => openDirections(order.address)}
//                       >
//                         <FaDirections className="adm-icon" />
//                         Directions
//                       </button>

//                       <button
//                         className="adm-btn adm-btn-outline adm-btn-small"
//                         onClick={() => callCustomer(order.customerPhone)}
//                       >
//                         <FaPhone className="adm-icon" />
//                         Call Customer
//                       </button>
//                     </div>

//                     {/* Sync Button for paused deliveries */}
//                     {order.status === "paused" && order.subscriptionDetails?.status === "active" && (
//                       <button
//                         className="adm-btn adm-btn-success adm-btn-small"
//                         onClick={() => handleSyncWithSubscription(order._id)}
//                         title="Sync with subscription status"
//                       >
//                         <FaPlayCircle className="adm-icon" />
//                         Resume Delivery
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Paused Delivery Info */}
//                 {order.status === "paused" && (
//                   <div className="adm-paused-info">
//                     <FaPauseCircle className="adm-icon" />
//                     <div>
//                       <strong>Delivery Paused</strong>
//                       {order.pausedAt && (
//                         <div>Paused on: {formatDate(order.pausedAt)}</div>
//                       )}
//                       {order.originalDeliveryDate && (
//                         <div>
//                           Original delivery date: {formatDate(order.originalDeliveryDate)}
//                         </div>
//                       )}
//                       {order.subscriptionDetails?.pausedAt && (
//                         <div>
//                           Subscription paused: {formatDate(order.subscriptionDetails.pausedAt)}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {order.status === "delivered" && order.deliveredAt && (
//                   <div className="adm-delivery-status adm-status-success">
//                     <div>
//                       <strong>Delivered on:</strong>{" "}
//                       {formatDate(order.deliveredAt)}
//                     </div>
//                     {order.agentNotes && (
//                       <div>
//                         <strong>Notes:</strong> {order.agentNotes}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {order.status === "failed" && order.failedAt && (
//                   <div className="adm-delivery-status adm-status-failed">
//                     <div>
//                       <strong>Failed on:</strong> {formatDate(order.failedAt)}
//                     </div>
//                     <div>
//                       <strong>Reason:</strong> {order.failedReason}
//                     </div>
//                     {order.agentNotes && (
//                       <div>
//                         <strong>Notes:</strong> {order.agentNotes}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         {displayDeliveries.length === 0 && (
//           <div className="adm-empty-state">
//             <h3>No deliveries found</h3>
//             <p>
//               {selectedTab === 0
//                 ? "You don't have any active deliveries assigned."
//                 : selectedTab === 1
//                 ? "No delivery history found."
//                 : "No failed deliveries found."}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Delivery Success Dialog */}
//       {deliveryDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Mark Delivery as Successful</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Confirm that you have successfully delivered to{" "}
//                 {selectedOrder?.customerName}
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">
//                   Delivery Notes (Optional)
//                 </label>
//                 <textarea
//                   className="adm-form-textarea"
//                   value={deliveryNotes}
//                   onChange={(e) => setDeliveryNotes(e.target.value)}
//                   placeholder="Add any notes about the delivery..."
//                   rows={3}
//                 />
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setDeliveryDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-success"
//                 onClick={handleMarkDelivered}
//               >
//                 <FaCheckCircle className="adm-icon" />
//                 Confirm Delivery
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delivery Failure Dialog */}
//       {failureDialogOpen && (
//         <div className="adm-dialog-overlay">
//           <div className="adm-dialog">
//             <div className="adm-dialog-header">
//               <h2 className="adm-dialog-title">Mark Delivery as Failed</h2>
//             </div>
//             <div className="adm-dialog-content">
//               <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
//                 Please provide details about the delivery failure. The delivery
//                 will be automatically rescheduled for tomorrow.
//               </p>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Failure Reason</label>
//                 <select
//                   className="adm-form-select"
//                   value={failureReason}
//                   onChange={(e) => setFailureReason(e.target.value)}
//                 >
//                   <option value="">Select a reason...</option>
//                   <option value="Customer not available">
//                     Customer not available
//                   </option>
//                   <option value="Wrong address">Wrong address</option>
//                   <option value="Customer refused delivery">
//                     Customer refused delivery
//                   </option>
//                   <option value="Safety concerns">Safety concerns</option>
//                   <option value="Vehicle breakdown">Vehicle breakdown</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="adm-form-group">
//                 <label className="adm-form-label">Additional Notes</label>
//                 <textarea
//                   className="adm-form-textarea"
//                   value={failureNotes}
//                   onChange={(e) => setFailureNotes(e.target.value)}
//                   placeholder="Provide more details about the failure..."
//                   rows={3}
//                 />
//               </div>
//             </div>
//             <div className="adm-dialog-footer">
//               <button
//                 className="adm-btn adm-btn-outline"
//                 onClick={() => setFailureDialogOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="adm-btn adm-btn-error"
//                 onClick={handleMarkFailed}
//               >
//                 <FaTimesCircle className="adm-icon" />
//                 Mark as Failed
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Partial Delivery Dialog */}
//       <PartialDeliveryDialog
//         open={partialDialogOpen}
//         onClose={() => {
//           setPartialDialogOpen(false);
//           setOrderForPartial(null);
//         }}
//         order={orderForPartial}
//         onConfirm={handleRecordPartialDelivery}
//       />

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

// // Partial Delivery Dialog Component (unchanged)
// const PartialDeliveryDialog = ({ open, onClose, order, onConfirm }) => {
//   // ... (keep the same implementation as before)
// };

// export default DeliveryAgentPortal;

import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaDirections,
  FaPhone,
  FaMapMarkerAlt,
  FaSync,
  FaShippingFast,
  FaHistory,
  FaExclamationTriangle,
  FaPauseCircle,
  FaPlayCircle,
  FaInfoCircle,
  FaGasPump,
  FaCalendarAlt,
} from "react-icons/fa";
import "./DeliveryAgentPortal.css";
import "./SharedPartialDeliveryStyle.css";

const DeliveryAgentPortal = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [partialDialogOpen, setPartialDialogOpen] = useState(false);
  const [orderForPartial, setOrderForPartial] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [failureNotes, setFailureNotes] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDeliveries();
  }, [selectedTab]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      // Determine delivery status based on selected tab
      let status = "all";
      if (selectedTab === 0)
        status = "assigned,accepted,out_for_delivery,paused"; // Includes paused deliveries
      else if (selectedTab === 1) status = "delivered";
      else if (selectedTab === 2) status = "failed";

      // Fetch deliveries for the logged-in agent
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/agent/my-deliveries?status=${status}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token?.replace(/^"|"$/g, "")}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Enhance deliveries with subscription info
        const enhancedDeliveries = await Promise.all(
          data.data.map(async (delivery) => {
            // Fetch subscription details if available
            if (delivery.subscriptionId) {
              try {
                const subResponse = await fetch(
                  `https://egas-server-1.onrender.com/api/v1/subscriptions/${delivery.subscriptionId._id || delivery.subscriptionId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  },
                );
                const subData = await subResponse.json();
                if (subData.success) {
                  return {
                    ...delivery,
                    subscriptionDetails: subData.data,
                  };
                }
              } catch (error) {
                console.error("Error fetching subscription:", error);
              }
            }
            return delivery;
          }),
        );
        setDeliveries(enhancedDeliveries);
      } else {
        showSnackbar(data.message || "Failed to fetch deliveries", "error");
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      showSnackbar("Error fetching deliveries", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkDeliverySyncStatus = (delivery) => {
    if (!delivery.subscriptionDetails) return { shouldBePaused: false };

    const shouldBePaused =
      delivery.subscriptionDetails.status === "paused" &&
      delivery.status !== "paused" &&
      delivery.status !== "delivered" &&
      delivery.status !== "failed";

    return {
      shouldBePaused,
      subscriptionStatus: delivery.subscriptionDetails.status,
      subscriptionPausedAt: delivery.subscriptionDetails.pausedAt,
    };
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery accepted successfully", "success");
        fetchDeliveries();
      }
    } catch (error) {
      showSnackbar("Error accepting delivery", "error");
    }
  };

  const handleMarkOutForDelivery = async (orderId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderId}/out-for-delivery`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery marked as out for delivery", "success");
        fetchDeliveries();
      }
    } catch (error) {
      showSnackbar("Error updating delivery status", "error");
    }
  };

  const handleMarkDelivered = async () => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/delivered`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ notes: deliveryNotes }),
        },
      );
      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery marked as successful", "success");
        setDeliveryDialogOpen(false);
        setDeliveryNotes("");
        setSelectedOrder(null);
        fetchDeliveries();
      }
    } catch (error) {
      showSnackbar("Error marking delivery", "error");
    }
  };

  const handleMarkFailed = async () => {
    if (!failureReason.trim()) {
      showSnackbar("Please provide a reason for failure", "error");
      return;
    }

    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${selectedOrder._id}/failed`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reason: failureReason,
            notes: failureNotes,
          }),
        },
      );
      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery marked as failed and rescheduled", "success");
        setFailureDialogOpen(false);
        setFailureReason("");
        setFailureNotes("");
        setSelectedOrder(null);
        fetchDeliveries();
      }
    } catch (error) {
      showSnackbar("Error marking delivery as failed", "error");
    }
  };

  const handleRecordPartialDelivery = async (
    deliveredKg,
    remainingKg,
    notes,
  ) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/admin/delivery/${orderForPartial._id}/partial-delivery`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            deliveredKg,
            remainingKg,
            notes,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar("Partial delivery recorded successfully", "success");
        setPartialDialogOpen(false);
        setOrderForPartial(null);
        fetchDeliveries();
      } else {
        showSnackbar(data.message, "error");
      }
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Error recording partial delivery",
        "error",
      );
    }
  };

  const handleSyncWithSubscription = async (deliveryId) => {
    try {
      const response = await fetch(
        `https://egas-server-1.onrender.com/api/v1/deliveries/${deliveryId}/sync-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        showSnackbar("Delivery synced with subscription", "success");
        fetchDeliveries();
      } else {
        showSnackbar(data.message, "error");
      }
    } catch (error) {
      showSnackbar("Error syncing delivery", "error");
    }
  };

  const openDirections = (address) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address,
    )}`;
    window.open(mapsUrl, "_blank");
  };

  const callCustomer = (phone) => {
    window.open(`tel:${phone}`);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ ...snackbar, open: false });
    }, 6000);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      assigned: "adm-status-assigned",
      accepted: "adm-status-accepted",
      out_for_delivery: "adm-status-out_for_delivery",
      delivered: "adm-status-delivered",
      failed: "adm-status-failed",
      paused: "adm-status-paused",
    };
    return `adm-status-chip ${statusMap[status] || "adm-status-assigned"}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTabChange = (newValue) => {
    setSelectedTab(newValue);
  };

  // Filter deliveries for display
  const getFilteredDeliveries = () => {
    if (selectedTab === 0) {
      return deliveries.filter((delivery) =>
        ["assigned", "accepted", "out_for_delivery", "paused"].includes(
          delivery.status,
        ),
      );
    } else if (selectedTab === 1) {
      return deliveries.filter((delivery) => delivery.status === "delivered");
    } else if (selectedTab === 2) {
      return deliveries.filter((delivery) => delivery.status === "failed");
    }
    return deliveries;
  };

  const displayDeliveries = getFilteredDeliveries();

  if (loading) {
    return (
      <div className="adm-agent-portal">
        <div className="adm-loading">
          <div className="adm-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-agent-portal">
      <div className="adm-agent-header">
        <h1 className="adm-agent-title">My Deliveries</h1>

        <div className="adm-tabs">
          <button
            className={`adm-tab ${selectedTab === 0 ? "active" : ""}`}
            onClick={() => handleTabChange(0)}
          >
            <FaShippingFast className="adm-icon" />
            Active Deliveries
            <span className="adm-tab-badge">
              {
                deliveries.filter((d) =>
                  [
                    "assigned",
                    "accepted",
                    "out_for_delivery",
                    "paused",
                  ].includes(d.status),
                ).length
              }
            </span>
          </button>
          <button
            className={`adm-tab ${selectedTab === 1 ? "active" : ""}`}
            onClick={() => handleTabChange(1)}
          >
            <FaHistory className="adm-icon" />
            Delivered
            <span className="adm-tab-badge">
              {deliveries.filter((d) => d.status === "delivered").length}
            </span>
          </button>
          <button
            className={`adm-tab ${selectedTab === 2 ? "active" : ""}`}
            onClick={() => handleTabChange(2)}
          >
            <FaExclamationTriangle className="adm-icon" />
            Failed
            <span className="adm-tab-badge">
              {deliveries.filter((d) => d.status === "failed").length}
            </span>
          </button>
        </div>
      </div>

      <div className="adm-deliveries-grid">
        {displayDeliveries.map((order) => {
          const syncStatus = checkDeliverySyncStatus(order);
          const isPartialDelivered = order.partialDelivery?.isPartial;
          const canRecordPartial =
            !order.partialDeliveryRecorded &&
            !["delivered", "failed", "paused"].includes(order.status);

          return (
            <div
              key={order._id}
              className={`adm-delivery-card ${order.status === "paused" ? "paused" : ""}`}
            >
              {/* Sync Warning Banner */}
              {syncStatus.shouldBePaused && (
                <div className="adm-sync-warning-banner">
                  <FaExclamationTriangle className="adm-icon" />
                  <div className="adm-sync-warning-content">
                    <strong>Subscription Paused</strong>
                    <span>This delivery should be paused</span>
                    {syncStatus.subscriptionPausedAt && (
                      <span className="adm-pause-date">
                        Paused since:{" "}
                        {formatDate(syncStatus.subscriptionPausedAt)}
                      </span>
                    )}
                  </div>
                  <button
                    className="adm-btn adm-btn-sm adm-btn-outline"
                    onClick={() => handleSyncWithSubscription(order._id)}
                  >
                    <FaSync /> Sync
                  </button>
                </div>
              )}

              <div className="adm-card-content">
                <div className="adm-card-header">
                  <div className="adm-customer-info">
                    <div className="adm-customer-name">
                      {order.customerName}
                    </div>

                    <div className="adm-customer-detail">
                      <FaMapMarkerAlt className="adm-icon" />
                      <span>{order.address}</span>
                    </div>

                    <div className="adm-customer-detail">
                      <FaPhone className="adm-icon" />
                      <span>{order.customerPhone}</span>
                    </div>

                    <div className={getStatusClass(order.status)}>
                      {order.status.replace(/_/g, " ").toUpperCase()}
                      {order.status === "paused" && " (Sub Paused)"}
                      {isPartialDelivered && " (Partial)"}
                    </div>

                    <div className="adm-plan-details">
                      <div className="adm-plan-detail">
                        <strong>Plan:</strong> {order.planDetails?.planName} (
                        {order.planDetails?.size})
                      </div>
                      <div className="adm-plan-detail">
                        <strong>Delivery Date:</strong>{" "}
                        {formatDateShort(order.deliveryDate)}
                        {order.originalDeliveryDate && (
                          <div className="adm-original-date">
                            (Originally:{" "}
                            {formatDateShort(order.originalDeliveryDate)})
                          </div>
                        )}
                      </div>

                      {/* Partial Delivery Info */}
                      {isPartialDelivered && (
                        <div className="adm-partial-info">
                          <FaGasPump className="adm-icon-sm" />
                          <span className="adm-delivered-kg">
                            Delivered: {order.deliveredKg}kg
                          </span>
                          <span className="adm-remaining-kg">
                            Remaining: {order.remainingKg}kg added to remnant
                          </span>
                        </div>
                      )}

                      {/* Subscription Status Info */}
                      {order.subscriptionDetails && (
                        <div className="adm-subscription-info">
                          <FaInfoCircle className="adm-icon-sm" />
                          <span
                            className={`adm-subscription-status status-${order.subscriptionDetails.status}`}
                          >
                            Subscription: {order.subscriptionDetails.status}
                          </span>
                        </div>
                      )}

                      {order.retryCount > 0 && (
                        <div className="adm-retry-badge">
                          Retry Attempt: {order.retryCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="adm-action-buttons">
                    {/* Status-based action buttons */}
                    {order.status === "assigned" && (
                      <button
                        className="adm-btn adm-btn-primary"
                        onClick={() => handleAcceptDelivery(order._id)}
                      >
                        Accept Delivery
                      </button>
                    )}

                    {order.status === "accepted" && (
                      <button
                        className="adm-btn adm-btn-warning"
                        onClick={() => handleMarkOutForDelivery(order._id)}
                      >
                        Start Delivery
                      </button>
                    )}

                    {["accepted", "out_for_delivery"].includes(
                      order.status,
                    ) && (
                      <div className="adm-btn-group">
                        {/* Delivered Button - only show if not already delivered */}
                        {order.status !== "delivered" && (
                          <button
                            className="adm-btn adm-btn-success adm-btn-small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDeliveryDialogOpen(true);
                            }}
                            disabled={order.customerConfirmation?.confirmed}
                            title={
                              order.customerConfirmation?.confirmed
                                ? "Already confirmed by customer"
                                : ""
                            }
                          >
                            <FaCheckCircle className="adm-icon" />
                            Delivered
                          </button>
                        )}

                        {/* Show confirmation status if needed */}
                        {order.status === "delivered" &&
                          !order.customerConfirmation?.confirmed && (
                            <span className="adm-pending-confirmation">
                              <FaExclamationTriangle /> Pending Customer
                              Confirmation
                            </span>
                          )}

                        {/* Partial Delivery Button - only if not already recorded and not delivered */}
                        {canRecordPartial && order.status !== "paused" && (
                          <button
                            className="adm-btn adm-btn-warning adm-btn-small"
                            onClick={() => {
                              setOrderForPartial(order);
                              setPartialDialogOpen(true);
                            }}
                            disabled={!canRecordPartial}
                          >
                            <FaExclamationTriangle className="adm-icon" />
                            Partial
                          </button>
                        )}

                        {/* Failed Button - always available for active deliveries */}
                        <button
                          className="adm-btn adm-btn-error adm-btn-small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setFailureDialogOpen(true);
                          }}
                        >
                          <FaTimesCircle className="adm-icon" />
                          Failed
                        </button>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="adm-navigation-buttons">
                      <button
                        className="adm-btn adm-btn-outline adm-btn-small"
                        onClick={() => openDirections(order.address)}
                      >
                        <FaDirections className="adm-icon" />
                        Directions
                      </button>

                      <button
                        className="adm-btn adm-btn-outline adm-btn-small"
                        onClick={() => callCustomer(order.customerPhone)}
                      >
                        <FaPhone className="adm-icon" />
                        Call
                      </button>
                    </div>

                    {/* Sync Button for paused deliveries */}
                    {order.status === "paused" &&
                      order.subscriptionDetails?.status === "active" && (
                        <button
                          className="adm-btn adm-btn-success adm-btn-small"
                          onClick={() => handleSyncWithSubscription(order._id)}
                          title="Sync with subscription status"
                        >
                          <FaPlayCircle className="adm-icon" />
                          Resume
                        </button>
                      )}
                  </div>
                </div>

                {/* Paused Delivery Info */}
                {order.status === "paused" && (
                  <div className="adm-paused-info">
                    <FaPauseCircle className="adm-icon" />
                    <div>
                      <strong>Delivery Paused</strong>
                      {order.pausedAt && (
                        <div>Paused on: {formatDate(order.pausedAt)}</div>
                      )}
                      {order.originalDeliveryDate && (
                        <div>
                          Original date:{" "}
                          {formatDateShort(order.originalDeliveryDate)}
                        </div>
                      )}
                      {order.subscriptionDetails?.pausedAt && (
                        <div>
                          Subscription paused:{" "}
                          {formatDateShort(order.subscriptionDetails.pausedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Partial Delivery Details */}
                {isPartialDelivered && (
                  <div className="adm-partial-details">
                    <FaGasPump className="adm-icon" />
                    <div>
                      <strong>Partial Delivery Recorded</strong>
                      <div className="adm-partial-breakdown">
                        <span>Delivered: {order.deliveredKg}kg</span>
                        <span>
                          Remaining: {order.remainingKg}kg added to customer
                          remnant
                        </span>
                        <span>
                          Recorded by agent on:{" "}
                          {formatDate(order.partialDelivery?.recordedAt)}
                        </span>
                      </div>
                      <div className="adm-remnant-note">
                        Customer needs to confirm remnant entry before
                        requesting delivery
                      </div>
                    </div>
                  </div>
                )}

                {order.status === "delivered" &&
                  order.deliveredAt &&
                  !isPartialDelivered && (
                    <div className="adm-delivery-status adm-status-success">
                      <div>
                        <strong>Delivered on:</strong>{" "}
                        {formatDate(order.deliveredAt)}
                      </div>
                      {order.agentNotes && (
                        <div>
                          <strong>Notes:</strong> {order.agentNotes}
                        </div>
                      )}
                    </div>
                  )}

                {order.status === "failed" && order.failedAt && (
                  <div className="adm-delivery-status adm-status-failed">
                    <div>
                      <strong>Failed on:</strong> {formatDate(order.failedAt)}
                    </div>
                    <div>
                      <strong>Reason:</strong> {order.failedReason}
                    </div>
                    {order.agentNotes && (
                      <div>
                        <strong>Notes:</strong> {order.agentNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayDeliveries.length === 0 && (
          <div className="adm-empty-state">
            <h3>No deliveries found</h3>
            <p>
              {selectedTab === 0
                ? "You don't have any active deliveries assigned."
                : selectedTab === 1
                  ? "No delivered orders found."
                  : "No failed deliveries found."}
            </p>
          </div>
        )}
      </div>

      {/* Delivery Success Dialog */}
      {deliveryDialogOpen && (
        <div className="adm-dialog-overlay">
          <div className="adm-dialog">
            <div className="adm-dialog-header">
              <h2 className="adm-dialog-title">Mark Delivery as Successful</h2>
            </div>
            <div className="adm-dialog-content">
              <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
                Confirm that you have successfully delivered to{" "}
                {selectedOrder?.customerName}
              </p>
              <div className="adm-form-group">
                <label className="adm-form-label">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  className="adm-form-textarea"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Add any notes about the delivery..."
                  rows={3}
                />
              </div>
            </div>
            <div className="adm-dialog-footer">
              <button
                className="adm-btn adm-btn-outline"
                onClick={() => setDeliveryDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="adm-btn adm-btn-success"
                onClick={handleMarkDelivered}
              >
                <FaCheckCircle className="adm-icon" />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Failure Dialog */}
      {failureDialogOpen && (
        <div className="adm-dialog-overlay">
          <div className="adm-dialog">
            <div className="adm-dialog-header">
              <h2 className="adm-dialog-title">Mark Delivery as Failed</h2>
            </div>
            <div className="adm-dialog-content">
              <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
                Please provide details about the delivery failure. The delivery
                will be automatically rescheduled for tomorrow.
              </p>
              <div className="adm-form-group">
                <label className="adm-form-label">Failure Reason</label>
                <select
                  className="adm-form-select"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Customer not available">
                    Customer not available
                  </option>
                  <option value="Wrong address">Wrong address</option>
                  <option value="Customer refused delivery">
                    Customer refused delivery
                  </option>
                  <option value="Safety concerns">Safety concerns</option>
                  <option value="Vehicle breakdown">Vehicle breakdown</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Additional Notes</label>
                <textarea
                  className="adm-form-textarea"
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  placeholder="Provide more details about the failure..."
                  rows={3}
                />
              </div>
            </div>
            <div className="adm-dialog-footer">
              <button
                className="adm-btn adm-btn-outline"
                onClick={() => setFailureDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="adm-btn adm-btn-error"
                onClick={handleMarkFailed}
              >
                <FaTimesCircle className="adm-icon" />
                Mark as Failed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial Delivery Dialog */}
      <PartialDeliveryDialog
        open={partialDialogOpen}
        onClose={() => {
          setPartialDialogOpen(false);
          setOrderForPartial(null);
        }}
        order={orderForPartial}
        onConfirm={handleRecordPartialDelivery}
      />

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

// Partial Delivery Dialog Component
const PartialDeliveryDialog = ({ open, onClose, order, onConfirm }) => {
  const [deliveredKg, setDeliveredKg] = useState("");
  const [remainingKg, setRemainingKg] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [canRecordPartial, setCanRecordPartial] = useState(true);

  const expectedKg = order?.planDetails?.size
    ? parseFloat(order.planDetails.size.split("kg")[0])
    : 0;

  useEffect(() => {
    if (open && order) {
      setDeliveredKg("");
      setRemainingKg("");
      setNotes("");
      setError("");

      // Check if partial delivery already recorded
      if (order.partialDeliveryRecorded) {
        setCanRecordPartial(false);
        setError("Partial delivery already recorded for this schedule");
      } else {
        setCanRecordPartial(true);
      }
    }
  }, [open, order]);

  const handleSubmit = () => {
    if (!canRecordPartial) {
      setError("Partial delivery already recorded for this schedule");
      return;
    }

    const delivered = parseFloat(deliveredKg);
    const remaining = parseFloat(remainingKg);

    if (!deliveredKg || !remainingKg) {
      setError("Both fields are required");
      return;
    }

    if (isNaN(delivered) || isNaN(remaining)) {
      setError("Please enter valid numbers");
      return;
    }

    if (Math.abs(delivered + remaining - expectedKg) > 0.01) {
      setError(`Total must equal ${expectedKg}kg`);
      return;
    }

    onConfirm(Number(deliveredKg), Number(remainingKg), notes);
  };

  if (!open) return null;

  return (
    <div className="adm-dialog-overlay">
      <div className="adm-dialog">
        <div className="adm-dialog-header">
          <h2 className="adm-dialog-title">Record Partial Delivery</h2>
        </div>
        <div className="adm-dialog-content">
          {!canRecordPartial ? (
            <div className="adm-alert adm-alert-error">
              <FaExclamationTriangle className="adm-icon" />
              <div>
                <strong>Partial Delivery Already Recorded</strong>
                <p>
                  This delivery schedule already has a partial delivery
                  recorded.
                </p>
                <p>
                  Status: <strong>Delivered (Partial)</strong>
                </p>
                {order.partialDelivery && (
                  <div className="adm-existing-partial">
                    <p>Delivered: {order.partialDelivery.delivered}kg</p>
                    <p>
                      Remaining: {order.partialDelivery.remaining}kg added to
                      remnant
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="adm-order-info">
                <p>
                  <strong>Customer:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Plan:</strong> {order.planDetails.planName} (
                  {order.planDetails.size})
                </p>
                <p>
                  <strong>Expected Total:</strong> {expectedKg}kg
                </p>
              </div>

              {error && (
                <div className="adm-alert adm-alert-error">{error}</div>
              )}

              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label className="adm-form-label">
                    Delivered Amount (kg)
                  </label>
                  <input
                    type="number"
                    className="adm-form-input"
                    value={deliveredKg}
                    onChange={(e) => {
                      setDeliveredKg(e.target.value);
                      if (expectedKg && e.target.value) {
                        const remaining =
                          expectedKg - parseFloat(e.target.value);
                        setRemainingKg(remaining.toFixed(1));
                      }
                    }}
                    min="0"
                    max={expectedKg}
                    step="0.5"
                    placeholder="0"
                  />
                  <div className="adm-input-hint">
                    Amount actually delivered to customer
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">
                    Remaining Amount (kg)
                  </label>
                  <input
                    type="number"
                    className="adm-form-input"
                    value={remainingKg}
                    onChange={(e) => {
                      setRemainingKg(e.target.value);
                      if (expectedKg && e.target.value) {
                        const delivered =
                          expectedKg - parseFloat(e.target.value);
                        setDeliveredKg(delivered.toFixed(1));
                      }
                    }}
                    min="0"
                    max={expectedKg}
                    step="0.5"
                    placeholder="0"
                  />
                  <div className="adm-input-hint">
                    Will be added to customer's remnant balance
                  </div>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  className="adm-form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why partial delivery was needed..."
                  rows={3}
                />
              </div>

              <div className="adm-info-box">
                <h4>Important Notes:</h4>
                <ul>
                  <li>
                    This delivery will be immediately marked as{" "}
                    <strong>"Delivered"</strong>
                  </li>
                  <li>
                    Remaining {remainingKg || "..."}kg will be added to
                    customer's remnant balance
                  </li>
                  <li>
                    Customer must confirm the remnant entry in their dashboard
                  </li>
                  <li>
                    You cannot record another partial delivery for this schedule
                  </li>
                  <li>
                    Customer can request delivery when they accumulate minimum
                    6kg
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
        <div className="adm-dialog-footer">
          <button className="adm-btn adm-btn-outline" onClick={onClose}>
            {canRecordPartial ? "Cancel" : "Close"}
          </button>
          {canRecordPartial && (
            <button
              className="adm-btn adm-btn-warning"
              onClick={handleSubmit}
              disabled={!deliveredKg || !remainingKg}
            >
              <FaExclamationTriangle className="adm-icon" />
              Record Partial Delivery
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentPortal;
