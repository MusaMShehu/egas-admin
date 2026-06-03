// src/components/common/RoleBasedAccess.jsx
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

const RoleBasedAccess = ({
  permission,
  permissions, // Array of permissions (any one required)
  allPermissions, // Array of permissions (all required)
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = hasAnyPermission(permissions);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  } else {
    // Default to true for backward compatibility
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default RoleBasedAccess;