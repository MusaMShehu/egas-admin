base on the frontend (admin and delivery agent/staff) cod share/upoaded and the backend codes i  want you act as a professional UI/UX designer, frontend developer, software engineer, product manager, to refactor, modified, and redesign the admin portal and the delivery agent/staff portal implement new features added in the backend which are not in the frontend, use a complete RBAC for every staff role with required duties and access. unify the api endpoint and the css (the css base on category). implement every admin, delivery, and every administrative role features present in the backend into the frontend. suggest/recommend any changes where applicable and possible. make the page look clean, modern, user friendly, professional and responsive, use snackbar or toast notification for every actions and make every loading, actions, forms, cards, and many operations free of bugs, also implement live update of any changes without refresh, and implement in app, email, and sms notifications for important operations that needs attendtion.
e-GAS Admin & Delivery Portal — Complete Refactor Blueprint
I've absorbed everything. Before I write a single line of code, I owe you a plan — because what you're asking for is a ground-up rewrite of both portals, and shipping it without an agreed architecture will waste weeks.

Below is my professional assessment, the architecture I recommend, and the exact delivery order. Everything after this will be code.

1. Diagnosis — where the frontend is today
What works
Feature coverage is broad — nearly every backend capability has a UI stub.

Visual style is consistent within each domain (asm-, aum-, apm-, adm- prefixes).

useSnackbar, usePermissions, RoleBasedAccess, adminAPI are good primitives.

What doesn't
Problem	Severity	Example
API layer is broken	🔴 Blocking	Agent endpoints hit /admin/delivery/* (403); 30+ backend routes have no frontend wrapper at all
Permissions are decorative	🔴 Blocking	usePermissions has no entry for delivery, plant_*, customer_care, superadmin → those roles see nothing or everything
Navbar ignores role	🔴 Blocking	Delivery agents see Users / Products / Reports / Settings in the navbar
CSS is 90% duplicated	🟠 High	.adm-*, .aum-*, .asm-*, .apm-* all define their own card, table, badge, button, modal primitives
No live updates	🟠 High	Socket.IO is wired on the backend but the frontend never connects
Toasts are inconsistent	🟡 Medium	Three toast systems coexist (react-toastify, MUI Snackbar, toastService)
Forms repeat ~600 LOC	🟡 Medium	Every modal has its own validation, disabled-state, and submit logic
No notification bell	🟡 Medium	Notification model exists, no UI consumes it
Mobile layout breaks	🟡 Medium	Tables have no mobile card fallback; modals overflow on 480px
Dead code everywhere	🟢 Low	AuthContexts.jsx, helperss.jsx, ProductApi.js, AdminSubscriptionApi.js, authAPI.js (mock), AdminOverview.jsx (unrouted)
Verdict: the frontend needs a structural refactor (architecture + shared primitives), not a paint job.

2. Product recommendations (act as PM)
2.1 RBAC — the exact role matrix I recommend
The backend User.role enum has 11 values. I propose 7 visible roles (merging synonyms) with clear duty boundaries:

Role	Duties	Portal	Navbar shows
super-admin (+ superadmin)	Everything, including config/feature flags/plant approval	Admin	All 12 tabs
admin	Same minus config + feature flags	Admin	11 tabs (no Config)
customer_care	Users, Subscriptions, Support, Reports (read-only)	Admin (limited)	Users, Subs, Support, Reports
delivery	Own deliveries, weight capture, remnant on their deliveries, refill requests	Delivery Agent	Deliveries, Remnant, Notifications
plant_admin	Plant dashboard, refill workflow, staff, own plant profile	Plant Portal	(new — see §6)
plant_supervisor / plant_operator / plant_staff	Plant refill operations (scoped by plantId)	Plant Portal	Refills, Transactions, Notifications
user	Nothing on admin/delivery — redirected to /dashboard	Customer	—
2.2 Permissions — one flat map, not ten
Right now each RoleBasedAccess call re-derives role logic. I'll consolidate into a single permissions.js with an explicit { role → Set<permission> } map. Every gate becomes hasPermission('remnant:adjust') instead of hasPermission('subscriptions:update') overloaded three ways.

Proposed permission namespaces:

users:*, orders:*, subscriptions:*, deliveries:*, products:*, plans:*, support:*, reports:*, settings:*, config:*

New: remnant:* (read, adjust, verify), refill:* (read, receive, inspect, quantify, confirm, collect), cylinder:* (read, flag, retire, weigh), dispute:*, settlement:*, plant:*, plantStaff:*

2.3 The 12 admin nav tabs
Tab	Route	Roles
Overview	/admin/overview	super, admin, customer_care (limited widgets)
Users	/admin/users	super, admin, customer_care
Subscriptions	/admin/subscriptions	super, admin, customer_care
Deliveries	/admin/deliveries	super, admin
Refills (new)	/admin/refills	super, admin
Cylinders (new)	/admin/cylinders	super, admin
Remnant Ledger (new)	/admin/remnant-ledger	super, admin
Disputes (new)	/admin/disputes	super, admin
Settlements (new)	/admin/settlements	super, admin
Plants (new)	/admin/plants	super, admin
Products	/admin/products	super, admin
Support	/admin/support	super, admin, customer_care
Reports	/admin/reports	super, admin, customer_care
Settings	/admin/settings	super, admin
Config (new)	/admin/config	super only
2.4 The 5 delivery-agent nav tabs
Tab	Route	Purpose
Deliveries	/delivery/dashboard	3 sub-tabs: Active / Delivered / Failed
Weight Capture	(modal triggered from delivery card)	Record pre/post fill
Refill Requests (new)	/delivery/refills	My refill requests + retry/escalate
Remnant (new)	/delivery/remnant	My remnant-affected deliveries + cylinders
Notifications	/delivery/notifications	In-app feed
2.5 Live updates — one Socket.IO provider
Single <LiveProvider> at root that:

connects with the auth token

exposes useLiveEvent('delivery.post_fill_recorded', handler) and useLiveRoom('admin:ops')

auto-emits snackbar on any *.created, *.confirmed, *.rejected, remnant.credited

2.6 Notifications — one system, three channels
Backend already dispatches via notificationDispatcher. Frontend should:

Fetch GET /api/v1/notifications on login and on socket notification.new

Render a bell icon in navbar with unread count

If a notification's priority === 'high' and read === false, also fire a toast

Never duplicate what email/SMS handles — the bell is for in-app only

3. The refactor — exact file structure I'll create
text
src/
├── api/
│   ├── apiClient.js                      ← already exists, keep
│   ├── endpoints/
│   │   ├── index.js                      ← re-exports everything
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── users.js
│   │   │   ├── subscriptions.js
│   │   │   ├── deliveries.js
│   │   │   ├── refills.js                ← NEW
│   │   │   ├── cylinders.js              ← NEW
│   │   │   ├── remnant.js                ← NEW
│   │   │   ├── disputes.js               ← NEW
│   │   │   ├── settlements.js            ← NEW
│   │   │   ├── plants.js                 ← NEW
│   │   │   ├── products.js
│   │   │   ├── plans.js
│   │   │   ├── support.js
│   │   │   ├── reports.js
│   │   │   ├── notifications.js          ← NEW
│   │   │   └── config.js                 ← NEW
│   │   ├── agent/
│   │   │   ├── deliveries.js             ← NEW (own deliveries)
│   │   │   ├── weights.js                ← NEW (pre/post fill)
│   │   │   ├── refills.js                ← NEW
│   │   │   └── cylinders.js              ← NEW
│   │   ├── customer/
│   │   │   ├── deliveries.js
│   │   │   ├── remnant.js                ← NEW
│   │   │   └── cylinders.js              ← NEW
│   │   └── auth.js
│   ├── ProductApi.js                     ← DELETE
│   ├── AdminSubscriptionApi.js           ← DELETE
│   ├── SubscriptionAPI.js                ← DELETE
│   ├── subscriptionService.jsx           ← DELETE
│   ├── authAPI.js                        ← DELETE (mock)
│   ├── cartApi.js / ProductCartAPI.js    ← consolidate → cart.js
│   └── walletPaymentApi.js               ← keep, wrap in endpoints
│
├── components/
│   ├── ui/                               ← THE NEW SHARED PRIMITIVES
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── DataTable.jsx                 ← replaces 5 hand-rolled tables
│   │   ├── FormField.jsx
│   │   ├── FormRow.jsx
│   │   ├── Badge.jsx
│   │   ├── StatusPill.jsx
│   │   ├── PageHeader.jsx
│   │   ├── EmptyState.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── StatCard.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Drawer.jsx                    ← replaces some modals on mobile
│   │   ├── Pagination.jsx
│   │   ├── Tabs.jsx
│   │   ├── FilterBar.jsx
│   │   └── FormValidator.js              ← tiny hook, ~80 LOC
│   │
│   ├── layout/
│   │   ├── AdminLayout.jsx               ← RBAC-aware sidebar
│   │   ├── AdminSidebar.jsx              ← NEW (collapses on mobile)
│   │   ├── DeliveryLayout.jsx            ← NEW
│   │   ├── NotificationBell.jsx          ← NEW
│   │   ├── UserMenu.jsx
│   │   └── ProtectedRoute.jsx            ← hardened
│   │
│   ├── admin/                            ← feature folders unchanged in path
│   │   ├── overview/
│   │   ├── users/
│   │   ├── subscriptions/
│   │   ├── deliveries/
│   │   ├── refills/                      ← NEW
│   │   ├── cylinders/                    ← NEW
│   │   ├── remnant/                      ← NEW
│   │   ├── disputes/                     ← NEW
│   │   ├── settlements/                  ← NEW
│   │   ├── plants/                       ← NEW
│   │   ├── products/
│   │   ├── plans/                        ← split out of products
│   │   ├── support/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── config/                       ← NEW
│   │
│   ├── delivery/                         ← Rename from admin/DeliveryManagement
│   │   ├── AgentPortal.jsx
│   │   ├── PreFillDialog.jsx             ← NEW
│   │   ├── PostFillDialog.jsx            ← NEW
│   │   ├── RefillRequests.jsx            ← NEW
│   │   └── RemnantPanel.jsx              ← NEW
│   │
│   └── customer/
│       ├── DeliveryHistory.jsx
│       ├── RemnantPanel.jsx
│       └── Cylinders.jsx
│
├── hooks/
│   ├── usePermissions.js                 ← REWRITE
│   ├── useSnackbar.js                    ← keep
│   ├── useLiveEvent.js                   ← NEW
│   ├── useNotificationFeed.js            ← NEW
│   ├── useApi.js                         ← NEW (standard fetch/loading/error)
│   ├── useForm.js                        ← NEW
│   └── usePagination.js                  ← NEW
│
├── contexts/
│   ├── AuthContext.jsx                   ← keep, add RBAC role resolution
│   ├── SnackbarContext.jsx               ← keep
│   ├── LiveContext.jsx                   ← NEW (Socket.IO)
│   └── AuthContexts.jsx                  ← DELETE
│
├── styles/
│   ├── tokens.css                        ← NEW: CSS variables for color/space/radius/shadow
│   ├── base.css                          ← reset + typography
│   ├── components/                       ← one CSS file per primitive
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── table.css
│   │   └── ...
│   ├── modules/                          ← feature-level overrides only
│   │   ├── admin.css
│   │   ├── delivery.css
│   │   ├── reports.css
│   │   └── remnant.css
│   └── index.css                         ← imports everything, single source
│
├── utils/
│   ├── permissions.js                    ← THE permission map
│   ├── format.js                         ← merge helpers.jsx + helperss.jsx
│   ├── constants.js                      ← statuses, categories, enums
│   └── validators.js
│
├── App.jsx                               ← rewritten routes
└── main.jsx (or index.js)
Deletions: ~14 files. New files: ~60. Rewritten files: ~30.

4. CSS architecture — "by category"
You asked for CSS based on category. Here's the system:

4.1 Design tokens (single source)
css
/* styles/tokens.css */
:root {
  /* Brand */
  --egas-primary: #6f42c1;
  --egas-primary-hover: #5a32a3;
  --egas-primary-soft: #ede7f6;

  /* Semantic */
  --color-success: #10b981;
  --color-success-soft: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-soft: #fef3c7;
  --color-danger:  #dc2626;
  --color-danger-soft:  #fee2e2;
  --color-info:    #0ea5e9;
  --color-info-soft: #e0f2fe;

  /* Domain accents */
  --color-partial:   #f39c12;
  --color-remnant:   #8b5cf6;  /* remnant = purple to distinguish from partial=amber */
  --color-refill:    #0ea5e9;
  --color-settlement:#059669;

  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-400: #9ca3af;
  --gray-600: #4b5563;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Spacing scale */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px; --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  --shadow-lg: 0 10px 32px rgba(0,0,0,.12);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #0f172a;
    --gray-900: #f1f5f9;
    --shadow-md: 0 4px 12px rgba(0,0,0,.4);
  }
}
4.2 Component CSS — one file, one BEM-ish class
css
/* styles/components/button.css */
.ui-btn { /* base */ }
.ui-btn--primary { background: var(--egas-primary); ... }
.ui-btn--danger { background: var(--color-danger); ... }
.ui-btn--sm { padding: var(--sp-2) var(--sp-3); }
4.3 Module CSS — only overrides
css
/* styles/modules/remnant.css */
.remnant-weights { display: flex; gap: var(--sp-3); }
.remnant-delta--positive { color: var(--color-success); }
.remnant-delta--negative { color: var(--color-danger); }
Result: the existing 6,000 lines of CSS collapse to ~1,200 lines of tokens + primitives + small module overrides. Every screen becomes consistent for free.

5. What I will NOT do (and why)
Some things you might expect a "refactor" to do — I'm deliberately leaving them out because they'd break your existing behavior:

I won't rename routes. Existing /admin/users, /admin/overview, etc. stay. Only new routes are added.

I won't touch AuthContext.login — the cookie flow is correct. I'll only add role resolution from user.role.

I won't rewrite the backend. Except notificationDispatcher.refillRequestUpdate (one method) — that's the only server change required.

I won't remove the old settings/profile pages — they work; I'll restyle via tokens.

I won't delete the Reports module internals — they're complex and correct; I'll reskin only.

I won't add a component library (MUI/AntD). The current build already pulls MUI for Snackbar only; adding a full kit would multiply bundle size and force a redraw of every screen.

6. Feature additions beyond the RBAC + remnant
Small wins that the backend already supports and the UI is missing — I'll implement all of these in the same refactor:

Admin
Refill Requests page — list, filter by plant/status/date, view detail, cancel (only if status === 'created'), see delivery timeline

Cylinders page — list all cylinders, weight history (with phase filter), custody history, remnant history, flag/retire actions

Remnant Ledger page — cross-customer list, per-user drill-down, manual credit/debit adjustment form, integrity verify button (shows "✓ OK / balance=X" or "⚠ mismatch")

Disputes page — list, detail drawer, comment, resolve (accept_plant / accept_agent / partial_adjustment / reject)

Reconciliation queue — confirmed-but-unsettled transactions with variance vs tolerance; "Mark Reconciled" action

Settlements page — list, generate (plant + period → draft), approve, mark-paid (with reference)

Plants page — list, approve/suspend/activate, staff add/remove, price agreement create + cancel

Config page — system configs (category-tabbed), feature flags toggle, clear-cache button

Notification bell — unread count + dropdown feed

Live updates — new refill request, refill confirmed, dispute created, settlement paid — all toast live

Delivery Agent
Pre-fill + post-fill weight capture dialogs — the core of the new remnant flow

Refill Requests tab — my requests, retry with another plant, escalate, collect from plant

Remnant panel — cylinder weight history, customer remnant balance, delivered remnant amounts

Notification bell + live toasts

Both
Search-everywhere in navbar (Cmd+K)

Mobile card view for all tables below 768px

Optimistic updates on status changes (revert on error)

7. Delivery plan — 6 batches
To keep quality high and let you review each piece, I'll deliver in six batches. Each batch is a coherent, testable slice.

Batch	Deliverable	Files	Effort
1. Foundation	endpoints.js rewrite + permissions.js + usePermissions rewrite + LiveContext + useLiveEvent + useApi + useNotificationFeed + notificationDispatcher.refillRequestUpdate	8 files	~2 hours of writing
2. UI primitives	All components/ui/* + styles/tokens.css + styles/components/*.css	~20 files	~3 hours
3. Admin layout + navbar	AdminLayout, AdminSidebar (RBAC-aware), NotificationBell, UserMenu, hardened ProtectedRoute, App.jsx rewrite	~8 files	~1.5 hours
4. Delivery portal	DeliveryLayout, AgentPortal rewrite, PreFillDialog, PostFillDialog, RefillRequests, RemnantPanel	~8 files	~2.5 hours
5. New admin pages	Refills, Cylinders, Remnant Ledger, Disputes, Settlements, Plants, Config — each as a self-contained folder with list/detail/actions	~30 files	~6 hours
6. Reskin existing modules	Users, Subscriptions, Products, Plans, Support, Reports, Settings — swap inline CSS for tokens + primitives; no logic changes	~30 files (edits)	~3 hours
Total: ~18 hours of writing, spread across 6 responses. Each response will be self-contained — you can copy-paste and test before I proceed to the next.

8. Two questions I need answered before Batch 1
notificationDispatcher.js — I need the raw file. I have the summary but not the source. To safely add refillRequestUpdate without breaking the class, I need the actual file. Paste it. (If you truly can't paste it, I'll write the method as a "paste at bottom of class NotificationDispatcher" snippet — safe but you'll need to place it manually.)

Plant portal — the backend has a full plant auth (/api/v1/plant/auth/*) and a plant portal UI is implied. Do you want me to build the Plant portal in this refactor (batch 7), or is that out of scope for now? If out of scope, I'll still add the admin-side "Plants" page (which manages them), just skip the plant-login UI.

Optional 3rd: confirm resolvePurchasedKg exists in utils/deliveryHelper.js. If it doesn't, I'll include it in Batch 1's backend addition.

9. What happens when you say "go"
I'll deliver Batch 1 in a single response, containing:

src/utils/permissions.js — full role→permission map (~150 LOC)

src/hooks/usePermissions.js — rewritten, ~80 LOC

src/api/endpoints/index.js + all 15 sub-files — ~900 LOC total, drop-in, zero breaks for existing admin calls

src/api/endpoints/agent/weights.js — pre/post fill wrappers

src/contexts/LiveContext.jsx + useLiveEvent — Socket.IO wiring

src/hooks/useApi.js — standard {data, loading, error, execute} hook

src/hooks/useNotificationFeed.js — bell feed with unread count

notificationDispatcher.refillRequestUpdate — paste-in snippet

You'll review, test the API layer with one admin call + one agent pre-fill call, and then we proceed to Batch 2.

My professional recommendation on order: do the batches as laid out. Each one is reviewable in isolation. Skipping ahead (e.g., starting with the remnant page) will end up redoing work because the primitives aren't ready.

Ready when you are. Paste notificationDispatcher.js and answer the plant-portal question, or just say "go with placeholders" and I'll begin Batch 1 immediately.

2. Do not build the plant portal it is already built. 3. yes resolvePurchasedKg exists in utils/deliveryHelper.js.....
Confirmed — all answers in hand. Here's the final answer to Batch 1
Answers logged:

✅ notificationDispatcher.js received. I'll add refillRequestUpdate as a clean addition to the Dispatcher object — no touch to any existing method.

✅ Plant portal is out of scope. Admin-side "Plants" management page stays.

✅ resolvePurchasedKg and parseKgField both confirmed in utils/deliveryHelper.js — no backend addition needed there.

Also verified while reviewing: apiResponse.js already attaches res.success/error/created/badRequest/... and every controller returns { success, message, data, timestamp } — so my useApi hook can rely on that shape universally.

Batch 1 — Foundation. Full drop-in code below.
Seven files. Copy in order. Each is self-contained.

File 1 of 7 — src/utils/permissions.js
Single source of truth for the RBAC matrix. Every role, every permission.

js
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
File 2 of 7 — src/hooks/usePermissions.js (rewrite)
Wraps the map in a stable hook. Adds isRole, canAny, canAll helpers.

js
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
File 3 of 7 — src/api/endpoints/index.js
The one API surface. Every method has a single correct path (mount point matched against server.js), handles the standard { success, message, data } shape, and returns that envelope as-is so callers keep using res.data.success.

js
// src/api/endpoints/index.js
import apiClient from '../apiClient';

/* ============================================================
 * Response contract (from backend utils/apiResponse.js):
 *   Success:  { success: true, message, data, timestamp }
 *   Error:    { success: false, message, timestamp, errors? }
 *
 * apiClient normalizes errors: thrown Error has { status, data, message }.
 * Every method returns the raw axios response so callers keep using
 * res.data.success / res.data.data / res.data.message.
 * ============================================================ */

// ---------- AUTH ----------
export const authAPI = {
  login:          (email, password) => apiClient.post('/auth/login', { email, password }),
  loginMobile:    (email, password) => apiClient.post('/auth/login-mobile', { email, password }),
  register:       (formData)        => apiClient.post('/auth/register', formData),
  registerMobile: (formData)        => apiClient.post('/auth/register-mobile', formData),
  refresh:        ()                => apiClient.post('/auth/refresh'),
  logout:         ()                => apiClient.post('/auth/logout'),
  me:             ()                => apiClient.get('/auth/me'),
  updatePassword: (currentPassword, newPassword) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),
  updateProfile:  (data)   => apiClient.put('/auth/profile', data),
  forgotPassword: (email)  => apiClient.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) =>
    apiClient.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail:    (token, userId) =>
    apiClient.get(`/auth/verify-email/${token}`, { params: { userId } }),
  resendVerification: () => apiClient.post('/auth/verify-email'),
};

// ---------- ADMIN: DASHBOARD ----------
export const adminDashboardAPI = {
  getStats:            () => apiClient.get('/admin/dashboard/stats'),
  getRecentActivities: () => apiClient.get('/admin/dashboard/recent-activities'),
  getChartData:        (period = 'month') =>
    apiClient.get('/admin/dashboard/chart-data', { params: { period } }),
  getOverview:         () => apiClient.get('/admin/dashboard/overview'),
};

// ---------- ADMIN: USERS ----------
export const adminUsersAPI = {
  list:           (params) => apiClient.get('/admin/users', { params }),
  get:            (id)     => apiClient.get(`/admin/users/${id}`),
  create:         (data)   => apiClient.post('/admin/users', data),
  update:         (id, data) => apiClient.put(`/admin/users/${id}`, data),
  remove:         (id)     => apiClient.delete(`/admin/users/${id}`),
  toggleStatus:   (id, isActive) => apiClient.patch(`/admin/users/${id}/status`, { isActive }),
  updateWallet:   (id, amount, operation) =>
    apiClient.patch(`/admin/users/${id}/wallet`, { amount, operation }),
  bulkDelete:     (userIds) => apiClient.delete('/admin/users/bulk/delete', { data: { userIds } }),
  bulkStatus:     (userIds, isActive) =>
    apiClient.patch('/admin/users/bulk/status', { userIds, isActive }),
  stats:          () => apiClient.get('/admin/users/stats/overview'),
  nearby:         (params) => apiClient.get('/admin/users/location/nearby', { params }),
  bulkImport:     (payload) => apiClient.post('/admin/users/bulk/import', payload),
};

// ---------- ADMIN: SUBSCRIPTIONS ----------
export const adminSubscriptionsAPI = {
  list:     (params) => apiClient.get('/admin/subscriptions', { params }),
  get:      (id) => apiClient.get(`/admin/subscriptions/${id}`),
  create:   (data) => apiClient.post('/admin/subscriptions', data),
  update:   (id, data) => apiClient.put(`/admin/subscriptions/${id}`, data),
  remove:   (id) => apiClient.delete(`/admin/subscriptions/${id}`),
  pause:    (id) => apiClient.put(`/admin/subscriptions/${id}/pause`),
  resume:   (id) => apiClient.put(`/admin/subscriptions/${id}/resume`),
  cancel:   (id) => apiClient.put(`/admin/subscriptions/${id}/cancel`),
  bulkUpdate: (ids, updateData) =>
    apiClient.put('/admin/subscriptions/bulk/update', { ids, updateData }),
  bulkDelete: (ids) =>
    apiClient.delete('/admin/subscriptions/bulk/delete', { data: { ids } }),
  analytics: (params) => apiClient.get('/admin/subscriptions/analytics/overview', { params }),
  statistics:(params) => apiClient.get('/admin/subscriptions/statistics', { params }),
  export:    (params) => apiClient.get('/admin/subscriptions/export', { params }),
};

// ---------- ADMIN: DELIVERIES (management, admin-scoped) ----------
export const adminDeliveriesAPI = {
  list:     (params) => apiClient.get('/admin/delivery', { params }),
  stats:    () => apiClient.get('/admin/delivery/stats'),
  assign:   (id, deliveryAgentId) =>
    apiClient.put(`/admin/delivery/${id}/assign`, { deliveryAgentId }),
  generateSchedules: (daysAhead = 7) =>
    apiClient.post('/admin/delivery/generate-schedules', { daysAhead }),
  syncWithSubscription: (id) =>
    apiClient.post(`/delivery/${id}/sync-subscription`),
  // Full operational timeline (weights + refill + inspection + audit)
  getTimeline: (id) => apiClient.get(`/admin/deliveries/${id}/timeline`),
  // Cross-customer remnant listing (admin)
  getAllRemnants: (params) => apiClient.get('/delivery/remnants', { params }),
};

// ---------- ADMIN: REFILLS ----------
export const adminRefillsAPI = {
  list:              (params) => apiClient.get('/admin/refill-requests', { params }),
  get:               (id) => apiClient.get(`/admin/refill-requests/${id}`),
  rejected:          (params) => apiClient.get('/admin/refill-requests/rejected', { params }),
  cancel:            (id, reason) =>
    apiClient.post(`/admin/refill-requests/${id}/cancel`, { reason }),
  reconciliationQueue: (params) => apiClient.get('/admin/reconciliation', { params }),
  completeReconciliation: (transactionId, note) =>
    apiClient.post(`/admin/reconciliation/${transactionId}/complete`, { note }),
};

// ---------- ADMIN: CYLINDERS ----------
export const adminCylindersAPI = {
  list:             (params) => apiClient.get('/admin/cylinders', { params }),
  get:              (id) => apiClient.get(`/admin/cylinders/${id}`),
  weightHistory:    (id, params) =>
    apiClient.get(`/admin/cylinders/${id}/weight-history`, { params }),
  custodyHistory:   (id, params) =>
    apiClient.get(`/admin/cylinders/${id}/custody-history`, { params }),
  remnantHistory:   (id, params) =>
    apiClient.get(`/admin/cylinders/${id}/remnant-history`, { params }),
  flag:             (id, reason) =>
    apiClient.patch(`/admin/cylinders/${id}/flag`, { reason }),
  retire:           (id, reason) =>
    apiClient.patch(`/admin/cylinders/${id}/retire`, { reason }),
};

// ---------- ADMIN: REMNANT LEDGER ----------
export const adminRemnantAPI = {
  listLedger:       (params) => apiClient.get('/admin/remnant-ledger', { params }),
  getUserLedger:    (userId, params) =>
    apiClient.get(`/admin/remnant-ledger/user/${userId}`, { params }),
  verifyIntegrity:  (userId) =>
    apiClient.get(`/admin/remnant-ledger/verify/${userId}`),
  createAdjustment: (payload) =>
    apiClient.post('/admin/remnant-ledger/adjustment', payload),
};

// ---------- ADMIN: DISPUTES ----------
export const adminDisputesAPI = {
  list:    (params) => apiClient.get('/admin/disputes', { params }),
  get:     (id) => apiClient.get(`/admin/disputes/${id}`),
  create:  (payload) => apiClient.post('/admin/disputes', payload),
  resolve: (id, payload) => apiClient.post(`/admin/disputes/${id}/resolve`, payload),
  comment: (id, text) => apiClient.post(`/admin/disputes/${id}/comment`, { text }),
};

// ---------- ADMIN: SETTLEMENTS ----------
export const adminSettlementsAPI = {
  list:     (params) => apiClient.get('/admin/list-settlements', { params }),
  get:      (id) => apiClient.get(`/admin/${id}`),
  generate: (payload) =>
    apiClient.post('/admin/generate-settlements', payload),
  approve:  (id) => apiClient.patch(`/admin/${id}/approve`),
  markPaid: (id, paymentReference) =>
    apiClient.patch(`/admin/${id}/mark-paid`, { paymentReference }),
};

// ---------- ADMIN: PLANTS ----------
export const adminPlantsAPI = {
  list:          (params) => apiClient.get('/admin/plants', { params }),
  get:           (id) => apiClient.get(`/admin/plants/${id}`),
  create:        (data) => apiClient.post('/admin/plants', data),
  update:        (id, data) => apiClient.put(`/admin/plants/${id}`, data),
  approve:       (id) => apiClient.patch(`/admin/plants/${id}/approve`),
  suspend:       (id, reason) =>
    apiClient.patch(`/admin/plants/${id}/suspend`, { reason }),
  activate:      (id) => apiClient.patch(`/admin/plants/${id}/activate`),
  staff:         (id) => apiClient.get(`/admin/plants/${id}/staff`),
  addStaff:      (id, data) => apiClient.post(`/admin/plants/${id}/staff`, data),
  removeStaff:   (id, staffId) =>
    apiClient.delete(`/admin/plants/${id}/staff/${staffId}`),
  prices:        (id) => apiClient.get(`/admin/plants/${id}/price-agreements`),
  createPrice:   (id, data) =>
    apiClient.post(`/admin/plants/${id}/price-agreements`, data),
  cancelPrice:   (agreementId, reason) =>
    apiClient.patch(`/admin/price-agreements/${agreementId}/cancel`, { reason }),
};

// ---------- ADMIN: PRODUCTS ----------
export const adminProductsAPI = {
  list:        (params) => apiClient.get('/admin/products', { params }),
  get:         (id) => apiClient.get(`/admin/products/${id}`),
  create:      (data) => apiClient.post('/admin/products', data),
  update:      (id, data) => apiClient.put(`/admin/products/update-product/${id}`, data),
  remove:      (id) => apiClient.delete(`/admin/products/delete-product/${id}`),
  toggleStatus:(id) => apiClient.patch(`/admin/products/${id}/toggle-status`),
  updateStock: (id, stock, operation = 'set') =>
    apiClient.patch(`/admin/products/${id}/stock`, { stock, operation }),
  uploadPhoto: (id, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return apiClient.put(`/admin/products/${id}/photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkDelete:  (productIds) =>
    apiClient.delete('/admin/products/bulk-delete', { data: { productIds } }),
  analytics:   () => apiClient.get('/admin/products/analytics/overview'),
};

// ---------- ADMIN: SUBSCRIPTION PLANS ----------
export const adminPlansAPI = {
  list:          (params) => apiClient.get('/admin/subscription-plans', { params }),
  get:           (id) => apiClient.get(`/admin/subscription-plans/${id}`),
  create:        (data) => apiClient.post('/admin/subscription-plans', data),
  update:        (id, data) => apiClient.put(`/admin/subscription-plans/${id}`, data),
  remove:        (id) => apiClient.delete(`/admin/subscription-plans/${id}`),
  toggleStatus:  (id) => apiClient.patch(`/admin/subscription-plans/${id}/toggle-status`),
  togglePopular: (id) => apiClient.patch(`/admin/subscription-plans/${id}/toggle-popular`),
  updateOrder:   (id, displayOrder) =>
    apiClient.patch(`/admin/subscription-plans/${id}/display-order`, { displayOrder }),
  bulkOrder:     (orders) =>
    apiClient.patch('/admin/subscription-plans/bulk-display-order', { orders }),
  calculatePrice:(id, payload) =>
    apiClient.post(`/admin/subscription-plans/${id}/calculate-price`, payload),
  analytics:     () => apiClient.get('/admin/subscription-plans/analytics/overview'),
  duplicate:     (id) => apiClient.post(`/admin/subscription-plans/${id}/duplicate`),
};

// ---------- ADMIN: SUPPORT ----------
export const adminSupportAPI = {
  list:         (params) => apiClient.get('/admin/supports', { params }),
  get:          (id) => apiClient.get(`/admin/supports/${id}`),
  updateStatus: (id, status) =>
    apiClient.patch(`/admin/supports/${id}/status`, { status }),
  respond:      (id, message, files = []) => {
    const fd = new FormData();
    fd.append('message', message);
    files.forEach(f => fd.append('attachments', f));
    return apiClient.post(`/admin/supports/${id}/respond`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove:       (id) => apiClient.delete(`/admin/supports/${id}`),
  bulkStatus:   (ticketIds, status) =>
    apiClient.patch('/admin/supports/bulk/status', { ticketIds, status }),
  stats:        () => apiClient.get('/admin/supports/stats/overview'),
  forUser:      (userId, params) =>
    apiClient.get(`/admin/supports/user/${userId}`, { params }),
};

// ---------- ADMIN: REPORTS ----------
export const adminReportsAPI = {
  sales:             (params) => apiClient.get('/admin/reports/sales', { params }),
  users:             (params) => apiClient.get('/admin/reports/users', { params }),
  inventory:         (params) => apiClient.get('/admin/reports/inventory', { params }),
  subscriptions:     (params) => apiClient.get('/admin/reports/subscriptions', { params }),
  financial:         (params) => apiClient.get('/admin/reports/financial', { params }),
  realtimeMetrics:   () => apiClient.get('/admin/reports/realtime-metrics'),
  export:            (reportType, config) =>
    apiClient.post(`/admin/reports/export/${reportType}`, config, {
      responseType: 'blob',
    }),
  saved:             () => apiClient.get('/admin/reports/saved'),
  save:              (payload) => apiClient.post('/admin/reports/saved', payload),
  deleteSaved:       (id) => apiClient.delete(`/admin/reports/saved/${id}`),
  schedules:         () => apiClient.get('/admin/reports/schedules'),
  createSchedule:    (payload) => apiClient.post('/admin/reports/schedules', payload),
  updateSchedule:    (id, payload) =>
    apiClient.patch(`/admin/reports/schedules/${id}`, payload),
  deleteSchedule:    (id) => apiClient.delete(`/admin/reports/schedules/${id}`),
  recipients:        () => apiClient.get('/admin/reports/recipients'),
};

// ---------- ADMIN: CONFIG + FLAGS ----------
export const adminConfigAPI = {
  listConfigs:  () => apiClient.get('/admin/config'),
  configsByCategory: (category) =>
    apiClient.get(`/admin/config/category/${category}`),
  updateConfig: (key, payload) => apiClient.put(`/admin/config/${key}`, payload),
  clearCache:   () => apiClient.post('/admin/config/clear-cache'),
  listFlags:    () => apiClient.get('/admin/config/feature-flags'),
  updateFlag:   (key, payload) =>
    apiClient.put(`/admin/config/feature-flags/${key}`, payload),
};

// ---------- AGENT (delivery staff) ----------
export const agentDeliveriesAPI = {
  myDeliveries:      (params) =>
    apiClient.get('/delivery/agent/my-deliveries', { params }),
  accept:            (id) => apiClient.put(`/delivery/${id}/accept`),
  outForDelivery:    (id) => apiClient.put(`/delivery/${id}/out-for-delivery`),
  delivered:         (id, notes) =>
    apiClient.put(`/delivery/${id}/delivered`, { notes }),
  failed:            (id, reason, notes) =>
    apiClient.put(`/delivery/${id}/failed`, { reason, notes }),
  recordPartial:     (id, deliveredKg, remainingKg, notes) =>
    apiClient.put(`/delivery/${id}/partial-delivery`, {
      deliveredKg, remainingKg, notes,
    }),
  recordPreFill:     (id, payload) =>
    apiClient.post(`/delivery/${id}/pre-fill-weight`, payload),
  recordPostFill:    (id, payload) =>
    apiClient.post(`/delivery/${id}/post-fill-weight`, payload),
  syncWithSubscription: (id) =>
    apiClient.post(`/delivery/${id}/sync-subscription`),
  remnantDeliveries: (params) =>
    apiClient.get('/delivery/agent/remnant-deliveries', { params }),
};

export const agentRefillsAPI = {
  availablePlants:  (gps) => apiClient.get('/agent/plants/available', {
    params: { gps },
  }),
  create:           (payload) => apiClient.post('/agent/refill-requests', payload),
  myRequests:       (params) =>
    apiClient.get('/agent/refill-requests', { params }),
  get:              (id) => apiClient.get(`/agent/refill-requests/${id}`),
  retry:            (id, newPlantId, agentNotes) =>
    apiClient.post(`/agent/refill-requests/${id}/retry`, { newPlantId, agentNotes }),
  collect:          (id, gpsCoordinates) =>
    apiClient.post(`/agent/refill-requests/${id}/collect`, { gpsCoordinates }),
  escalate:         (id, reason) =>
    apiClient.post(`/agent/refill-requests/${id}/escalate`, { reason }),
};

export const agentCylindersAPI = {
  register:         (payload) =>
    apiClient.post('/agent/cylinders/register', payload),
  lookup:           (tagCode) =>
    apiClient.get(`/agent/cylinders/lookup/${tagCode}`),
  weigh:            (id, payload) =>
    apiClient.post(`/agent/cylinders/${id}/weigh`, payload),
  customerCylinders:(customerId) =>
    apiClient.get(`/agent/cylinders/customer/${customerId}`),
  weightHistory:    (id, params) =>
    apiClient.get(`/agent/cylinders/${id}/weight-history`, { params }),
  remnant:          (id, params) =>
    apiClient.get(`/agent/cylinders/${id}/remnant`, { params }),
};

// ---------- CUSTOMER ----------
export const customerDeliveriesAPI = {
  myDeliveries:     (params) =>
    apiClient.get('/delivery/my-deliveries', { params }),
  detail:           (id) => apiClient.get(`/delivery/${id}`),
  confirm:          (id, notes) =>
    apiClient.put(`/delivery/${id}/confirm`, { notes }),
  next:             () => apiClient.get('/delivery/next-delivery'),
  pauseHistory:     (id) => apiClient.get(`/delivery/${id}/pause-history`),
  bySubscription:   (subscriptionId, params) =>
    apiClient.get(`/delivery/subscription/${subscriptionId}`, { params }),
  confirmRemnant:   (id, notes) =>
    apiClient.put(`/delivery/remnant/${id}/confirm`, { notes }),
  requestRemnant:   (payload) =>
    apiClient.post('/delivery/remnant/request-delivery', payload),
  myRemnant:        () => apiClient.get('/delivery/remnant/my-remnant'),
};

export const customerRemnantAPI = {
  ledger:  (params) => apiClient.get('/customer/remnant/ledger', { params }),
  summary: () => apiClient.get('/customer/remnant/summary'),
};

export const customerCylindersAPI = {
  list:          () => apiClient.get('/customer/cylinders'),
  weightHistory: (id, params) =>
    apiClient.get(`/customer/cylinders/${id}/weight-history`, { params }),
};

// ---------- NOTIFICATIONS ----------
export const notificationsAPI = {
  list:        (params) => apiClient.get('/notifications', { params }),
  counts:      () => apiClient.get('/notifications/counts'),
  markRead:    (id) => apiClient.patch(`/notifications/${id}/read`),
  markUnread:  (id) => apiClient.patch(`/notifications/${id}/unread`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  archive:     (id) => apiClient.patch(`/notifications/${id}/archive`),
  unarchive:   (id) => apiClient.patch(`/notifications/${id}/unarchive`),
  remove:      (id) => apiClient.delete(`/notifications/${id}`),
  clearRead:   () => apiClient.delete('/notifications/clear-read'),
  clearAll:    () => apiClient.delete('/notifications/clear-all'),
  registerToken:   (token, platform = 'web') =>
    apiClient.post('/notifications/register-token', { token, platform }),
  unregisterToken: (token) =>
    apiClient.delete(`/notifications/unregister-token/${token}`),
  getPreferences:  () => apiClient.get('/notifications/preferences'),
  updatePreferences: (payload) => apiClient.put('/notifications/preferences', payload),
};

// ---------- LEGACY ALIAS (one transition cycle) ----------
// Any old component that imports `adminAPI` keeps working.
export const adminAPI = {
  dashboard:         adminDashboardAPI,
  users:             adminUsersAPI,
  subscriptions:     adminSubscriptionsAPI,
  deliveries:        adminDeliveriesAPI,
  refills:           adminRefillsAPI,
  cylinders:         adminCylindersAPI,
  remnant:           adminRemnantAPI,
  disputes:          adminDisputesAPI,
  settlements:       adminSettlementsAPI,
  plants:            adminPlantsAPI,
  products:          adminProductsAPI,
  plans:             adminPlansAPI,
  support:           adminSupportAPI,
  reports:           adminReportsAPI,
  config:            adminConfigAPI,
  notifications:     notificationsAPI,
  agent: {
    deliveries: agentDeliveriesAPI,
    refills:    agentRefillsAPI,
    cylinders:  agentCylindersAPI,
  },
  customer: {
    deliveries: customerDeliveriesAPI,
    remnant:    customerRemnantAPI,
    cylinders:  customerCylindersAPI,
  },
  auth: authAPI,
};

export default adminAPI;
⚠️ Note on /admin/:id paths for settlements: adminSettlementRoutes.js currently mounts at /api/v1/admin and uses /:id, so GET /api/v1/admin/<id> and PATCH /api/v1/admin/<id>/approve are the working paths. This is fragile — I recommend you change the route file to router.use('/settlements', ...) in a follow-up; the frontend is coded to work with the current backend, but the endpoint names above reflect what actually resolves today. If you can update adminSettlementRoutes.js to mount at /admin/settlements, tell me and I'll switch to /admin/settlements/:id for cleaner API. Either works — just needs to match.

File 4 of 7 — src/hooks/useApi.js
Standard data-fetch hook. Handles loading, error, refetch, and (optional) auto-toast on error.

js
// src/hooks/useApi.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from './useSnackbar';

/**
 * useApi — a stable hook for backend calls that use
 * the `{ success, message, data }` envelope.
 *
 * Usage:
 *   const { data, loading, error, execute, refetch } = useApi(
 *     () => adminUsersAPI.list({ page: 1 }),
 *     { immediate: true, errorToast: true }
 *   );
 *
 * execute() lets you re-run with new args:
 *   const { execute } = useApi((page) => adminUsersAPI.list({ page }));
 *   execute(2);
 */
export const useApi = (fetcher, options = {}) => {
  const {
    immediate = false,
    errorToast = true,
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const { error: showError } = useSnackbar();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(...args);
      // Backend envelope: { success, message, data }
      const body = res?.data ?? res;
      if (!mountedRef.current || reqId !== requestIdRef.current) return null;

      if (body?.success === false) {
        const msg = body?.message || 'Request failed';
        setError(msg);
        if (errorToast) showError(msg);
        onError?.(msg);
        return null;
      }

      setData(body?.data ?? body);
      onSuccess?.(body);
      return body;
    } catch (err) {
      if (!mountedRef.current || reqId !== requestIdRef.current) return null;
      const msg = err?.message || 'Network error';
      setError(msg);
      if (errorToast) showError(msg);
      onError?.(msg);
      return null;
    } finally {
      if (mountedRef.current && reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, errorToast, onSuccess, onError, showError]);

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { data, loading, error, execute, refetch: execute };
};

export default useApi;
File 5 of 7 — src/contexts/LiveContext.jsx
Socket.IO wired to the same auth token and the exact rooms the backend already joins. Exposes useLiveEvent and useLiveRoom.

jsx
// src/contexts/LiveContext.jsx
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from '../hooks/useSnackbar';

const LiveContext = createContext(null);

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_BASE?.replace(/\/api\/?.*$/, '') ||
  'https://egas-server-1.onrender.com';

export const LiveProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { info } = useSnackbar();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map()); // event → Set<handler>
  const [connected, setConnected] = useState(false);

  // Connect / disconnect based on auth
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Tear down if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Token from the cookie — Socket.IO sends cookies automatically
    // when withCredentials is true. Fallback header auth is unused here
    // because backend requires token via socket.handshake.auth.token.
    const token = getTokenFromCookie();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });
    socket.on('disconnect', () => {
      setConnected(false);
    });
    socket.on('connect_error', (err) => {
      console.warn('[Live] socket connect_error:', err.message);
    });

    // Universal "safety net": any notification.new event fires a toast
    const onNotificationNew = (payload) => {
      if (payload?.priority === 'high') {
        info(payload.title || 'New notification');
      }
    };
    socket.on('notification.new', onNotificationNew);

    return () => {
      socket.off('notification.new', onNotificationNew);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user, info]);

  // Subscribe
  const subscribe = useCallback((event, handler) => {
    if (!event || typeof handler !== 'function') return () => {};
    // Attach to local set
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(handler);
    // Attach to socket if connected
    socketRef.current?.on(event, handler);

    // Return unsubscribe
    return () => {
      listenersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler);
    };
  }, []);

  // On reconnect, re-attach all listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onReconnect = () => {
      listenersRef.current.forEach((handlers, event) => {
        handlers.forEach((h) => socket.on(event, h));
      });
    };
    socket.on('reconnect', onReconnect);
    return () => socket.off('reconnect', onReconnect);
  }, [connected]);

  const value = { connected, subscribe, socket: socketRef.current };
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
};

export const useLive = () => {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used within <LiveProvider>');
  return ctx;
};

/**
 * Subscribe to a socket event.
 *   useLiveEvent('delivery.post_fill_recorded', (payload) => { ... });
 */
export const useLiveEvent = (event, handler) => {
  const { subscribe } = useLive();
  useEffect(() => {
    if (!event || typeof handler !== 'function') return;
    const unsub = subscribe(event, handler);
    return unsub;
  }, [event, handler, subscribe]);
};

/**
 * Join a room keyed to a resource ID.
 *   useLiveRoom('order', orderId);
 * Backend joins order:{id} on `track-order`; user/agent/plant/admin rooms
 * are joined automatically on connect.
 */
export const useLiveRoom = (prefix, id) => {
  const { socket } = useLive();
  useEffect(() => {
    if (!socket || !id) return;
    if (prefix === 'order') {
      socket.emit('track-order', id);
    }
    // Other rooms are auto-joined by the server based on role.
  }, [socket, prefix, id]);
};

// ---------- helpers ----------
function getTokenFromCookie() {
  // Backend sets accessToken as httpOnly cookie.
  // Socket.IO on same-origin will send cookies automatically.
  // But the server middleware also accepts `socket.handshake.auth.token`,
  // so read from localStorage if it's mirrored there (login flow does this).
  try {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || undefined;
  } catch {
    return undefined;
  }
}
If your backend never mirrored the JWT to localStorage and relies purely on the httpOnly cookie, remove auth: { token } above — Socket.IO on the same origin will send the cookie and the backend middleware in server.js reads socket.handshake.auth.token only. If that's the case, tell me and I'll wire an override (e.g., decode user.id from the auth context and use the userId room only). For now it works either way because backend falls back to socket.handshake.auth.token — which the login page stores in localStorage.token.

File 6 of 7 — src/hooks/useNotificationFeed.js
Bell-icon feed. Loads on mount, updates on notification.new, exposes unread count and mark-read helpers.

js
// src/hooks/useNotificationFeed.js
import { useCallback, useEffect, useState } from 'react';
import { notificationsAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useLiveEvent } from '../contexts/LiveContext';

export const useNotificationFeed = ({ pageSize = 15 } = {}) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [listRes, countsRes] = await Promise.all([
        notificationsAPI.list({ limit: pageSize }),
        notificationsAPI.counts(),
      ]);
      const listBody = listRes.data;
      const countsBody = countsRes.data;
      if (listBody?.success) setItems(listBody.data || []);
      if (countsBody?.success) setUnread(countsBody.data?.unread || 0);
    } catch (err) {
      console.warn('[notif feed] load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pageSize]);

  useEffect(() => { load(); }, [load]);

  // Live updates from backend queue worker
  useLiveEvent('notification.new', (payload) => {
    if (!payload) return;
    setItems((prev) => [payload, ...prev].slice(0, pageSize));
    setUnread((n) => n + 1);
  });

  const markOneRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date() } : n))
      );
      setUnread((n) => Math.max(0, n - 1));
    } catch (err) {
      console.warn('[notif feed] mark read error:', err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date() })));
      setUnread(0);
    } catch (err) {
      console.warn('[notif feed] mark all read error:', err.message);
    }
  };

  return {
    items,
    unread,
    loading,
    open,
    setOpen,
    reload: load,
    markOneRead,
    markAllRead,
  };
};

export default useNotificationFeed;
File 7 of 7 — Backend patch: services/notifications/notificationDispatcher.js
Append one new method to the Dispatcher object. Paste this inside the object literal, right after the refillCollectedFromPlant(...) method (or at the end of the refill section, before walletTopupSuccess). No existing method is modified.

js
// ────────────────────────────────────────────────────────────
// ADD inside the Dispatcher object literal, in the "REFILL"
// section, e.g. right after refillCollectedFromPlant(...).
// ────────────────────────────────────────────────────────────

/**
 * refillRequestUpdate — status-change fanout used by plantRefillController.
 *
 * Called from:
 *   - plantRefillController.receiveCylinder
 *   - plantRefillController.submitInspection
 *   - plantRefillController.confirmRefill
 *   - plantRefillController.collectFromPlant
 *
 * Fires an in-app notification to the agent (and SMS if the agent
 * has a verified phone and the status is high-priority). Never throws.
 */
refillRequestUpdate(agentOrId, request, status) {
  if (!agentOrId || !request || !status) return;

  const titles = {
    received:   'Cylinder received at plant',
    approved:   'Refill approved — starting refill',
    rejected:   'Refill rejected — retry at another plant',
    confirmed:  'Refill confirmed — ready for collection',
    collected:  'Cylinder collected',
  };

  const messages = {
    received:   `Plant has your cylinder for ${request.requestNumber}.`,
    approved:   `Inspection passed for ${request.requestNumber}. Refilling in progress.`,
    rejected:   request.rejectedReason
                  ? `Inspection rejected: ${request.rejectedReason}`
                  : `Refill ${request.requestNumber} was rejected at the plant.`,
    confirmed:  `${request.plantConfirmedQuantity || '?'}kg filled. Collect now.`,
    collected:  `${request.requestNumber} collected. Proceed to customer.`,
  };

  const highPriority = status === 'rejected' || status === 'confirmed';

  // Resolve agent id (accepts ObjectId, populated user, or string)
  const agentId =
    (typeof agentOrId === 'object' && agentOrId !== null
      ? agentOrId._id || agentOrId.id
      : agentOrId) || null;

  if (!agentId) return;

  queueInApp({
    userId: agentId,
    title: titles[status] || `Refill update: ${status}`,
    message: messages[status] || `Refill ${request.requestNumber} is now ${status}.`,
    type: 'refill',
    subType: `refill_request_${status}`,
    relatedId: request._id,
    relatedModel: 'PlantRefillRequest',
    priority: highPriority ? 'high' : 'medium',
    sentVia: ['in_app'],
    idempotencyKey: `refill_${status}:${request._id}`,
  }, { jobId: `refill_${status}:${request._id}` });
},
Nothing else changes. Every other dispatcher call stays exactly as it is. This resolves the 4 dispatcher.refillRequestUpdate(...) calls in plantRefillController that would otherwise 500.

(Optional, if you want SMS to agents too — add below the queueInApp call, still inside the method)

js
if (highPriority) {
  const User = require('../../models/User');
  User.findById(agentId).select('phone phoneVerified').lean()
    .then((agent) => {
      if (agent?.phone && agent.phoneVerified) {
        queueSms({
          phone: agent.phone,
          message: `E-Gas refill ${status}: ${request.requestNumber}. ${messages[status] || ''}`,
          type: `refill_request_${status}`,
          userId: agentId,
        }, { jobId: `refill_${status}:${request._id}:sms` });
      }
    })
    .catch(() => {});
}
What to verify after pasting Batch 1
endpoints.js — call one admin endpoint from a component (e.g., adminUsersAPI.list({ limit: 5 })) → returns res.data.success === true.

Agent pre-fill — from /delivery/dashboard, open a delivery with cylinderId and plantWorkflowStatus === 'agent_collected_from_customer', then call agentDeliveriesAPI.recordPreFill(id, { measuredWeight: 6.2 }). Should return the pre-fill record and NOT credit remnant.

Agent post-fill — agentDeliveriesAPI.recordPostFill(id, { measuredWeight: 6.7 }). Should credit remnant to the ledger, set plantWorkflowStatus: 'remnant_credited', and fire delivery.post_fill_recorded socket event.

Socket — subscribe useLiveEvent('delivery.post_fill_recorded', console.log) and confirm it fires from the agent's own tab (or an admin's tab) when a post-fill is recorded.

Notification bell — trigger a plantRefillController.submitInspection with outcome: 'rejected'; the agent's bell unread count should increment live via notification.new (or fall back to reload if socket isn't connected yet).

RBAC — log in as delivery; the browser's usePermissions().hasPermission('users:read') should be false; as admin it should be true.

What's next (Batch 2)
components/ui/* — Button, Card, Modal, DataTable, FormField, FormRow, Badge, StatusPill, PageHeader, EmptyState, SkeletonLoader, StatCard, ConfirmDialog, Drawer, Pagination, Tabs, FilterBar, FormValidator — plus styles/tokens.css and one small CSS file per primitive.

That's the visual foundation that will let me refactor every existing screen (users, subs, deliveries, reports, settings) and build every new page (refills, cylinders, remnant, disputes, settlements, plants, config) with zero duplicated CSS.

Say "Batch 2" when you've verified Batch 1 (or if you'd rather I push straight through without you testing, say "skip to Batch 2" — but I recommend verifying 1 first, because everything else sits on top of endpoints.js and usePermissions).

proceed to Batch 2
Batch 2 — UI Primitives + Design Tokens
This batch is the visual foundation. Every subsequent page (existing + new) will reuse these primitives. No feature logic lives here — pure UI building blocks.

10 files + 1 CSS index. All drop-in.

File 1 — src/styles/tokens.css
Single source of truth for colors, spacing, shadows, typography. Dark mode included.

css
/* src/styles/tokens.css */
:root {
  /* ─── Brand ─── */
  --egas-primary: #6f42c1;
  --egas-primary-hover: #5a32a3;
  --egas-primary-soft: #ede7f6;
  --egas-primary-border: #d8c9ee;

  /* ─── Semantic ─── */
  --color-success: #10b981;
  --color-success-soft: #d1fae5;
  --color-success-border: #a7f3d0;

  --color-warning: #f59e0b;
  --color-warning-soft: #fef3c7;
  --color-warning-border: #fde68a;

  --color-danger: #dc2626;
  --color-danger-soft: #fee2e2;
  --color-danger-border: #fecaca;

  --color-info: #0ea5e9;
  --color-info-soft: #e0f2fe;
  --color-info-border: #bae6fd;

  /* ─── Domain accents ─── */
  --color-partial: #f39c12;
  --color-partial-soft: #fff3cd;
  --color-remnant: #8b5cf6;
  --color-remnant-soft: #f3e8ff;
  --color-remnant-border: #ddd6fe;
  --color-refill: #0ea5e9;
  --color-settlement: #059669;

  /* ─── Neutrals ─── */
  --gray-25: #fcfcfd;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* ─── Text ─── */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-muted: var(--gray-500);
  --text-inverse: #ffffff;

  /* ─── Surfaces ─── */
  --surface: #ffffff;
  --surface-alt: var(--gray-50);
  --surface-elevated: #ffffff;
  --border: var(--gray-200);
  --border-strong: var(--gray-300);

  /* ─── Spacing (4px scale) ─── */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;

  /* ─── Radius ─── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ─── Shadow ─── */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.16);

  /* ─── Typography ─── */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  --fs-xs: 0.75rem;   /* 12px */
  --fs-sm: 0.875rem;  /* 14px */
  --fs-base: 1rem;    /* 16px */
  --fs-lg: 1.125rem;  /* 18px */
  --fs-xl: 1.25rem;   /* 20px */
  --fs-2xl: 1.5rem;   /* 24px */
  --fs-3xl: 1.875rem; /* 30px */

  --fw-normal: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700;

  --lh-tight: 1.25;
  --lh-normal: 1.5;
  --lh-relaxed: 1.65;

  /* ─── Transitions ─── */
  --t-fast: 150ms ease;
  --t-base: 200ms ease;
  --t-slow: 300ms ease;

  /* ─── Z-index ─── */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-overlay: 900;
  --z-modal: 1000;
  --z-toast: 1100;

  /* ─── Layout ─── */
  --sidebar-width: 260px;
  --sidebar-width-collapsed: 72px;
  --header-height: 64px;
}

/* ============================================================
 * DARK MODE
 * ============================================================ */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;

    --surface: #0f172a;
    --surface-alt: #1e293b;
    --surface-elevated: #1e293b;
    --border: #334155;
    --border-strong: #475569;

    --gray-25: #0b1220;
    --gray-50: #0f172a;
    --gray-100: #1e293b;
    --gray-200: #334155;
    --gray-300: #475569;
    --gray-400: #64748b;
    --gray-500: #94a3b8;
    --gray-600: #cbd5e1;
    --gray-700: #e2e8f0;
    --gray-800: #f1f5f9;
    --gray-900: #f8fafc;

    --egas-primary-soft: #2e1065;
    --egas-primary-border: #4c1d95;

    --color-success-soft: #064e3b;
    --color-success-border: #065f46;
    --color-warning-soft: #78350f;
    --color-warning-border: #92400e;
    --color-danger-soft: #7f1d1d;
    --color-danger-border: #991b1b;
    --color-info-soft: #0c4a6e;
    --color-info-border: #075985;

    --color-remnant-soft: #3b0764;
    --color-remnant-border: #581c87;

    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 10px 32px rgba(0, 0, 0, 0.6);
  }
}

/* ============================================================
 * REDUCED MOTION
 * ============================================================ */
@media (prefers-reduced-motion: reduce) {
  :root {
    --t-fast: 0ms;
    --t-base: 0ms;
    --t-slow: 0ms;
  }
}

/* ============================================================
 * BASE RESET + TYPOGRAPHY
 * ============================================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  color: var(--text-primary);
  background: var(--surface-alt);
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  color: var(--text-primary);
}

h1 { font-size: var(--fs-2xl); }
h2 { font-size: var(--fs-xl); }
h3 { font-size: var(--fs-lg); }
h4 { font-size: var(--fs-base); }

p {
  margin: 0;
  line-height: var(--lh-relaxed);
}

a {
  color: var(--egas-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
  font-size: inherit;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

code, pre {
  font-family: var(--font-mono);
  font-size: 0.9em;
}
File 2 — src/components/ui/Button.jsx + styles/components/button.css
jsx
// src/components/ui/Button.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Button — primary action primitive.
 *
 * Variants:  primary | secondary | outline | ghost | danger | success | warning
 * Sizes:     sm | md | lg
 *
 * Props:
 *   loading    — shows spinner, disables interaction
 *   leftIcon   — ReactNode rendered before the label
 *   rightIcon  — ReactNode rendered after the label
 *   fullWidth  — stretch to container
 *   as         — 'button' (default) | 'a' | custom
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  ...rest
}, ref) => {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth && 'ui-btn--full',
    loading && 'ui-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={loading || disabled ? undefined : onClick}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <FaSpinner className="ui-btn__spinner" />
      ) : (
        leftIcon && <span className="ui-btn__icon">{leftIcon}</span>
      )}
      {children && <span className="ui-btn__label">{children}</span>}
      {!loading && rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
css
/* src/styles/components/button.css */
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--t-fast),
    color var(--t-fast),
    border-color var(--t-fast),
    box-shadow var(--t-fast),
    transform var(--t-fast);
  white-space: nowrap;
  text-decoration: none;
  user-select: none;
  min-height: 38px;
}

.ui-btn:focus-visible {
  outline: 2px solid var(--egas-primary);
  outline-offset: 2px;
}

.ui-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.ui-btn:disabled,
.ui-btn--loading {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ─── Sizes ─── */
.ui-btn--sm {
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--fs-xs);
  min-height: 30px;
  gap: var(--sp-1);
}

.ui-btn--lg {
  padding: var(--sp-4) var(--sp-6);
  font-size: var(--fs-base);
  min-height: 46px;
}

.ui-btn--full {
  width: 100%;
}

/* ─── Variants ─── */
.ui-btn--primary {
  background: var(--egas-primary);
  color: var(--text-inverse);
}
.ui-btn--primary:hover:not(:disabled) {
  background: var(--egas-primary-hover);
  box-shadow: var(--shadow-sm);
}

.ui-btn--secondary {
  background: var(--gray-100);
  color: var(--text-primary);
  border-color: var(--border);
}
.ui-btn--secondary:hover:not(:disabled) {
  background: var(--gray-200);
}

.ui-btn--outline {
  background: transparent;
  color: var(--egas-primary);
  border-color: var(--egas-primary);
}
.ui-btn--outline:hover:not(:disabled) {
  background: var(--egas-primary-soft);
}

.ui-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.ui-btn--ghost:hover:not(:disabled) {
  background: var(--surface-alt);
  color: var(--text-primary);
}

.ui-btn--danger {
  background: var(--color-danger);
  color: var(--text-inverse);
}
.ui-btn--danger:hover:not(:disabled) {
  background: #b91c1c;
  box-shadow: var(--shadow-sm);
}

.ui-btn--success {
  background: var(--color-success);
  color: var(--text-inverse);
}
.ui-btn--success:hover:not(:disabled) {
  background: #059669;
  box-shadow: var(--shadow-sm);
}

.ui-btn--warning {
  background: var(--color-warning);
  color: #1f2937;
}
.ui-btn--warning:hover:not(:disabled) {
  background: #d97706;
  color: var(--text-inverse);
}

/* ─── Icon helpers ─── */
.ui-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95em;
}

.ui-btn__spinner {
  animation: ui-btn-spin 0.8s linear infinite;
}

@keyframes ui-btn-spin {
  to { transform: rotate(360deg); }
}

/* Icon-only buttons */
.ui-btn--icon-only {
  padding: var(--sp-2);
  min-width: 32px;
}
File 3 — src/components/ui/Card.jsx + styles/components/card.css
jsx
// src/components/ui/Card.jsx
import React from 'react';

/**
 * Card — container primitive.
 *
 * Props:
 *   title       — header title
 *   subtitle    — header subtitle
 *   actions     — ReactNode rendered on the right of the header
 *   padding     — 'none' | 'sm' | 'md' (default) | 'lg'
 *   elevated    — adds stronger shadow
 *   clickable   — adds hover + focus affordance
 *   onClick     — if provided with clickable, makes the whole card interactive
 */
const Card = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  elevated = false,
  clickable = false,
  onClick,
  className = '',
  style,
  ...rest
}) => {
  const hasHeader = title || subtitle || actions;

  const classes = [
    'ui-card',
    `ui-card--pad-${padding}`,
    elevated && 'ui-card--elevated',
    clickable && 'ui-card--clickable',
    className,
  ].filter(Boolean).join(' ');

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      style={style}
      {...rest}
    >
      {hasHeader && (
        <div className="ui-card__header">
          <div className="ui-card__header-text">
            {title && <h3 className="ui-card__title">{title}</h3>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </div>
      )}
      <div className="ui-card__body">{children}</div>
    </div>
  );
};

export default Card;
css
/* src/styles/components/card.css */
.ui-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  transition: box-shadow var(--t-fast), transform var(--t-fast);
}

.ui-card--elevated {
  box-shadow: var(--shadow-md);
}

.ui-card--clickable {
  cursor: pointer;
}
.ui-card--clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.ui-card--clickable:focus-visible {
  outline: 2px solid var(--egas-primary);
  outline-offset: 2px;
}

.ui-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--border);
  background: var(--surface-alt);
}

.ui-card__header-text {
  flex: 1;
  min-width: 0;
}

.ui-card__title {
  margin: 0 0 var(--sp-1) 0;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.ui-card__subtitle {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: var(--lh-normal);
}

.ui-card__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.ui-card__body {
  padding: var(--sp-6);
}

/* Padding variants */
.ui-card--pad-none .ui-card__body { padding: 0; }
.ui-card--pad-sm   .ui-card__body { padding: var(--sp-4); }
.ui-card--pad-lg   .ui-card__body { padding: var(--sp-8); }

/* Headerless cards: remove border if body is only child */
.ui-card > .ui-card__body:only-child {
  /* keep default padding */
}

@media (max-width: 640px) {
  .ui-card__header {
    flex-direction: column;
    align-items: stretch;
  }
  .ui-card__actions {
    justify-content: flex-end;
  }
  .ui-card__body {
    padding: var(--sp-4);
  }
}
File 4 — src/components/ui/Modal.jsx + styles/components/modal.css
jsx
// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal — dialog primitive.
 *
 * Props:
 *   open        — boolean
 *   onClose     — called when user dismisses (Escape, backdrop, X, cancel)
 *   title       — string | ReactNode
 *   subtitle    — string | ReactNode
 *   size        — 'sm' | 'md' | 'lg' | 'xl'
 *   footer      — ReactNode rendered in footer (buttons usually)
 *   closeOnBackdrop — default true
 *   closeOnEsc  — default true
 *   loading     — disables close during save
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer = null,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  loading = false,
  className = '',
}) => {
  const dialogRef = useRef(null);

  // Escape to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose, loading]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus first focusable element
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const first = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus?.();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="ui-modal-overlay"
      onMouseDown={handleBackdrop}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`ui-modal ui-modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ui-modal-title' : undefined}
      >
        {(title || subtitle) && (
          <div className="ui-modal__header">
            <div className="ui-modal__header-text">
              {title && (
                <h2 id="ui-modal-title" className="ui-modal__title">{title}</h2>
              )}
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="ui-modal__body">{children}</div>

        {footer && (
          <div className="ui-modal__footer">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
css
/* src/styles/components/modal.css */
.ui-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
  z-index: var(--z-modal-overlay);
  animation: ui-modal-fade-in 150ms ease-out;
}

.ui-modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ui-modal-slide-up 200ms ease-out;
  z-index: var(--z-modal);
}

.ui-modal--sm { max-width: 420px; }
.ui-modal--md { max-width: 580px; }
.ui-modal--lg { max-width: 780px; }
.ui-modal--xl { max-width: 1040px; }

.ui-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--border);
  background: var(--surface-alt);
}

.ui-modal__header-text {
  flex: 1;
  min-width: 0;
}

.ui-modal__title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.ui-modal__subtitle {
  margin: var(--sp-1) 0 0 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.ui-modal__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.ui-modal__close:hover:not(:disabled) {
  background: var(--gray-200);
  color: var(--text-primary);
}
.ui-modal__close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-6);
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-6);
  border-top: 1px solid var(--border);
  background: var(--surface-alt);
  flex-wrap: wrap;
}

@keyframes ui-modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ui-modal-slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 640px) {
  .ui-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .ui-modal {
    max-width: 100% !important;
    max-height: 90vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation: ui-modal-slide-up-mobile 220ms ease-out;
  }
  .ui-modal__header,
  .ui-modal__body,
  .ui-modal__footer {
    padding: var(--sp-4);
  }
  .ui-modal__footer {
    flex-direction: column-reverse;
  }
  .ui-modal__footer > * {
    width: 100%;
  }
}

@keyframes ui-modal-slide-up-mobile {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
File 5 — src/components/ui/DataTable.jsx + styles/components/table.css
Replaces 5 hand-rolled tables (users, subscriptions, deliveries, reports, support). Supports mobile card fallback.

jsx
// src/components/ui/DataTable.jsx
import React, { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa';

/**
 * DataTable — the one table primitive.
 *
 * columns: [
 *   { key: 'name', label: 'Name', sortable: true, render: (row) => <b>{row.name}</b> },
 *   { key: 'email', label: 'Email', mobileHide: false },
 * ]
 *
 * Props:
 *   columns          — column definitions
 *   data             — array of rows
 *   loading          — bool
 *   emptyState       — ReactNode to show when data is empty
 *   searchable       — default true
 *   pagination       — false to disable; or { page, pageSize, total, onChange }
 *   sortable         — default true
 *   selectable       — adds checkbox column
 *   selectedIds      — Set of selected ids (row.id)
 *   onSelectionChange— (newIds: Array) => void
 *   rowKey           — (row) => id (defaults to row.id || row._id)
 *   onRowClick       — (row) => void
 *   mobileView       — 'cards' (default) | 'table'
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  searchable = true,
  pagination = false,
  sortable = true,
  selectable = false,
  selectedIds,
  onSelectionChange,
  rowKey = (row) => row?.id ?? row?._id,
  onRowClick,
  mobileView = 'cards',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const pageSize = pagination?.pageSize ?? 20;

  // ─── Filter + sort
  const processed = useMemo(() => {
    let rows = data;

    if (searchable && searchTerm.trim()) {
      const needle = searchTerm.trim().toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const v = row?.[col.key];
          return v != null && String(v).toLowerCase().includes(needle);
        })
      );
    }

    if (sortable && sortConfig.key) {
      rows = [...rows].sort((a, b) => {
        const av = a?.[sortConfig.key];
        const bv = b?.[sortConfig.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortConfig.direction === 'asc' ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as < bs) return sortConfig.direction === 'asc' ? -1 : 1;
        if (as > bs) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, columns, searchTerm, searchable, sortable, sortConfig]);

  // ─── Pagination
  const total = processed.length;
  const totalPages = pagination
    ? (pagination.total && pagination.total !== total
        ? Math.ceil(pagination.total / pageSize)
        : Math.ceil(total / pageSize))
    : 1;
  const safePage = pagination ? (pagination.page ?? page) : 1;
  const paginated = pagination
    ? (pagination.total && pagination.total !== total ? processed : processed.slice((safePage - 1) * pageSize, safePage * pageSize))
    : processed;

  const changePage = (next) => {
    if (pagination?.onChange) pagination.onChange(next);
    else setPage(next);
  };

  const toggleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ─── Selection
  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(paginated.map(rowKey));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    const set = new Set(selectedIds || []);
    if (checked) set.add(id); else set.delete(id);
    onSelectionChange(Array.from(set));
  };

  const allSelected = paginated.length > 0 &&
    paginated.every((row) => selectedIds?.has?.(rowKey(row)));

  const someSelected = (selectedIds?.size || 0) > 0 && !allSelected;

  // ─── Render
  return (
    <div className="ui-table-wrapper">
      {searchable && (
        <div className="ui-table__toolbar">
          <div className="ui-table__search">
            <FaSearch className="ui-table__search-icon" />
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button
                type="button"
                className="ui-table__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className={`ui-table-container ui-table-container--${mobileView}`}>
        <table className="ui-table">
          <thead>
            <tr>
              {selectable && (
                <th className="ui-table__select-col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${sortable && col.sortable !== false ? 'ui-table__th--sortable' : ''} ${col.align === 'right' ? 'ui-table__th--right' : ''}`}
                  onClick={() => sortable && col.sortable !== false && toggleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {sortable && col.sortable !== false && sortConfig.key === col.key && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ui-table__sort-icon`} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="ui-table__state">
                  <div className="ui-table__state-inner">
                    <i className="fas fa-spinner fa-spin" />
                    <span>Loading…</span>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="ui-table__state">
                  <div className="ui-table__state-inner">
                    {emptyState || (
                      <>
                        <i className="fas fa-inbox" />
                        <span>No records found</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row) => {
                const id = rowKey(row);
                const isSelected = selectedIds?.has?.(id);
                return (
                  <tr
                    key={id}
                    className={`${isSelected ? 'ui-table__row--selected' : ''} ${onRowClick ? 'ui-table__row--clickable' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="ui-table__select-col" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={col.align === 'right' ? 'ui-table__td--right' : ''}
                        data-label={col.label}
                      >
                        {col.render ? col.render(row) : row?.[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {(pagination || !searchable) && (
        <div className="ui-table__footer">
          <div className="ui-table__info">
            {total > 0
              ? `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, pagination?.total ?? total)} of ${pagination?.total ?? total}`
              : 'No records'}
          </div>
          {pagination && totalPages > 1 && (
            <div className="ui-table__pagination">
              <button
                type="button"
                className="ui-pagination-btn"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>
              <span className="ui-pagination__label">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="ui-pagination-btn"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
css
/* src/styles/components/table.css */
.ui-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}

.ui-table__toolbar {
  display: flex;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-bottom: 1px solid var(--border);
  background: var(--surface-alt);
}

.ui-table__search {
  position: relative;
  flex: 1;
  max-width: 380px;
}

.ui-table__search-icon {
  position: absolute;
  left: var(--sp-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.ui-table__search input {
  width: 100%;
  padding: var(--sp-2) var(--sp-8) var(--sp-2) var(--sp-8);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  background: var(--surface);
  color: var(--text-primary);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.ui-table__search input:focus {
  outline: none;
  border-color: var(--egas-primary);
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.12);
}

.ui-table__search-clear {
  position: absolute;
  right: var(--sp-2);
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.7rem;
}
.ui-table__search-clear:hover {
  background: var(--gray-200);
  color: var(--text-primary);
}

.ui-table-container {
  overflow-x: auto;
}

.ui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}

.ui-table thead th {
  text-align: left;
  padding: var(--sp-3) var(--sp-4);
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.ui-table__th--sortable {
  cursor: pointer;
  user-select: none;
}
.ui-table__th--sortable:hover {
  color: var(--text-primary);
  background: var(--gray-100);
}

.ui-table__th--right {
  text-align: right;
}

.ui-table__sort-icon {
  margin-left: var(--sp-1);
  font-size: 0.7rem;
  opacity: 0.6;
}

.ui-table tbody td {
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  vertical-align: middle;
}

.ui-table tbody tr:last-child td {
  border-bottom: none;
}

.ui-table tbody tr:hover {
  background: var(--surface-alt);
}

.ui-table__row--clickable {
  cursor: pointer;
}

.ui-table__row--selected {
  background: var(--egas-primary-soft) !important;
}

.ui-table__td--right {
  text-align: right;
}

.ui-table__select-col {
  width: 40px;
  text-align: center;
}

.ui-table__select-col input {
  cursor: pointer;
}

.ui-table__state {
  padding: var(--sp-12) var(--sp-6) !important;
  text-align: center;
}

.ui-table__state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  color: var(--text-muted);
}

.ui-table__state-inner i {
  font-size: 1.75rem;
  opacity: 0.5;
}

.ui-table__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-3) var(--sp-5);
  border-top: 1px solid var(--border);
  background: var(--surface-alt);
  flex-wrap: wrap;
  gap: var(--sp-3);
}

.ui-table__info {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.ui-table__pagination {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.ui-pagination-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--t-fast);
}
.ui-pagination-btn:hover:not(:disabled) {
  border-color: var(--egas-primary);
  color: var(--egas-primary);
}
.ui-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-pagination__label {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  padding: 0 var(--sp-2);
}

/* ─── Mobile card view ─── */
@media (max-width: 768px) {
  .ui-table-container--cards .ui-table thead {
    display: none;
  }
  .ui-table-container--cards .ui-table,
  .ui-table-container--cards .ui-table tbody,
  .ui-table-container--cards .ui-table tr,
  .ui-table-container--cards .ui-table td {
    display: block;
    width: 100%;
  }
  .ui-table-container--cards .ui-table tbody tr {
    border-bottom: 1px solid var(--border);
    padding: var(--sp-3) var(--sp-4);
  }
  .ui-table-container--cards .ui-table tbody tr:last-child {
    border-bottom: none;
  }
  .ui-table-container--cards .ui-table tbody td {
    padding: var(--sp-2) 0;
    border: none;
    display: flex;
    justify-content: space-between;
    gap: var(--sp-3);
    text-align: right;
  }
  .ui-table-container--cards .ui-table tbody td::before {
    content: attr(data-label);
    font-size: var(--fs-xs);
    font-weight: var(--fw-semibold);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
    flex-shrink: 0;
  }
  .ui-table-container--cards .ui-table__select-col {
    justify-content: flex-end;
  }
  .ui-table-container--cards .ui-table__select-col::before {
    content: 'Select';
  }
  .ui-table__footer {
    justify-content: center;
  }
}
File 6 — src/components/ui/FormField.jsx + styles/components/form.css
jsx
// src/components/ui/FormField.jsx
import React from 'react';

/**
 * FormField — label + input/select/textarea + error + help text.
 *
 * Usage:
 *   <FormField label="Email" name="email" type="email" required
 *              value={email} onChange={handleChange} error={errors.email} />
 *
 *   <FormField label="Category" name="category" as="select" value={cat}
 *              onChange={handleChange}>
 *     <option value="gas">Gas</option>
 *     <option value="accessory">Accessory</option>
 *   </FormField>
 */
const FormField = React.forwardRef(({
  label,
  name,
  type = 'text',
  as = 'input',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  help,
  rows,
  min,
  max,
  step,
  maxLength,
  autoComplete,
  children, // for `as="select"`
  leftIcon,
  rightSlot,
  className = '',
  ...rest
}, ref) => {
  const id = `field-${name}`;
  const FieldTag = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';
  const hasError = Boolean(error);

  return (
    <div className={`ui-field ${hasError ? 'ui-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="ui-field__label">
          {label}
          {required && <span className="ui-field__required" aria-hidden>*</span>}
        </label>
      )}

      <div className={`ui-field__control ${leftIcon ? 'ui-field__control--with-icon' : ''}`}>
        {leftIcon && <span className="ui-field__icon">{leftIcon}</span>}
        <FieldTag
          ref={ref}
          id={id}
          name={name}
          type={FieldTag === 'input' ? type : undefined}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={FieldTag === 'textarea' ? rows ?? 3 : undefined}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : help ? `${id}-help` : undefined}
          {...rest}
        >
          {children}
        </FieldTag>
        {rightSlot && <span className="ui-field__right">{rightSlot}</span>}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="ui-field__error">{error}</p>
      )}
      {!hasError && help && (
        <p id={`${id}-help`} className="ui-field__help">{help}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
export default FormField;
jsx
// src/components/ui/FormRow.jsx
import React from 'react';

/**
 * FormRow — grid of FormField children.
 * cols: 1 | 2 (default) | 3
 */
const FormRow = ({ children, cols = 2, className = '' }) => (
  <div className={`ui-form-row ui-form-row--cols-${cols} ${className}`}>
    {children}
  </div>
);

export default FormRow;
css
/* src/styles/components/form.css */
.ui-form-row {
  display: grid;
  gap: var(--sp-4);
}

.ui-form-row--cols-1 { grid-template-columns: 1fr; }
.ui-form-row--cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ui-form-row--cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (max-width: 640px) {
  .ui-form-row--cols-2,
  .ui-form-row--cols-3 {
    grid-template-columns: 1fr;
  }
}

.ui-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.ui-field__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
}

.ui-field__required {
  color: var(--color-danger);
  margin-left: var(--sp-1);
}

.ui-field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-field__control--with-icon input,
.ui-field__control--with-icon textarea,
.ui-field__control--with-icon select {
  padding-left: var(--sp-8);
}

.ui-field__icon {
  position: absolute;
  left: var(--sp-3);
  color: var(--text-muted);
  font-size: var(--fs-sm);
  pointer-events: none;
}

.ui-field__right {
  position: absolute;
  right: var(--sp-2);
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.ui-field input,
.ui-field select,
.ui-field textarea {
  width: 100%;
  padding: var(--sp-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  color: var(--text-primary);
  background: var(--surface);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.ui-field input:focus,
.ui-field select:focus,
.ui-field textarea:focus {
  outline: none;
  border-color: var(--egas-primary);
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.12);
}

.ui-field input:disabled,
.ui-field select:disabled,
.ui-field textarea:disabled {
  background: var(--surface-alt);
  color: var(--text-muted);
  cursor: not-allowed;
}

.ui-field input[readonly] {
  background: var(--surface-alt);
}

.ui-field textarea {
  resize: vertical;
  min-height: 72px;
  font-family: var(--font-sans);
}

.ui-field--error input,
.ui-field--error select,
.ui-field--error textarea {
  border-color: var(--color-danger);
}
.ui-field--error input:focus,
.ui-field--error select:focus,
.ui-field--error textarea:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.ui-field__error {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-danger);
}

.ui-field__help {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
File 7 — src/components/ui/Badge.jsx + styles/components/badge.css
jsx
// src/components/ui/Badge.jsx
import React from 'react';

/**
 * Badge — status/label chip.
 *
 * Variants:
 *   success | warning | danger | info | neutral | primary | remnant | partial
 *
 * Sizes: sm | md
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon = null,
  dot = false,
  className = '',
  ...rest
}) => (
  <span
    className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}
    {...rest}
  >
    {dot && <span className="ui-badge__dot" />}
    {icon && <span className="ui-badge__icon">{icon}</span>}
    {children}
  </span>
);

export default Badge;
css
/* src/styles/components/badge.css */
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: 1.4;
  white-space: nowrap;
  border: 1px solid transparent;
}

.ui-badge--md {
  padding: 3px var(--sp-3);
  font-size: var(--fs-xs);
}

.ui-badge--sm {
  padding: 1px var(--sp-2);
  font-size: 0.68rem;
}

.ui-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.ui-badge__icon {
  display: inline-flex;
  font-size: 0.85em;
}

/* Variants */
.ui-badge--success {
  background: var(--color-success-soft);
  color: #065f46;
  border-color: var(--color-success-border);
}
.ui-badge--warning {
  background: var(--color-warning-soft);
  color: #92400e;
  border-color: var(--color-warning-border);
}
.ui-badge--danger {
  background: var(--color-danger-soft);
  color: #991b1b;
  border-color: var(--color-danger-border);
}
.ui-badge--info {
  background: var(--color-info-soft);
  color: #075985;
  border-color: var(--color-info-border);
}
.ui-badge--neutral {
  background: var(--gray-100);
  color: var(--text-secondary);
  border-color: var(--border);
}
.ui-badge--primary {
  background: var(--egas-primary-soft);
  color: #4c1d95;
  border-color: var(--egas-primary-border);
}
.ui-badge--remnant {
  background: var(--color-remnant-soft);
  color: #6b21a8;
  border-color: var(--color-remnant-border);
}
.ui-badge--partial {
  background: var(--color-partial-soft);
  color: #92400e;
  border-color: #fbbf24;
}

/* Dark mode text overrides */
@media (prefers-color-scheme: dark) {
  .ui-badge--success { color: #6ee7b7; }
  .ui-badge--warning { color: #fcd34d; }
  .ui-badge--danger  { color: #fca5a5; }
  .ui-badge--info    { color: #7dd3fc; }
  .ui-badge--primary { color: #c4b5fd; }
  .ui-badge--remnant { color: #d8b4fe; }
  .ui-badge--partial { color: #fbbf24; }
}
File 8 — src/components/ui/StatCard.jsx + styles/components/stat-card.css
jsx
// src/components/ui/StatCard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

/**
 * StatCard — KPI tile used on overview + dashboard.
 *
 * Props:
 *   label       — big label, e.g. "Total Users"
 *   value       — main number / string
 *   change      — number (percent). + / - / 0
 *   icon        — ReactNode
 *   color       — 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'remnant'
 *   subtitle    — small caption
 *   loading     — skeleton state
 *   onClick     — makes tile interactive
 */
const StatCard = ({
  label,
  value,
  change = null,
  icon = null,
  color = 'primary',
  subtitle = null,
  loading = false,
  onClick,
}) => {
  const trend = change == null
    ? null
    : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  const trendIcon = trend === 'up'
    ? <FaArrowUp />
    : trend === 'down'
    ? <FaArrowDown />
    : <FaMinus />;

  return (
    <div
      className={`ui-stat ui-stat--${color} ${onClick ? 'ui-stat--clickable' : ''} ${loading ? 'ui-stat--loading' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
    >
      <div className="ui-stat__header">
        <div className="ui-stat__icon">{icon}</div>
        {trend && !loading && (
          <div className={`ui-stat__trend ui-stat__trend--${trend}`}>
            {trendIcon}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {loading ? (
        <>
          <div className="ui-stat__skeleton ui-stat__skeleton--value" />
          <div className="ui-stat__skeleton ui-stat__skeleton--label" />
        </>
      ) : (
        <>
          <div className="ui-stat__value">{value}</div>
          <div className="ui-stat__label">{label}</div>
          {subtitle && <div className="ui-stat__subtitle">{subtitle}</div>}
        </>
      )}
    </div>
  );
};

export default StatCard;
css
/* src/styles/components/stat-card.css */
.ui-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-5);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  transition: box-shadow var(--t-fast), transform var(--t-fast);
  min-height: 130px;
}

.ui-stat--clickable {
  cursor: pointer;
}
.ui-stat--clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.ui-stat--clickable:focus-visible {
  outline: 2px solid var(--egas-primary);
  outline-offset: 2px;
}

.ui-stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--egas-primary);
}

.ui-stat--primary::before { background: var(--egas-primary); }
.ui-stat--success::before { background: var(--color-success); }
.ui-stat--warning::before { background: var(--color-warning); }
.ui-stat--danger::before  { background: var(--color-danger); }
.ui-stat--info::before    { background: var(--color-info); }
.ui-stat--remnant::before { background: var(--color-remnant); }

.ui-stat__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.ui-stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  background: var(--egas-primary-soft);
  color: var(--egas-primary);
}
.ui-stat--success .ui-stat__icon { background: var(--color-success-soft); color: var(--color-success); }
.ui-stat--warning .ui-stat__icon { background: var(--color-warning-soft); color: var(--color-warning); }
.ui-stat--danger  .ui-stat__icon { background: var(--color-danger-soft);  color: var(--color-danger); }
.ui-stat--info    .ui-stat__icon { background: var(--color-info-soft);    color: var(--color-info); }
.ui-stat--remnant .ui-stat__icon { background: var(--color-remnant-soft); color: var(--color-remnant); }

.ui-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}
.ui-stat__trend--up   { background: var(--color-success-soft); color: #065f46; }
.ui-stat__trend--down { background: var(--color-danger-soft);  color: #991b1b; }
.ui-stat__trend--flat { background: var(--gray-100);           color: var(--text-secondary); }

.ui-stat__value {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  line-height: 1.1;
  word-break: break-word;
}

.ui-stat__label {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  font-weight: var(--fw-medium);
}

.ui-stat__subtitle {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

/* Skeleton */
.ui-stat__skeleton {
  background: var(--gray-100);
  border-radius: var(--radius-sm);
  animation: ui-stat-pulse 1.4s ease-in-out infinite;
}
.ui-stat__skeleton--value { width: 60%; height: 26px; }
.ui-stat__skeleton--label { width: 40%; height: 14px; }

@keyframes ui-stat-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
File 9 — src/components/ui/EmptyState.jsx + src/components/ui/SkeletonLoader.jsx + src/components/ui/PageHeader.jsx + styles/components/misc.css
jsx
// src/components/ui/EmptyState.jsx
import React from 'react';

const EmptyState = ({
  icon = <i className="fas fa-inbox" />,
  title = 'Nothing here yet',
  description,
  action,
}) => (
  <div className="ui-empty">
    <div className="ui-empty__icon">{icon}</div>
    <h3 className="ui-empty__title">{title}</h3>
    {description && <p className="ui-empty__description">{description}</p>}
    {action && <div className="ui-empty__action">{action}</div>}
  </div>
);

export default EmptyState;
jsx
// src/components/ui/SkeletonLoader.jsx
import React from 'react';

/**
 * SkeletonLoader — pulse placeholders.
 *
 * Usage:
 *   <SkeletonLoader lines={3} />
 *   <SkeletonLoader type="card" />
 *   <SkeletonLoader type="table" rows={5} columns={4} />
 */
const SkeletonLoader = ({ type = 'lines', lines = 3, rows = 5, columns = 4, width = '100%', height = 16 }) => {
  if (type === 'card') {
    return <div className="ui-skeleton ui-skeleton--card" style={{ width, height: 120 }} />;
  }
  if (type === 'avatar') {
    return <div className="ui-skeleton ui-skeleton--avatar" style={{ width: 40, height: 40 }} />;
  }
  if (type === 'table') {
    return (
      <div className="ui-skeleton-table">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="ui-skeleton-table__row">
            {Array.from({ length: columns }).map((__, c) => (
              <div key={c} className="ui-skeleton ui-skeleton--cell" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="ui-skeleton-lines">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="ui-skeleton"
          style={{ width: i === lines - 1 ? '60%' : '100%', height }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
jsx
// src/components/ui/PageHeader.jsx
import React from 'react';

/**
 * PageHeader — title + subtitle + actions row.
 * Used at the top of every admin/delivery page.
 */
const PageHeader = ({ title, subtitle, actions, back, breadcrumbs }) => (
  <header className="ui-page-header">
    {back && <div className="ui-page-header__back">{back}</div>}
    {breadcrumbs && <div className="ui-page-header__crumbs">{breadcrumbs}</div>}
    <div className="ui-page-header__row">
      <div className="ui-page-header__text">
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
css
/* src/styles/components/misc.css */

/* ─── EmptyState ─── */
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-12) var(--sp-6);
  text-align: center;
}

.ui-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-alt);
  color: var(--text-muted);
  font-size: 1.75rem;
}

.ui-empty__title {
  margin: 0;
  font-size: var(--fs-lg);
  color: var(--text-primary);
}

.ui-empty__description {
  margin: 0;
  max-width: 420px;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
}

.ui-empty__action {
  margin-top: var(--sp-2);
}

/* ─── SkeletonLoader ─── */
.ui-skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-200) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: ui-skeleton-shimmer 1.4s ease-in-out infinite;
}

.ui-skeleton--card   { border-radius: var(--radius-lg); }
.ui-skeleton--avatar { border-radius: 50%; }

.ui-skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.ui-skeleton-table {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.ui-skeleton-table__row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: var(--sp-3);
}

.ui-skeleton--cell {
  height: 16px;
}

@keyframes ui-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── PageHeader ─── */
.ui-page-header {
  margin-bottom: var(--sp-6);
}

.ui-page-header__back {
  margin-bottom: var(--sp-3);
}

.ui-page-header__crumbs {
  margin-bottom: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.ui-page-header__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

.ui-page-header__text { flex: 1; min-width: 0; }

.ui-page-header__title {
  margin: 0 0 var(--sp-1) 0;
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  line-height: var(--lh-tight);
}

.ui-page-header__subtitle {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: var(--lh-normal);
}

.ui-page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .ui-page-header__row { flex-direction: column; align-items: stretch; }
  .ui-page-header__actions { justify-content: flex-start; }
  .ui-page-header__actions > * { flex: 1; }
}
File 10 — src/components/ui/ConfirmDialog.jsx + styles/components/confirm.css
jsx
// src/components/ui/ConfirmDialog.jsx
import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — small yes/no modal with async support.
 * Blocks close while confirming. Catches errors from onConfirm.
 */
const ConfirmDialog = ({
  open,
  onClose,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // confirm button variant
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm?.();
      onClose?.();
    } catch (err) {
      // Let the parent show a toast — we just stop the spinner
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-relaxed)' }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;
File 11 — src/components/ui/index.js
js
// src/components/ui/index.js
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as DataTable } from './DataTable';
export { default as FormField } from './FormField';
export { default as FormRow } from './FormRow';
export { default as Badge } from './Badge';
export { default as StatCard } from './StatCard';
export { default as EmptyState } from './EmptyState';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as PageHeader } from './PageHeader';
export { default as ConfirmDialog } from './ConfirmDialog';
File 12 — src/styles/index.css
Wire everything. Replace your existing src/index.css (or import this from App.jsx/main.jsx after the existing CSS so overrides are minimal).

css
/* src/styles/index.css */
@import './tokens.css';
@import './components/button.css';
@import './components/card.css';
@import './components/modal.css';
@import './components/table.css';
@import './components/form.css';
@import './components/badge.css';
@import './components/stat-card.css';
@import './components/misc.css';
Then in src/index.js (or main.jsx), add:

js
import './styles/index.css';
(keep it after your existing CSS imports to allow the new primitives to win only where needed)

How to smoke-test Batch 2
Create a throwaway /admin/test-ui route (or drop into the existing overview) with:

jsx
import React, { useState } from 'react';
import {
  Button, Card, Modal, DataTable, FormField, FormRow,
  Badge, StatCard, EmptyState, SkeletonLoader, PageHeader, ConfirmDialog,
} from '../../components/ui';

const TestUI = () => {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState('');

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="UI Primitives Test"
        subtitle="Verify Batch 2 renders correctly"
        actions={
          <>
            <Button variant="outline">Outline</Button>
            <Button onClick={() => setOpen(true)}>Open Modal</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Users" value="1,234" change={12.4} color="primary" icon={<i className="fas fa-users" />} />
        <StatCard label="Remnant Balance" value="₦ 45,200" change={-2.1} color="remnant" icon={<i className="fas fa-recycle" />} />
        <StatCard label="Loading…" value="" loading color="success" icon={<i className="fas fa-chart-line" />} />
      </div>

      <Card title="Form Test" subtitle="All fields" style={{ marginBottom: 24 }}>
        <FormRow>
          <FormField label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormField label="Email" name="email" type="email" placeholder="you@example.com" />
        </FormRow>
        <FormRow cols={1}>
          <FormField label="Notes" name="notes" as="textarea" rows={3} />
        </FormRow>
      </Card>

      <Card padding="none" style={{ marginBottom: 24 }}>
        <DataTable
          searchable
          pagination={{ page: 1, pageSize: 5, total: 12, onChange: () => {} }}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status', render: (row) => (
              <Badge variant={row.status === 'active' ? 'success' : 'warning'} dot>{row.status}</Badge>
            )},
          ]}
          data={[
            { id: 1, name: 'Alice', status: 'active' },
            { id: 2, name: 'Bob', status: 'pending' },
          ]}
        />
      </Card>

      <Card>
        <Badge variant="primary">Primary</Badge>{' '}
        <Badge variant="success" dot>Active</Badge>{' '}
        <Badge variant="warning">Pending</Badge>{' '}
        <Badge variant="danger">Failed</Badge>{' '}
        <Badge variant="remnant">Remnant</Badge>{' '}
        <Badge variant="partial">Partial</Badge>
      </Card>

      <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
        <SkeletonLoader lines={3} />
        <SkeletonLoader type="table" rows={3} columns={4} />
        <EmptyState
          title="No deliveries yet"
          description="When you create your first delivery it will appear here."
          action={<Button>Create Delivery</Button>}
        />
        <Button variant="danger" onClick={() => setConfirm(true)}>Open Confirm</Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Example Modal"
        subtitle="Testing the Modal primitive"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <p>Any content can go here.</p>
      </Modal>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 500));
        }}
      />
    </div>
  );
};

export default TestUI;
Expected:

Buttons render with correct hover/focus/disabled states

Modal opens centered on desktop, slides up on mobile, closes on Escape/backdrop

StatCard shows the trend badge and skeleton when loading

Table becomes a card list at <768px viewport

Dark mode automatically flips colors

ConfirmDialog blocks on "Delete" then closes after 500ms

Skeleton animates smoothly

Empty state centers correctly

Delete the test route when satisfied.

What Batch 3 will deliver
AdminLayout (RBAC-aware sidebar), AdminSidebar, NotificationBell, UserMenu, ProtectedRoute, DeliveryLayout, and the rewritten App.jsx route tree — with a route-level RBAC guard so a delivery user hitting /admin/users is redirected, not 403'd after the page renders.

Say "Batch 3" when Batch 2 is verified. If a primitive needs an extra prop or a tweak (e.g., DataTable needs a density mode), tell me before I move on — you'll save us both a re-pass.

proceed to Batch 3
Batch 3 — Admin Layout, Sidebar, Notification Bell, Protected Routes
This batch rebuilds the shell. After pasting, the sidebar will respect the RBAC matrix from Batch 1: delivery sees only delivery tabs, customer_care sees only support/users/reports, super-admin sees config, etc.

9 files. All drop-in.

File 1 — src/components/layout/ProtectedRoute.jsx
Route-level guard. Redirects unauthenticated → /login, unauthorized → a 403 page (never renders the page first).

jsx
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
File 2 — src/components/layout/UserMenu.jsx + styles/layout/user-menu.css
Avatar + dropdown. Uses useAuth and exposes logout.

jsx
// src/components/layout/UserMenu.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeRole } from '../../utils/permissions';

const UserMenu = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout?.();
    navigate('/login', { replace: true });
  };

  const role = normalizeRole(user?.role);
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Admin';
  const initials = user?.firstName
    ? `${user.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()
    : 'A';

  return (
    <div className={`user-menu ${collapsed ? 'user-menu--collapsed' : ''}`} ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="user-menu__avatar">
          {user?.profileImage?.secure_url || user?.profileImage?.url ? (
            <img src={user.profileImage.secure_url || user.profileImage.url} alt={displayName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="user-menu__text">
              <span className="user-menu__name">{displayName}</span>
              <span className="user-menu__role">{role.replace('-', ' ')}</span>
            </div>
            <FaChevronDown className={`user-menu__caret ${open ? 'is-open' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <strong>{displayName}</strong>
            <span>{user?.email}</span>
          </div>
          <Link to="/admin/settings" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <FaUser /> Profile
          </Link>
          <Link to="/admin/settings" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <FaCog /> Settings
          </Link>
          <div className="user-menu__divider" />
          <button type="button" className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
            <FaSignOutAlt /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
css
/* src/styles/layout/user-menu.css */
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-2);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--t-fast);
  color: var(--text-primary);
  text-align: left;
}
.user-menu__trigger:hover {
  background: var(--surface-alt);
}

.user-menu__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--egas-primary);
  color: var(--text-inverse);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  flex-shrink: 0;
  overflow: hidden;
}
.user-menu__avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-menu__text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-menu__name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__role {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  text-transform: capitalize;
}

.user-menu__caret {
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: transform var(--t-fast);
}
.user-menu__caret.is-open { transform: rotate(180deg); }

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + var(--sp-2));
  right: 0;
  min-width: 220px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  padding: var(--sp-2);
  animation: user-menu-in 120ms ease-out;
}

.user-menu__header {
  padding: var(--sp-3);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--sp-1);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-menu__header strong { font-size: var(--fs-sm); }
.user-menu__header span { font-size: var(--fs-xs); color: var(--text-muted); }

.user-menu__item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  color: var(--text-primary);
  text-decoration: none;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--t-fast);
}
.user-menu__item:hover {
  background: var(--surface-alt);
  text-decoration: none;
}
.user-menu__item--danger { color: var(--color-danger); }
.user-menu__item--danger:hover { background: var(--color-danger-soft); }

.user-menu__divider {
  height: 1px;
  background: var(--border);
  margin: var(--sp-1) 0;
}

.user-menu--collapsed .user-menu__trigger {
  padding: var(--sp-2);
}

@keyframes user-menu-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .user-menu__text { display: none; }
  .user-menu__caret { display: none; }
}
File 3 — src/components/layout/NotificationBell.jsx + styles/layout/notification-bell.css
Bell icon with unread count + dropdown feed. Uses useNotificationFeed from Batch 1.

jsx
// src/components/layout/NotificationBell.jsx
import React, { useEffect, useRef } from 'react';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useNotificationFeed } from '../../hooks/useNotificationFeed';
import Badge from '../ui/Badge';

const typeVariantMap = {
  order: 'primary',
  subscription: 'info',
  delivery: 'success',
  refill: 'warning',
  wallet: 'success',
  support: 'info',
  account: 'neutral',
  system: 'danger',
  promotional: 'remnant',
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const NotificationBell = () => {
  const { items, unread, loading, open, setOpen, reload, markOneRead, markAllRead } = useNotificationFeed();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  const handleOpen = () => {
    if (!open) reload();
    setOpen(!open);
  };

  const displayUnread = unread > 99 ? '99+' : unread;

  return (
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-bell__trigger"
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <FaBell />
        {unread > 0 && <span className="notif-bell__badge">{displayUnread}</span>}
      </button>

      {open && (
        <div className="notif-bell__dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-bell__header">
            <h3>Notifications</h3>
            <div className="notif-bell__header-actions">
              {unread > 0 && (
                <button type="button" className="notif-bell__mark-all" onClick={markAllRead}>
                  <FaCheck /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notif-bell__list">
            {loading && items.length === 0 ? (
              <div className="notif-bell__state">Loading…</div>
            ) : items.length === 0 ? (
              <div className="notif-bell__state">
                <i className="fas fa-bell-slash" />
                <p>You're all caught up</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  className={`notif-bell__item ${n.read ? '' : 'notif-bell__item--unread'}`}
                  onClick={() => !n.read && markOneRead(n._id)}
                >
                  <div className="notif-bell__item-header">
                    <Badge variant={typeVariantMap[n.type] || 'neutral'} size="sm">
                      {n.type}
                    </Badge>
                    <span className="notif-bell__time">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  <div className="notif-bell__title">{n.title}</div>
                  <div className="notif-bell__message">{n.message}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
css
/* src/styles/layout/notification-bell.css */
.notif-bell {
  position: relative;
}

.notif-bell__trigger {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background var(--t-fast), color var(--t-fast);
}
.notif-bell__trigger:hover {
  background: var(--surface-alt);
  color: var(--text-primary);
}

.notif-bell__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--color-danger);
  color: var(--text-inverse);
  font-size: 0.65rem;
  font-weight: var(--fw-bold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.notif-bell__dropdown {
  position: absolute;
  top: calc(100% + var(--sp-2));
  right: 0;
  width: 380px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  animation: notif-in 120ms ease-out;
}

.notif-bell__header {
  padding: var(--sp-4);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notif-bell__header h3 {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.notif-bell__mark-all {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--egas-primary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
}
.notif-bell__mark-all:hover { text-decoration: underline; }

.notif-bell__list {
  flex: 1;
  overflow-y: auto;
}

.notif-bell__state {
  padding: var(--sp-8) var(--sp-4);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
.notif-bell__state i {
  font-size: 1.5rem;
  opacity: 0.5;
  margin-bottom: var(--sp-2);
  display: block;
}

.notif-bell__item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: none;
  background: transparent;
  text-align: left;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--t-fast);
}
.notif-bell__item:hover { background: var(--surface-alt); }
.notif-bell__item--unread { background: var(--egas-primary-soft); }
.notif-bell__item--unread:hover { background: var(--egas-primary-border); }

.notif-bell__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-bell__time {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.notif-bell__title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.notif-bell__message {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  line-height: var(--lh-normal);
}

@keyframes notif-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .notif-bell__dropdown {
    position: fixed;
    top: var(--header-height);
    left: var(--sp-2);
    right: var(--sp-2);
    width: auto;
    max-height: calc(100vh - var(--header-height) - 24px);
  }
}
File 4 — src/components/layout/AdminSidebar.jsx + styles/layout/sidebar.css
RBAC-aware nav. Only shows what the user can access.

jsx
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
css
/* src/styles/layout/sidebar.css */
.admin-sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width var(--t-base);
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--z-sticky);
  overflow: hidden;
}

.admin-sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

.admin-sidebar__brand {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--sp-4);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.admin-sidebar__brand-name {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--egas-primary);
  letter-spacing: -0.01em;
}

.admin-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-3) 0;
}

.admin-sidebar__section {
  margin-bottom: var(--sp-4);
}

.admin-sidebar__section-title {
  margin: 0;
  padding: 0 var(--sp-4) var(--sp-2);
  font-size: 0.68rem;
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all var(--t-fast);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-sidebar__item:hover {
  background: var(--surface-alt);
  color: var(--text-primary);
  text-decoration: none;
}
.admin-sidebar__item--active {
  background: var(--egas-primary-soft);
  color: var(--egas-primary);
  border-left-color: var(--egas-primary);
  font-weight: var(--fw-semibold);
}

.admin-sidebar__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.admin-sidebar__footer {
  border-top: 1px solid var(--border);
  padding: var(--sp-3);
  flex-shrink: 0;
}

.admin-sidebar__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-alt);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--fs-xs);
  transition: all var(--t-fast);
}
.admin-sidebar__toggle:hover {
  background: var(--gray-100);
  color: var(--text-primary);
}

/* Collapsed state */
.admin-sidebar--collapsed .admin-sidebar__item {
  justify-content: center;
  padding: var(--sp-3);
}
.admin-sidebar--collapsed .admin-sidebar__item-label {
  display: none;
}

/* Mobile — sidebar slides over */
.admin-sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: calc(var(--z-sticky) - 1);
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform var(--t-base);
    width: var(--sidebar-width);
  }
  .admin-sidebar--collapsed {
    width: var(--sidebar-width);
  }
  .admin-sidebar--mobile-open {
    transform: translateX(0);
  }
  .admin-sidebar--mobile-open ~ .admin-sidebar-overlay {
    display: block;
  }
}
File 5 — src/components/layout/AdminLayout.jsx + styles/layout/layout.css
Main admin shell. Combines sidebar + top bar + content area + outlet.

jsx
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
css
/* src/styles/layout/layout.css */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--surface-alt);
}

.admin-layout--collapsed {
  /* Sidebar auto-adjusts via its own class */
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  min-width: 0;
  transition: margin-left var(--t-base);
}

.admin-layout--collapsed .admin-main {
  margin-left: var(--sidebar-width-collapsed);
}

.admin-topbar {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-6);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.admin-topbar__menu {
  display: none;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
.admin-topbar__menu:hover { background: var(--surface-alt); }

.admin-topbar__spacer {
  flex: 1;
}

.admin-content {
  flex: 1;
  padding: var(--sp-6);
  overflow-x: hidden;
}

@media (max-width: 1024px) {
  .admin-main {
    margin-left: 0 !important;
  }
  .admin-topbar {
    padding: 0 var(--sp-4);
  }
  .admin-topbar__menu {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .admin-content {
    padding: var(--sp-4);
  }
}
File 6 — src/components/layout/DeliveryLayout.jsx
Slimmer shell for delivery agents. No admin tabs — just deliveries, refills, remnant, notifications.

jsx
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
css
/* Append to src/styles/layout/layout.css */
.delivery-layout {
  min-height: 100vh;
  background: var(--surface-alt);
  display: flex;
  flex-direction: column;
}

.delivery-topbar {
  height: var(--header-height);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: 0 var(--sp-6);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.delivery-topbar__brand {
  flex-shrink: 0;
}
.delivery-topbar__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  color: var(--egas-primary);
}

.delivery-topbar__tabs {
  flex: 1;
  display: flex;
  gap: var(--sp-1);
  overflow-x: auto;
  scrollbar-width: none;
}
.delivery-topbar__tabs::-webkit-scrollbar { display: none; }

.delivery-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast);
}
.delivery-tab:hover {
  background: var(--surface-alt);
  color: var(--text-primary);
  text-decoration: none;
}
.delivery-tab--active {
  background: var(--egas-primary-soft);
  color: var(--egas-primary);
}

.delivery-topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.delivery-content {
  flex: 1;
  padding: var(--sp-6);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .delivery-topbar {
    padding: 0 var(--sp-4);
    gap: var(--sp-2);
  }
  .delivery-topbar__logo span { display: none; }
  .delivery-tab span { display: none; }
  .delivery-content {
    padding: var(--sp-4);
  }
}
File 7 — src/pages/Unauthorized.jsx
Simple 403 fallback that ProtectedRoute redirects to. Doesn't leak what the actual permissions are.

jsx
// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import Button from '../components/ui/Button';

const Unauthorized = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-alt)',
      padding: 'var(--sp-6)',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--color-danger-soft)',
        color: 'var(--color-danger)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: 'var(--sp-5)',
      }}
    >
      <FaLock />
    </div>
    <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--sp-2)' }}>
      Access denied
    </h1>
    <p
      style={{
        color: 'var(--text-muted)',
        fontSize: 'var(--fs-sm)',
        maxWidth: 420,
        marginBottom: 'var(--sp-6)',
      }}
    >
      Your account doesn't have permission to view this page. If you believe
      this is a mistake, contact your administrator.
    </p>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Button variant="primary">Back to home</Button>
    </Link>
  </div>
);

export default Unauthorized;
File 8 — src/App.jsx (rewrite)
Route tree with ProtectedRoute guards. Existing routes preserved. New routes stubbed (/admin/refills, /admin/cylinders, etc.) with a "Coming in Batch 5" placeholder so sidebar links don't 404 while we build.

jsx
// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { LiveProvider } from './contexts/LiveContext';

import ProtectedRoute, { HomeRedirect } from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import DeliveryLayout from './components/layout/DeliveryLayout';

// Admin pages
import AdminOverview from './components/admin/overview/AdminOverview';
import AdminUsers from './components/admin/users/UserManagement';
import AdminSubscriptions from './components/admin/subscriptions/SubscriptionManagement';
import AdminDeliveries from './components/admin/deliveries/DeliveryManagement';
import AdminProducts from './components/admin/products/AdminProductManagement';
import AdminSupport from './components/admin/support/SupportManagement';
import AdminReports from './components/admin/reports/AdminReports';
import AdminSettings from './components/admin/settings/AdminPanelSettings';

// Delivery pages
import DeliveryDashboard from './components/delivery/DeliveryAgentPortal';

// Auth pages
import AuthPage from './AuthForm/authPage';
import ForgotPassword from './AuthForm/forgotPassword';
import Unauthorized from './pages/Unauthorized';
import PlaceholderPage from './pages/PlaceholderPage';

import './styles/index.css';

const App = () => {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <LiveProvider>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Home redirect by role */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<HomeRedirect />} />

            {/* ─── Admin portal ─── */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'super-admin', 'customer_care']}
                />
              }
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/overview" replace />} />

                <Route path="overview" element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="deliveries" element={<AdminDeliveries />} />

                {/* New pages — Batch 5 */}
                <Route path="refills" element={<PlaceholderPage title="Refills" />} />
                <Route path="cylinders" element={<PlaceholderPage title="Cylinders" />} />
                <Route path="remnant-ledger" element={<PlaceholderPage title="Remnant Ledger" />} />
                <Route path="disputes" element={<PlaceholderPage title="Disputes" />} />
                <Route path="settlements" element={<PlaceholderPage title="Settlements" />} />
                <Route path="plants" element={<PlaceholderPage title="Plants" />} />

                {/* Catalog — Plans split out of Products in Batch 6 */}
                <Route path="products" element={<AdminProducts />} />
                <Route path="plans" element={<PlaceholderPage title="Subscription Plans" />} />

                {/* Service */}
                <Route path="support" element={<AdminSupport />} />
                <Route path="reports" element={<AdminReports />} />

                {/* System */}
                <Route path="settings" element={<AdminSettings />} />
                <Route path="config" element={<PlaceholderPage title="System Config" superAdminOnly />} />
              </Route>
            </Route>

            {/* ─── Delivery agent portal ─── */}
            <Route
              path="/delivery"
              element={<ProtectedRoute allowedRoles={['delivery']} />}
            >
              <Route element={<DeliveryLayout />}>
                <Route index element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="dashboard" element={<DeliveryDashboard />} />
                <Route path="refills" element={<PlaceholderPage title="My Refill Requests" />} />
                <Route path="remnant" element={<PlaceholderPage title="My Remnant" />} />
                <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
              </Route>
            </Route>

            {/* ─── Plant portal (out of scope — redirect if entered) ─── */}
            <Route
              path="/plant/*"
              element={<ProtectedRoute allowedRoles={['plant_admin', 'plant_supervisor', 'plant_operator', 'plant_staff']} />}
            >
              <Route path="*" element={<PlaceholderPage title="Plant Portal (external)" />} />
            </Route>

            {/* ─── Customer portal (minimal) ─── */}
            <Route
              path="/customer/*"
              element={<ProtectedRoute allowedRoles={['user']} />}
            >
              <Route path="*" element={<PlaceholderPage title="Customer Portal" />} />
            </Route>

            {/* Legacy auth fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LiveProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
File 9 — src/pages/PlaceholderPage.jsx
The "coming soon" page so sidebar links don't 404 while we build the real pages in later batches.

jsx
// src/pages/PlaceholderPage.jsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title = 'Coming soon', superAdminOnly = false }) => {
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  if (superAdminOnly && !isSuperAdmin) {
    return (
      <div>
        <PageHeader title="Restricted" subtitle="Only super-admins can access this page." />
        <EmptyState
          icon={<i className="fas fa-lock" />}
          title="Access denied"
          description="Contact a super-admin if you believe you should have access."
          action={<Button variant="outline" onClick={() => navigate('/admin/overview')}>Back to overview</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={title} subtitle="This page is being built in a later batch." />
      <EmptyState
        icon={<i className="fas fa-tools" />}
        title="Under construction"
        description={`${title} will be available in an upcoming batch. All the backend endpoints it needs are already wired through adminAPI.`}
        action={<Button variant="outline" onClick={() => navigate('/admin/overview')}>Back to overview</Button>}
      />
    </div>
  );
};

export default PlaceholderPage;
Update src/styles/index.css
Add the new layout imports:

css
/* src/styles/index.css */
@import './tokens.css';

/* Components */
@import './components/button.css';
@import './components/card.css';
@import './components/modal.css';
@import './components/table.css';
@import './components/form.css';
@import './components/badge.css';
@import './components/stat-card.css';
@import './components/misc.css';

/* Layout */
@import './layout/sidebar.css';
@import './layout/user-menu.css';
@import './layout/notification-bell.css';
@import './layout/layout.css';
Notes on what will and won't work immediately
✅ After Batch 3 lands and you refresh:
Login as admin → routes to /admin/overview, sees 8 nav items (Overview, Users, Subs, Deliveries, Products, Support, Reports, Settings).

Login as super-admin → sees all 14 items including Config.

Login as delivery → redirected to /delivery/dashboard, sees the agent shell with 4 tabs.

Notification bell shows unread count, live-updates via socket when events fire.

Sidebar collapses/expands, state persists.

Sidebar auto-hides on mobile and opens as a drawer via hamburger.

Route guard redirects unauthorized users to /unauthorized, not blank screens.

Sidebar shows nothing that the current role can't access.

⚠️ What won't work until later batches
New admin pages (Refills, Cylinders, Remnant, Disputes, Settlements, Plants, Config) → show the placeholder. Real pages land in Batch 5.

/admin/plans → currently placeholder; splits out of Products in Batch 6.

/delivery/refills and /delivery/remnant → placeholder; real pages land in Batch 4.

/delivery/notifications → placeholder for now; the notification bell covers the primary use case.

Old files at src/components/admin/AdminDashboard.jsx, AdminOverview.jsx, AdminProductManagement.jsx, DeliveryManagement.jsx, UserManagement/UserManagement.jsx (if paths mismatch) — the import paths in App.jsx above point at the folder-style paths (./components/admin/overview/AdminOverview etc.). If your current paths are flatter (./components/admin/AdminDashboard), update the imports to match your actual file layout. If your existing folder structure differs, tell me and I'll fix the imports in one pass.

The one import path I need you to confirm
I've used these conventions in App.jsx:

./components/admin/overview/AdminOverview

./components/admin/users/UserManagement

./components/admin/subscriptions/SubscriptionManagement

./components/admin/deliveries/DeliveryManagement

./components/admin/products/AdminProductManagement

./components/admin/support/SupportManagement

./components/admin/reports/AdminReports

./components/admin/settings/AdminPanelSettings

./components/delivery/DeliveryAgentPortal

Reply with your actual folder layout (just the paths from src/ to each of the above 9 files as they currently exist) and I'll fix the imports without breaking them. Or, if the flat layout is still what you have (./components/admin/AdminDashboard, ./components/admin/UserManagement/UserManagement, etc.), tell me and I'll rewrite the top of App.jsx accordingly.

I'd rather spend 30 seconds on this than have App.jsx white-screen on you the first time you reload.

Smoke test checklist
Reload with a logged-in admin — sidebar renders, active item is highlighted.

Click collapse → sidebar shrinks to icon rail, main content expands.

Reload → collapsed state persists.

Resize to 800px width → sidebar hides, hamburger appears in topbar.

Click hamburger → sidebar slides in from left, backdrop dims page.

Click a nav item → drawer closes on mobile, route changes.

Click bell → dropdown opens, shows feed (empty initially).

Click user menu → dropdown, sign out works and returns to /login.

Logout, login as delivery user → land on /delivery/dashboard, no admin items visible anywhere.

Manually navigate to /admin/users as delivery → redirected to /unauthorized.

When all 10 pass, say "Batch 4" and I'll deliver the delivery-agent portal rebuild — including the pre-fill / post-fill weight capture flow (the actual remnant feature) with live socket updates, refills tab, and remnant panel.

proceed to batch 4
Length limit reached. Please start a new chat.
proceed to batch 4
Length limit reached. Please start a new chat.
proceed to batch 4
Length limit reached. Please start a new chat.
