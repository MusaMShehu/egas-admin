// // hooks/usePermissions.js
// import { useAuth } from '../contexts/AuthContext';

// // Enhanced permissions configuration with more roles and permissions
// const permissionsConfig = {
//   'super-admin': [
//     'subscriptions:read',
//     'subscriptions:create',
//     'subscriptions:update',
//     'subscriptions:delete',
//     'subscriptions:bulk',
//     'subscriptions:analytics',
//     'subscriptions:export',
//     'subscriptions:manage',
//     'users:read',
//     'users:create',
//     'users:update',
//     'users:delete',
//     'users:manage',
//     'settings:read',
//     'settings:update',
//     'system:admin'
//   ],
//   'admin': [
//     'subscriptions:read',
//     'subscriptions:create',
//     'subscriptions:update',
//     'subscriptions:delete',
//     'subscriptions:bulk',
//     'subscriptions:analytics',
//     'subscriptions:export',
//     'subscriptions:manage',
//     'users:read',
//     'users:create',
//     'users:update',
//     'settings:read'
//   ],
//   'manager': [
//     'subscriptions:read',
//     'subscriptions:create',
//     'subscriptions:update',
//     'subscriptions:analytics',
//     'subscriptions:export',
//     'users:read'
//   ],
//   'operator': [
//     'subscriptions:read',
//     'subscriptions:update',
//     'subscriptions:create'
//   ],
//   'viewer': [
//     'subscriptions:read',
//     'users:read'
//   ],
//   'customer': [
//     'subscriptions:read:own',
//     'subscriptions:create:own',
//     'subscriptions:update:own'
//   ]
// };

// export const usePermissions = () => {
//   // ✅ Use your existing Auth hook directly
//   const { user } = useAuth();

//   const hasPermission = (permission) => {
//     if (!user?.role) {
//       console.warn('usePermissions: No user or role found');
//       return false;
//     }
//     const perms = permissionsConfig[user.role] || [];
//     return perms.includes(permission);
//   };

//   const hasAnyPermission = (perms) => perms?.some(hasPermission);
//   const hasAllPermissions = (perms) => perms?.every(hasPermission);
//   const canPerformAction = (action, resource) => hasPermission(`${resource}:${action}`);
//   const canAccessOwn = (resource) =>
//     hasPermission(`${resource}:read:own`) || hasPermission(`${resource}:read`);
//   const getAvailablePermissions = () => permissionsConfig[user?.role] || [];

//   return {
//     hasPermission,
//     hasAnyPermission,
//     hasAllPermissions,
//     canPerformAction,
//     canAccessOwn,
//     getAvailablePermissions,
//     userRole: user?.role,
//     isSuperAdmin: user?.role === 'super-admin',
//     isAdmin: ['admin', 'super-admin'].includes(user?.role),
//     isManager: ['manager', 'admin', 'super-admin'].includes(user?.role),
//     isOperator: ['operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
//     isViewer: ['viewer', 'operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
//     isCustomer: user?.role === 'customer',
//     currentUser: user,
//   };
// };

// export default usePermissions;

























// src/hooks/usePermissions.js
import { useAuth } from '../contexts/AuthContext';

const permissionsConfig = {
  'super-admin': [
    'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:delete',
    'subscriptions:bulk', 'subscriptions:analytics', 'subscriptions:export', 'subscriptions:manage',
    'users:read', 'users:create', 'users:update', 'users:delete', 'users:manage',
    'orders:read', 'orders:update', 'orders:delete', 'orders:bulk',
    'deliveries:read', 'deliveries:create', 'deliveries:update', 'deliveries:delete',
    'products:read', 'products:create', 'products:update', 'products:delete',
    'reports:read', 'reports:create', 'reports:export',
    'settings:read', 'settings:update',
    'system:admin',
  ],
  admin: [
    'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:delete',
    'subscriptions:bulk', 'subscriptions:analytics', 'subscriptions:export', 'subscriptions:manage',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'orders:read', 'orders:update',
    'deliveries:read', 'deliveries:create', 'deliveries:update',
    'products:read', 'products:create', 'products:update',
    'reports:read', 'reports:export',
    'settings:read',
  ],
  manager: [
    'subscriptions:read', 'subscriptions:create', 'subscriptions:update', 'subscriptions:analytics',
    'users:read',
    'orders:read', 'orders:update',
    'deliveries:read', 'deliveries:create',
    'products:read',
    'reports:read',
  ],
  operator: [
    'subscriptions:read', 'subscriptions:update',
    'orders:read', 'orders:update',
    'deliveries:read', 'deliveries:update',
  ],
  viewer: [
    'subscriptions:read',
    'users:read',
    'orders:read',
    'deliveries:read',
    'products:read',
  ],
  delivery: [
    'deliveries:read', 'deliveries:update',
  ],
  support: [
    'subscriptions:read',
    'orders:read',
    'users:read',
  ],
};

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user?.role) return false;
    const perms = permissionsConfig[user.role] || [];
    return perms.includes(permission);
  };

  const hasAnyPermission = (perms) => perms?.some(hasPermission);
  const hasAllPermissions = (perms) => perms?.every(hasPermission);
  const canPerformAction = (action, resource) => hasPermission(`${resource}:${action}`);

  const getAvailablePermissions = () => permissionsConfig[user?.role] || [];

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    getAvailablePermissions,
    userRole: user?.role,
    isSuperAdmin: user?.role === 'super-admin',
    isAdmin: ['admin', 'super-admin'].includes(user?.role),
    isManager: ['manager', 'admin', 'super-admin'].includes(user?.role),
    isOperator: ['operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
    isViewer: ['viewer', 'operator', 'manager', 'admin', 'super-admin'].includes(user?.role),
    currentUser: user,
  };
};

export default usePermissions;