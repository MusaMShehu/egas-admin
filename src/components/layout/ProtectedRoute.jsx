// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeRole, getHomeRouteForRole, isAdminRole } from '../../utils/permissions';
import SkeletonLoader from '../ui/SkeletonLoader';

/**
 * ProtectedRoute — route guard.
 *
 * Props:
 *   allowedRoles  — optional array of normalized roles; if set, role must be in it
 *   requiredPerms — optional array of permission keys (checked against user role map)
 *   anyPerm       — optional array; user needs at least one
 */
const ProtectedRoute = ({ allowedRoles, requiredPerms, anyPerm }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const role = normalizeRole(user?.role);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--sp-10)' }}>
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Permissions shortcut: import lazily to avoid circular imports
  if (requiredPerms || anyPerm) {
    // eslint-disable-next-line global-require
    const { getPermissionsForRole } = require('../../utils/permissions');
    const perms = getPermissionsForRole(role);
    if (Array.isArray(requiredPerms) && requiredPerms.some((p) => !perms.has(p))) {
      return <Navigate to="/unauthorized" replace />;
    }
    if (Array.isArray(anyPerm) && !anyPerm.some((p) => perms.has(p))) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

/**
 * HomeRedirect — after login, send the user to the right home page based on role.
 * Rendered at `/` and `/dashboard`.
 */
export const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--sp-10)' }}>
        <SkeletonLoader lines={6} />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = normalizeRole(user?.role);
  // customer_care and admin both land in admin portal
  if (isAdminRole(role) || role === 'customer_care') {
    return <Navigate to="/admin/overview" replace />;
  }
  if (role === 'delivery') return <Navigate to="/delivery/dashboard" replace />;
  if (role.startsWith('plant_')) return <Navigate to="/plant/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export default ProtectedRoute;