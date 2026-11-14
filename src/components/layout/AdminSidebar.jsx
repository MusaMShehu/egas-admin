// src/components/layout/AdminSidebar.jsx
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaCalendarCheck, FaTruck, FaSync,
  FaBox, FaRecycle, FaExclamationTriangle, FaMoneyCheckAlt,
  FaIndustry, FaBoxOpen, FaLayerGroup, FaHeadset, FaChartLine,
  FaCog, FaSlidersH, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Admin nav. RBAC-gated. Each item declares which permission is required.
 * Sidebar auto-collapses to icons on mobile.
 */
const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { to: '/admin/overview', label: 'Overview', icon: <FaTachometerAlt />, perm: 'users:read' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/users',          label: 'Users',         icon: <FaUsers />,           perm: 'users:read' },
      { to: '/admin/subscriptions',  label: 'Subscriptions', icon: <FaCalendarCheck />,   perm: 'subscriptions:read' },
      { to: '/admin/deliveries',     label: 'Deliveries',    icon: <FaTruck />,           perm: 'deliveries:read' },
      { to: '/admin/refills',        label: 'Refills',       icon: <FaSync />,            perm: 'refills:read' },
      { to: '/admin/cylinders',      label: 'Cylinders',     icon: <FaBox />,             perm: 'cylinders:read' },
      { to: '/admin/remnant-ledger', label: 'Remnant',       icon: <FaRecycle />,         perm: 'remnant:read' },
      { to: '/admin/disputes',       label: 'Disputes',      icon: <FaExclamationTriangle />, perm: 'disputes:read' },
      { to: '/admin/settlements',    label: 'Settlements',   icon: <FaMoneyCheckAlt />,   perm: 'settlements:read' },
      { to: '/admin/plants',         label: 'Plants',        icon: <FaIndustry />,        perm: 'plants:read' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: <FaBoxOpen />,    perm: 'products:read' },
      { to: '/admin/plans',    label: 'Plans',    icon: <FaCalendarCheck />, perm: 'plans:read' },
    ],
  },
  {
    title: 'Service',
    items: [
      { to: '/admin/support', label: 'Support', icon: <FaHeadset />,  perm: 'support:read' },
      { to: '/admin/reports', label: 'Reports', icon: <FaChartLine />, perm: 'reports:read' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: <FaCog />,       perm: 'settings:read' },
      { to: '/admin/config',   label: 'Config',   icon: <FaSlidersH />,  perm: 'config:read' },
    ],
  },
];

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { hasPermission } = usePermissions();

  const visibleSections = useMemo(() => {
    return NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasPermission(item.perm)),
      }))
      .filter((section) => section.items.length > 0);
  }, [hasPermission]);

  return (
    <aside
      className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''} ${mobileOpen ? 'admin-sidebar--mobile-open' : ''}`}
    >
      <div className="admin-sidebar__brand">
        {!collapsed && (
          <span className="admin-sidebar__brand-name">
            <FaBoxOpen /> <span>e-GAS Admin</span>
          </span>
        )}
        {collapsed && (
          <span className="admin-sidebar__brand-name admin-sidebar__brand-name--collapsed">
            <FaBoxOpen />
          </span>
        )}
      </div>

      <nav className="admin-sidebar__nav">
        {visibleSections.map((section, sIdx) => (
          <div key={sIdx} className="admin-sidebar__section">
            {section.title && !collapsed && (
              <h4 className="admin-sidebar__section-title">{section.title}</h4>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`
                }
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
              >
                <span className="admin-sidebar__item-icon">{item.icon}</span>
                {!collapsed && <span className="admin-sidebar__item-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;