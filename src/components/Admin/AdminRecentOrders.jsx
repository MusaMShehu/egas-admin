// // components/RecentOrders.js
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import "./Admin.css";

// const RecentOrders = () => {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await fetch("https://egas-server-1.onrender.com/api/v1/admin/dashboard");
//       const data = await response.json();
//       setOrders(data.recentOrders || [] );
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <div className="recent-orders">
//       <div className="recent-orders-header">
//         <h2>Recent Orders</h2>
//         <Link to="/orders" className="view-all">
//           View All Orders
//         </Link>
//       </div>

//       <div className="recent-orders-table-wrapper">
//         <table className="recent-orders-table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Customer</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Amount</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="loading">
//                   <span className="spinner"></span>
//                   <span className="loading-text">Loading orders...</span>
//                 </td>
//               </tr>
//             ) : (
//               orders.map((order) => (
//                 <tr key={order.id}>
//                   <td>#{order.id}</td>
//                   <td>{order.customer}</td>
//                   <td>{formatDate(order.date)}</td>
//                   <td>
//                     <span className={`status ${order.status.toLowerCase()}`}>
//                       {order.status}
//                     </span>
//                   </td>
//                   <td>₦{order.amount.toLocaleString()}</td>
//                   <td className="action">
//                     <Link to={`/orders?order=${order.id}`}>View</Link>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RecentOrders;

// src/components/admin/AdminRecentOrders.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../api/endpoints";
import { useSnackbar } from "../../hooks/useSnackbar";
import "./Admin.css";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { error: showError } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use the dashboard overview endpoint which includes recent orders
      const response = await adminAPI.dashboard.getOverview();

      if (response.data.success) {
        const data = response.data || response;
        setOrders(data.recentOrders || data.stats?.recentOrders || []);
      } else {
        showError(response.message || "Failed to fetch recent orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Failed to load recent orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="recent-orders">
        <div className="recent-orders-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all">
            View All Orders
          </Link>
        </div>
        <div className="recent-orders-table-wrapper">
          <div className="loading-state">
            <span className="spinner"></span>
            <span className="loading-text">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-orders">
      <div className="recent-orders-header">
        <h2>Recent Orders</h2>
        <Link to="/admin/orders" className="view-all">
          View All Orders
        </Link>
      </div>

      <div className="recent-orders-table-wrapper">
        <table className="recent-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <span>No recent orders found</span>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id || order.id}>
                  <td>#{order.orderId || order.id}</td>
                  {/* <td>{order.user?.firstName} {order.user?.lastName} || order.customer}</td> */}
                  <td>
                    {order.user?.firstName || order.user?.lastName
                      ? `${order.user?.firstName || ""} ${order.user?.lastName || ""}`
                      : order.customer || "Unknown Customer"}
                  </td>
                  <td>{formatDate(order.createdAt || order.date)}</td>
                  <td>
                    <span
                      className={`status ${(order.orderStatus || order.status || "pending").toLowerCase()}`}
                    >
                      {order.orderStatus || order.status || "Pending"}
                    </span>
                  </td>
                  <td>{formatCurrency(order.totalAmount || order.amount)}</td>
                  <td className="action">
                    <Link to={`/admin/orders?order=${order._id || order.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RecentOrders;
