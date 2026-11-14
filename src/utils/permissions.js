// src/utils/permissions.js
/**
 * RBAC — single source of truth.
 *
 * Every permission check across the app goes through this map.
 * Backend roles are normalized to canonical form:
 *   superadmin / super-admin  →  'super-admin'
 */

// ============================================================
// ROLE NORMALIZATION
// ============================================================
export const normalizeRole = (raw) => {
  if (!raw) return 'user';
  const r = String(raw).toLowerCase().trim();
  if (r === 'superadmin' || r === 'super-admin') return 'super-admin';
  return r;
};

// ============================================================
// PERMISSION CATALOG
// ============================================================
// Keep these aligned with backend capabilities.
// Namespace:* — 'read' is always implied by other actions.
export const PERMISSIONS = {
  // Users
  'users:read':             'View users',
  'users:create':           'Create users',
  'users:update':           'Edit users',
  'users:delete':           'Delete users',
  'users:toggle':           'Activate/deactivate users',
  'users:wallet':           'Adjust user wallets',
  'users:bulk':             'Bulk user operations',
  'users:import':           'Import users',
  'users:export':           'Export users',

  // Subscriptions
  'subscriptions:read':     'View subscriptions',
  'subscriptions:create':   'Create subscriptions',
  'subscriptions:update':   'Edit subscriptions',
  'subscriptions:delete':   'Delete subscriptions',
  'subscriptions:pause':    'Pause/resume subscriptions',
  'subscriptions:cancel':   'Cancel subscriptions',
  'subscriptions:bulk':     'Bulk subscription operations',
  'subscriptions:analytics':'View subscription analytics',
  'subscriptions:export':   'Export subscriptions',

  // Deliveries
  'deliveries:read':        'View deliveries',
  'deliveries:update':      'Edit deliveries',
  'deliveries:assign':      'Assign delivery agents',
  'deliveries:sync':        'Sync deliveries with subscriptions',
  'deliveries:generate':    'Generate delivery schedules',

  // Agent-scoped deliveries
  'agent-deliveries:read':  'View own deliveries',
  'agent-deliveries:update':'Update own delivery status',
  'agent-deliveries:weigh': 'Record pre/post fill weights',
  'agent-deliveries:partial':'Record partial delivery',
  'agent-deliveries:fail':  'Mark delivery failed',

  // Customer-scoped deliveries
  'customer-deliveries:read':'View own delivery history',
  'customer-deliveries:confirm':'Confirm deliveries/remnants',

  // Refills (plant workflow, admin view)
  'refills:read':           'View refill requests',
  'refills:cancel':         'Cancel refill requests',
  'refills:reconcile':      'Complete reconciliation',
  'refills:retry':          'Retry rejected refills (agent)',

  // Cylinders
  'cylinders:read':         'View cylinders',
  'cylinders:flag':         'Flag cylinders',
  'cylinders:retire':       'Retire cylinders',
  'cylinders:weigh':        'Record cylinder weights',

  // Remnant
  'remnant:read':           'View remnant ledger',
  'remnant:read-own':       'View own remnant balance',
  'remnant:adjust':         'Manual remnant adjustments',
  'remnant:verify':         'Verify remnant integrity',

  // Disputes
  'disputes:read':          'View disputes',
  'disputes:resolve':       'Resolve disputes',
  'disputes:comment':       'Comment on disputes',

  // Settlements
  'settlements:read':       'View settlements',
  'settlements:generate':   'Generate settlements',
  'settlements:approve':    'Approve settlements',
  'settlements:pay':        'Mark settlements paid',

  // Plants
  'plants:read':            'View plants',
  'plants:create':          'Create plants',
  'plants:update':          'Edit plants',
  'plants:approve':         'Approve/suspend/activate plants',
  'plants:staff':           'Manage plant staff',
  'plants:price':           'Manage price agreements',

  // Products
  'products:read':          'View products',
  'products:create':        'Create products',
  'products:update':        'Edit products',
  'products:delete':        'Delete products',
  'products:upload':        'Upload product images',

  // Subscription plans
  'plans:read':             'View plans',
  'plans:create':           'Create plans',
  'plans:update':           'Edit plans',
  'plans:delete':           'Delete plans',

  // Support
  'support:read':           'View tickets',
  'support:respond':        'Respond to tickets',
  'support:update-status':  'Update ticket status',
  'support:delete':         'Delete tickets',

  // Reports
  'reports:read':           'View reports',
  'reports:export':         'Export reports',
  'reports:schedule':       'Schedule reports',
  'reports:save':           'Save custom report views',

  // Notifications
  'notifications:read':     'View notifications',
  'notifications:manage':   'Manage notifications',

  // Config (super-admin only)
  'config:read':            'View system configuration',
  'config:update':          'Edit system configuration',
  'config:flags':           'Toggle feature flags',
  'config:cache':           'Clear caches',

  // System
  'settings:read':          'View own settings',
  'settings:update':        'Edit own settings',
  'audit:read':             'View audit log',
  'system:admin':           'System administration',
};

// ============================================================
// ROLE → PERMISSIONS
// ============================================================
const ADMIN_FULL = [
  'users:read','users:create','users:update','users:delete','users:toggle',
  'users:wallet','users:bulk','users:import','users:export',
  'subscriptions:read','subscriptions:create','subscriptions:update',
  'subscriptions:delete','subscriptions:pause','subscriptions:cancel',
  'subscriptions:bulk','subscriptions:analytics','subscriptions:export',
  'deliveries:read','deliveries:update','deliveries:assign',
  'deliveries:sync','deliveries:generate',
  'refills:read','refills:cancel','refills:reconcile',
  'cylinders:read','cylinders:flag','cylinders:retire','cylinders:weigh',
  'remnant:read','remnant:adjust','remnant:verify',
  'disputes:read','disputes:resolve','disputes:comment',
  'settlements:read','settlements:generate','settlements:approve','settlements:pay',
  'plants:read','plants:create','plants:update','plants:approve',
  'plants:staff','plants:price',
  'products:read','products:create','products:update','products:delete','products:upload',
  'plans:read','plans:create','plans:update','plans:delete',
  'support:read','support:respond','support:update-status','support:delete',
  'reports:read','reports:export','reports:schedule','reports:save',
  'notifications:read','notifications:manage',
  'audit:read','system:admin',
  'settings:read','settings:update',
];

const SUPER_ADMIN_EXTRA = [
  'config:read','config:update','config:flags','config:cache',
];

const CUSTOMER_CARE = [
  'users:read',
  'subscriptions:read','subscriptions:analytics',
  'support:read','support:respond','support:update-status',
  'reports:read','reports:export',
  'notifications:read',
  'settings:read','settings:update',
  'deliveries:read',
];

const DELIVERY_AGENT = [
  'agent-deliveries:read',
  'agent-deliveries:update',
  'agent-deliveries:weigh',
  'agent-deliveries:partial',
  'agent-deliveries:fail',
  'refills:read',
  'refills:retry',
  'cylinders:read',
  'cylinders:weigh',
  'remnant:read-own',
  'notifications:read',
  'settings:read','settings:update',
];

const CUSTOMER = [
  'customer-deliveries:read',
  'customer-deliveries:confirm',
  'remnant:read-own',
  'notifications:read',
  'settings:read','settings:update',
];

const PLANT_STAFF = [
  'refills:read',
  'cylinders:read',
  'notifications:read',
  'settings:read','settings:update',
];

export const ROLE_PERMISSIONS = {
  'super-admin': new Set([...ADMIN_FULL, ...SUPER_ADMIN_EXTRA]),
  'admin':       new Set(ADMIN_FULL),
  'customer_care': new Set(CUSTOMER_CARE),
  'delivery':    new Set(DELIVERY_AGENT),
  'plant_admin':       new Set([...PLANT_STAFF, 'plants:read','plants:update','plants:staff']),
  'plant_supervisor':  new Set(PLANT_STAFF),
  'plant_operator':    new Set(PLANT_STAFF),
  'plant_staff':       new Set(PLANT_STAFF),
  'support':     new Set(CUSTOMER_CARE),
  'user':        new Set(CUSTOMER),
};

// ============================================================
// HELPERS
// ============================================================
export const getPermissionsForRole = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized] || new Set();
};

export const isAdminRole = (role) => {
  const r = normalizeRole(role);
  return r === 'admin' || r === 'super-admin';
};

export const isPlantRole = (role) => {
  const r = normalizeRole(role);
  return r.startsWith('plant_');
};

export const isDeliveryRole = (role) => normalizeRole(role) === 'delivery';

/** Where should this role land after login? */
export const getHomeRouteForRole = (role) => {
  const r = normalizeRole(role);
  if (isAdminRole(r) || r === 'customer_care') return '/admin/overview';
  if (isDeliveryRole(r)) return '/delivery/dashboard';
  if (isPlantRole(r)) return '/plant/dashboard'; // out-of-scope portal, but safe default
  return '/dashboard';
};