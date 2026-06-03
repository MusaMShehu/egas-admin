// // components/Navbar.js
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import "./Admin.css"; 
// import AccountSection from "../headers/AccountSection";

// const Navbar = () => {
//   const location = useLocation();

//   const menuItems = [
//     { path: "/admin/overview", name: "Dashboard", icon: "fas fa-tachometer-alt" },
//     { path: "/admin/users", name: "Users", icon: "fas fa-users" },
//     { path: "/admin/orders", name: "Orders", icon: "fas fa-truck" },
//     { path: "/admin/products", name: "Products", icon: "fas fa-boxes" },
//     { path: "/admin/subscriptions", name: "Subscriptions", icon: "fas fa-calendar-check" },
//     { path: "/admin/reports", name: "Reports", icon: "fas fa-chart-line" },
//     { path: "/admin/support", name: "Support", icon: "fas fa-headset" },
//     { path: "/admin/deliveries", name: "Delivery", icon: "fas fa-shipping-fast" },
//     { path: "/admin/settings", name: "Settings", icon: "fas fa-cog" },
//   ];

//   return (
//     <nav className="navbar">
//       <div className="navbar-brand">
//         <i className="fas fa-fire logo-icon"></i>
//         <h1 className="logo-text">e-GAS Admin</h1>
//       </div>
//       <div className="navbar-nav">
//         {menuItems.map((item) => (
//           <Link
//             key={item.path}
//             to={item.path}
//             className={`nav-link ${
//               location.pathname === item.path ? "active" : ""
//             }`}
//           >
//             <i className={`${item.icon} nav-icon`}></i> 
//             <span className="nav-text">{item.name}</span>
//           </Link>
          
//         ))}
//         {/* <AccountSection/> */}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

























// src/components/admin/AdminNavbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaTruck, 
  FaBoxes, 
  FaCalendarCheck, 
  FaChartLine, 
  FaHeadset, 
  FaShippingFast, 
  FaCog,
  FaBars,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import './Admin.css';

const AdminNavbar = ({ onLogout, user, sidebarCollapsed, onToggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/overview", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admin/users", name: "Users", icon: <FaUsers /> },
    // { path: "/admin/orders", name: "Orders", icon: <FaTruck /> },
    { path: "/admin/products", name: "Products", icon: <FaBoxes /> },
    { path: "/admin/subscriptions", name: "Subscriptions", icon: <FaCalendarCheck /> },
    { path: "/admin/deliveries", name: "Delivery", icon: <FaShippingFast /> },
     { path: "/admin/support", name: "Support", icon: <FaHeadset /> },
    { path: "/admin/reports", name: "Reports", icon: <FaChartLine /> },
    { path: "/admin/settings", name: "Settings", icon: <FaCog /> },
  ];

  return (
    <nav className={`navbar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="navbar-brand">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        {!sidebarCollapsed && <h1 className="logo-text">e-GAS Admin</h1>}
      </div>
      
      <div className="navbar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!sidebarCollapsed && <span className="nav-text">{item.name}</span>}
          </Link>
        ))}
      </div>

      <div className="navbar-footer">
        <div className="user-info">
          <FaUserCircle className="user-avatar" />
          {!sidebarCollapsed && (
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          )}
        </div>
        <button onClick={onLogout} className="logout-btn">
          <FaSignOutAlt />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;