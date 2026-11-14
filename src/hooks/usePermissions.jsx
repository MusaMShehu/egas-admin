// // src/hooks/usePermissions.js
// import { useAuth } from '../contexts/AuthContext';

// const permissionsConfig = {
//   'super-admin': [
//     'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:delete',
//     'subscriptions:bulk', 'subscriptions:analytics', 'subscriptions:export', 'subscriptions:manage',
//     'users:read', 'users:create', 'users:update', 'users:delete', 'users:manage',
//     'orders:read', 'orders:update', 'orders:delete', 'orders:bulk',
//     'deliveries:read', 'deliveries:create', 'deliveries:update', 'deliveries:delete',
//     'products:read', 'products:create', 'products:update', 'products:delete',
//     'reports:read', 'reports:create', 'reports:export',
//     'settings:read', 'settings:update',
//     'system:admin',
//   ],
//   admin: [
//     'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:delete',
//     'subscriptions:bulk', 'subscriptions:analytics', 'subscriptions:export', 'subscriptions:manage',
//     'users:read', 'users:create', 'users:update', 'users:delete',
//     'orders:read', 'orders:update',
//     'deliveries:read', 'deliveries:create', 'deliveries:update',
//     'products:read', 'products:create', 'products:update',
//     'reports:read', 'reports:export',
//     'settings:read',
//   ],
//   manager: [
//     'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:analytics',
//     'users:read',
//     'orders:read', 'orders:update',
//     'deliveries:read', 'deliveries:create',
//     'products:read',
//     'reports:read',
//   ],
//   operator: [
//     'subscriptions:read', 'subscriptions:update',
//     'orders:read', 'orders:update',
//     'deliveries:read', 'deliveries:update',
//   ],
//   viewer: [
//     'subscriptions:read',
//     'users:read',
//     'orders:read',
//     'deliveries:read',
//     'products:read',
//   ],
//   delivery: [
//     'deliveries:read', 'deliveries:update',
//   ],
//   support: [
//     'subscriptions:read',
//     'orders:read',
//     'users:read',
//   ],
// };

// export const usePermissions = () => {
//   const { user } = useAuth();

//   const hasPermission = (permission) => {
//     if (!user?.role) return false;
//     const perms = permissionsConfig[user.role] || [];
//     return perms.includes(permission);
//   };

//   const hasAnyPermission = (perms) => perms?.some(hasPermission);
//   const hasAllPermissions = (perms) => perms?.every(hasPermission);
//   const canPerformAction = (action, resource) => hasPermission(`${resource}:${action}`);

//   const getAvailablePermissions = () => permissionsConfig[user?.role] || [];

//   return {
//     hasPermission,
//     hasAnyPermission,
//     hasAllPermissions,
//     canPerformAction,
//     getAvailablePermissions,
//     userRole: user?.role,
//     isSuperAdmin: user?.role === 'super-admin',
//     isAdmin: ['admin', 'super-admin'].includes(user?.role),
//     isManager: ['manager', 'admin', 'super-admin'].includes(user?.role),
//     isOperator: ['operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
//     isViewer: ['viewer', 'operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
//     currentUser: user,
//   };
// };

// export default usePermissions;























// src/hooks/usePermissions.js
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPermissionsForRole,
  normalizeRole,
  isAdminRole,
  isPlantRole,
  isDeliveryRole,
} from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const perms = useMemo(() => getPermissionsForRole(role), [role]);

  const hasPermission = (key) => perms.has(key);
  const hasAnyPermission = (keys = []) => keys.some((k) => perms.has(k));
  const hasAllPermissions = (keys = []) => keys.every((k) => perms.has(k));

  const isSuperAdmin = role === 'super-admin';
  const isAdmin = isAdminRole(role);
  const isCustomerCare = role === 'customer_care';
  const isDelivery = isDeliveryRole(role);
  const isPlantUser = isPlantRole(role);
  const isCustomer = role === 'user';

  return {
    user,
    userRole: role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
    isCustomerCare,
    isDelivery,
    isPlantUser,
    isCustomer,
    permissionsList: Array.from(perms),
  };
};

export default usePermissions;