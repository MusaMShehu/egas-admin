// src/components/layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FaBars, FaSearch } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

/**
 * AdminLayout — the admin shell.
 *
 * Desktop: fixed left sidebar + content area with topbar.
 * Mobile:  drawer sidebar + topbar with hamburger.
 *
 * Persists collapsed state across page reloads via localStorage.
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('admin.sidebar.collapsed') === 'true'; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try { localStorage.setItem('admin.sidebar.collapsed', String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className="admin-sidebar-overlay"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <FaBars />
          </button>

          <div className="admin-topbar__spacer" />

          <NotificationBell />
          <UserMenu collapsed={false} />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;