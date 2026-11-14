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
  getAlerts:           () => apiClient.get('/admin/dashboard/alerts'),   // NEW
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
  findByEmail: (email) => apiClient.get('/admin/users/find-by-email', { params: { email } }),
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
  list:              (params) => apiClient.get('/admin/refills/refill-requests', { params }),
  get:               (id) => apiClient.get(`/admin/refills/refill-requests/${id}`),
  rejected:          (params) => apiClient.get('/admin/refills/refill-requests/rejected', { params }),
  cancel:            (id, reason) =>
    apiClient.post(`/admin/refills/refill-requests/${id}/cancel`, { reason }),
  reconciliationQueue: (params) => apiClient.get('/admin/refills/reconciliation', { params }),
  completeReconciliation: (transactionId, note) =>
    apiClient.post(`/admin/refills/reconciliation/${transactionId}/complete`, { note }),
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
  listLedger:       (params) => apiClient.get('/admin/remnants/remnant-ledger', { params }),
  getUserLedger:    (userId, params) =>
    apiClient.get(`/admin/remnants/remnant-ledger/user/${userId}`, { params }),
  verifyIntegrity:  (userId) =>
    apiClient.get(`/admin/remnants/remnant-ledger/verify/${userId}`),
  createAdjustment: (payload) =>
    apiClient.post('/admin/remnants/remnant-ledger/adjustment', payload),
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
  list:     (params) => apiClient.get('/admin/settlements/list-settlements', { params }),
  get:      (id) => apiClient.get(`/admin/settlements/${id}`),
  generate: (payload) =>
    apiClient.post('/admin/settlements/generate-settlements', payload),
  approve:  (id) => apiClient.patch(`/admin/settlements/${id}/approve`),
  markPaid: (id, paymentReference) =>
    apiClient.patch(`/admin/settlements/${id}/mark-paid`, { paymentReference }),
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

// // ---------- ADMIN: REPORTS ----------
// export const adminReportsAPI = {
//   sales:             (params) => apiClient.get('/admin/reports/sales', { params }),
//   users:             (params) => apiClient.get('/admin/reports/users', { params }),
//   inventory:         (params) => apiClient.get('/admin/reports/inventory', { params }),
//   subscriptions:     (params) => apiClient.get('/admin/reports/subscriptions', { params }),
//   financial:         (params) => apiClient.get('/admin/reports/financial', { params }),
//   realtimeMetrics:   () => apiClient.get('/admin/reports/realtime-metrics'),
//   export:            (reportType, config) =>
//     apiClient.post(`/admin/reports/export/${reportType}`, config, {
//       responseType: 'blob',
//     }),
//   saved:             () => apiClient.get('/admin/reports/saved'),
//   save:              (payload) => apiClient.post('/admin/reports/saved', payload),
//   deleteSaved:       (id) => apiClient.delete(`/admin/reports/saved/${id}`),
//   schedules:         () => apiClient.get('/admin/reports/schedules'),
//   createSchedule:    (payload) => apiClient.post('/admin/reports/schedules', payload),
//   updateSchedule:    (id, payload) =>
//     apiClient.patch(`/admin/reports/schedules/${id}`, payload),
//   deleteSchedule:    (id) => apiClient.delete(`/admin/reports/schedules/${id}`),
//   recipients:        () => apiClient.get('/admin/reports/recipients'),
// };


export const adminReportsAPI = {
  sales:           (params) => apiClient.get('/admin/reports/sales', { params }),
  users:           (params) => apiClient.get('/admin/reports/users', { params }),
  inventory:       (params) => apiClient.get('/admin/reports/inventory', { params }),
  subscriptions:   (params) => apiClient.get('/admin/reports/subscriptions', { params }),
  financial:       (params) => apiClient.get('/admin/reports/financial', { params }),
  realtimeMetrics: ()       => apiClient.get('/admin/reports/realtime-metrics'),
  health:          ()       => apiClient.get('/admin/reports/health'),
  export:          (reportType, params) =>
    apiClient.get(`/admin/reports/export/${reportType}`, {
      params,
      responseType: params?.format === 'pdf' ? 'blob' : 'json',
    }),
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
    apiClient.get('/admin/delivery/agent/my-deliveries', { params }),
  accept:            (id) => apiClient.put(`/admin/delivery/${id}/accept`),
  outForDelivery:    (id) => apiClient.put(`/admin/delivery/${id}/out-for-delivery`),
  delivered:         (id, notes) =>
    apiClient.put(`/admin/delivery/${id}/delivered`, { notes }),
  failed:            (id, reason, notes) =>
    apiClient.put(`/admin/delivery/${id}/failed`, { reason, notes }),
  recordPartial:     (id, deliveredKg, remainingKg, notes) =>
    apiClient.put(`/admin/delivery/${id}/partial-delivery`, {
      deliveredKg, remainingKg, notes,
    }),
  recordPreFill:     (id, payload) =>
    apiClient.post(`/admin/delivery/${id}/pre-fill-weight`, payload),
  recordPostFill:    (id, payload) =>
    apiClient.post(`/admin/delivery/${id}/post-fill-weight`, payload),
  syncWithSubscription: (id) =>
    apiClient.post(`/admin/delivery/${id}/sync-subscription`),
  remnantDeliveries: (params) =>
    apiClient.get('/admin/delivery/agent/remnant-deliveries', { params }),
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