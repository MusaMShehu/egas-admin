// src/components/layout/DeliveryLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTruck, FaSync, FaRecycle, FaBell } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

const TABS = [
  { to: '/delivery/dashboard', label: 'Deliveries', icon: <FaTruck /> },
  { to: '/delivery/refills',   label: 'Refills',    icon: <FaSync /> },
  { to: '/delivery/remnant',   label: 'Remnant',    icon: <FaRecycle /> },
  { to: '/delivery/notifications', label: 'Notifications', icon: <FaBell /> },
];

const DeliveryLayout = () => {
  return (
    <div className="delivery-layout">
      <header className="delivery-topbar">
        <div className="delivery-topbar__brand">
          <span className="delivery-topbar__logo">
            <FaTruck /> <span>e-GAS Agent</span>
          </span>
        </div>

        <nav className="delivery-topbar__tabs">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `delivery-tab ${isActive ? 'delivery-tab--active' : ''}`
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="delivery-topbar__actions">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      <main className="delivery-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;