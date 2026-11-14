// src/api/adminAPI.js
import apiClient from './apiClient';


export const authAPI = {
  // Login user
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  // Register user
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // Get current user profile
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  // Logout user
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post('/auth/refresh');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiClient.post(`/auth/reset-password/${token}`, { password });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export const adminAPI = {
  // Dashboard
  dashboard: {
    getStats: () => apiClient.get('/admin/dashboard/stats'),
    getRecentActivities: () => apiClient.get('/admin/dashboard/recent-activities'),
    getChartData: (period = 'month') => apiClient.get(`/admin/dashboard/chart-data?period=${period}`),
    getOverview: () => apiClient.get('/admin/dashboard/overview'),
  },

  // User Management
  users: {
    getAll: (params) => apiClient.get('/admin/users', { params }),
    getById: (id) => apiClient.get(`/admin/users/${id}`),
    create: (data) => apiClient.post('/admin/users', data),
    update: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/users/${id}`),
    toggleStatus: (id, isActive) => apiClient.patch(`/admin/users/${id}/status`, { isActive }),
    updateWallet: (id, amount, operation) => apiClient.patch(`/admin/users/${id}/wallet`, { amount, operation }),
    bulkDelete: (userIds) => apiClient.delete('/admin/users/bulk/delete', { data: { userIds } }),
    bulkUpdateStatus: (userIds, isActive) => apiClient.patch('/admin/users/bulk/status', { userIds, isActive }),
    getStats: () => apiClient.get('/admin/users/stats/overview'),
  },

  // Order Management
  orders: {
    getAll: (params) => apiClient.get('/admin/orders', { params }),
    getById: (id) => apiClient.get(`/admin/orders/${id}`),
    updateStatus: (id, orderStatus) => apiClient.patch(`/admin/orders/${id}/status`, { orderStatus }),
    updatePaymentStatus: (id, paymentStatus) => apiClient.patch(`/admin/orders/${id}/payment-status`, { paymentStatus }),
    updateTracking: (id, tracking) => apiClient.patch(`/admin/orders/${id}/tracking`, { tracking }),
    bulkUpdateStatus: (orderIds, orderStatus) => apiClient.patch('/admin/orders/bulk-status', { orderIds, orderStatus }),
    getAnalytics: (period = '30days') => apiClient.get(`/admin/orders/analytics?period=${period}`),
    getStats: () => apiClient.get('/admin/orders/stats'),
    export: (params) => apiClient.get('/admin/orders/export', { params, responseType: 'blob' }),
  },

  // Delivery Management
  deliveries: {
    getAll: (params) => apiClient.get('/admin/delivery', { params }),
    getById: (id) => apiClient.get(`/admin/delivery/${id}`),
    assignAgent: (id, deliveryAgentId) => apiClient.put(`/admin/delivery/${id}/assign`, { deliveryAgentId }),
    getStats: () => apiClient.get('/admin/delivery/stats'),
    generateSchedules: (daysAhead = 7) => apiClient.post('/admin/delivery/generate-schedules', { daysAhead }),
    
    // Agent routes
    getAgentDeliveries: (params) => apiClient.get('/admin/delivery/agent/my-deliveries', { params }),
    acceptDelivery: (id) => apiClient.put(`/admin/delivery/${id}/accept`),
    markOutForDelivery: (id) => apiClient.put(`/admin/delivery/${id}/out-for-delivery`),
    markDelivered: (id, notes) => apiClient.put(`/admin/delivery/${id}/delivered`, { notes }),
    markFailed: (id, reason, notes) => apiClient.put(`/admin/delivery/${id}/failed`, { reason, notes }),
    recordPartialDelivery: (id, deliveredKg, remainingKg, notes) => 
      apiClient.put(`/admin/delivery/${id}/partial-delivery`, { deliveredKg, remainingKg, notes }),
    
    // Customer routes
    getMyDeliveries: (params) => apiClient.get('/admin/delivery/my-deliveries', { params }),
    confirmDelivery: (id, notes) => apiClient.put(`/admin/delivery/${id}/confirm`, { notes }),
    getNextDelivery: () => apiClient.get('/admin/delivery/next-delivery'),
    
    // Remnant routes
    getMyRemnant: () => apiClient.get('/admin/delivery/remnant/my-remnant'),
    getAllRemnants: (params) => apiClient.get('/admin/delivery/remnants', { params }),
    confirmRemnantEntry: (id, notes) => apiClient.put(`/admin/delivery/remnant/${id}/confirm`, { notes }),
    requestRemnantDelivery: (data) => apiClient.post('/admin/delivery/remnant/request-delivery', data),
    
    // Sync routes
    syncWithSubscription: (id) => apiClient.post(`/admin/delivery/${id}/sync-subscription`),
  },

  // Subscription Management
  subscriptions: {
    getAll: (params) => apiClient.get('/admin/subscriptions', { params }),
    getById: (id) => apiClient.get(`/admin/subscriptions/${id}`),
    create: (data) => apiClient.post('/admin/subscriptions', data),
    update: (id, data) => apiClient.put(`/admin/subscriptions/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/subscriptions/${id}`),
    pause: (id) => apiClient.put(`/admin/subscriptions/${id}/pause`),
    resume: (id) => apiClient.put(`/admin/subscriptions/${id}/resume`),
    cancel: (id) => apiClient.put(`/admin/subscriptions/${id}/cancel`),
    bulkUpdate: (ids, updateData) => apiClient.put('/admin/subscriptions/bulk/update', { ids, updateData }),
    bulkDelete: (ids) => apiClient.delete('/admin/subscriptions/bulk/delete', { data: { ids } }),
    getAnalytics: () => apiClient.get('/admin/subscriptions/analytics/overview'),
    getStatistics: (params) => apiClient.get('/admin/subscriptions/statistics', { params }),
    export: (params) => apiClient.get('/admin/subscriptions/export', { params }),
  },

  // Product Management
  products: {
    getAll: (params) => apiClient.get('/admin/products', { params }),
    getById: (id) => apiClient.get(`/admin/products/${id}`),
    create: (data) => apiClient.post('/admin/products', data),
    update: (id, data) => apiClient.put(`/admin/products/update-product/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/products/delete-product/${id}`),
    toggleStatus: (id) => apiClient.patch(`/admin/products/${id}/toggle-status`),
    updateStock: (id, stock, operation = 'set') => apiClient.patch(`/admin/products/${id}/stock`, { stock, operation }),
    uploadPhoto: (id, file) => {
      const formData = new FormData();
      formData.append('photo', file);
      return apiClient.put(`/admin/products/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    bulkDelete: (productIds) => apiClient.delete('/admin/products/bulk-delete', { data: { productIds } }),
    getAnalytics: () => apiClient.get('/admin/products/analytics/overview'),
  },

  // Subscription Plan Management
  subscriptionPlans: {
    getAll: (params) => apiClient.get('/admin/subscription-plans', { params }),
    getById: (id) => apiClient.get(`/admin/subscription-plans/${id}`),
    create: (data) => apiClient.post('/admin/subscription-plans', data),
    update: (id, data) => apiClient.put(`/admin/subscription-plans/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/subscription-plans/${id}`),
    toggleStatus: (id) => apiClient.patch(`/admin/subscription-plans/${id}/toggle-status`),
    togglePopular: (id) => apiClient.patch(`/admin/subscription-plans/${id}/toggle-popular`),
    duplicate: (id) => apiClient.post(`/admin/subscription-plans/${id}/duplicate`),
    getAnalytics: () => apiClient.get('/admin/subscription-plans/analytics/overview'),
  },

  // Support Management
  support: {
    getAll: (params) => apiClient.get('/admin/supports', { params }),
    getById: (id) => apiClient.get(`/admin/supports/${id}`),
    create: (data, files) => {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (files) {
        files.forEach(file => formData.append('images', file));
      }
      return apiClient.post('/admin/supports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    updateStatus: (id, status) => apiClient.patch(`/admin/supports/${id}/status`, { status }),
    addResponse: (id, message, files) => {
      const formData = new FormData();
      formData.append('message', message);
      if (files) {
        files.forEach(file => formData.append('attachments', file));
      }
      return apiClient.post(`/admin/supports/${id}/respond`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    delete: (id) => apiClient.delete(`/admin/supports/${id}`),
    bulkUpdateStatus: (ticketIds, status) => apiClient.patch('/admin/supports/bulk/status', { ticketIds, status }),
    getStats: () => apiClient.get('/admin/supports/stats/overview'),
    getByUser: (userId, params) => apiClient.get(`/admin/supports/user/${userId}`, { params }),
  },

  // Report Management
  reports: {
    getSales: (params) => apiClient.get('/admin/reports/sales', { params }),
    getUsers: (params) => apiClient.get('/admin/reports/users', { params }),
    getInventory: (params) => apiClient.get('/admin/reports/inventory', { params }),
    getSubscriptions: (params) => apiClient.get('/admin/reports/subscriptions', { params }),
    getFinancial: (params) => apiClient.get('/admin/reports/financial', { params }),
    getRealTimeMetrics: () => apiClient.get('/admin/reports/realtime-metrics'),
    export: (reportType, config) => apiClient.post(`/admin/reports/export/${reportType}`, config),
    getSaved: () => apiClient.get('/admin/reports/saved'),
    save: (data) => apiClient.post('/admin/reports/saved', data),
    deleteSaved: (id) => apiClient.delete(`/admin/reports/saved/${id}`),
    getSchedules: () => apiClient.get('/admin/reports/schedules'),
    createSchedule: (data) => apiClient.post('/admin/reports/schedules', data),
    updateSchedule: (id, data) => apiClient.patch(`/admin/reports/schedules/${id}`, data),
    deleteSchedule: (id) => apiClient.delete(`/admin/reports/schedules/${id}`),
    getRecipients: () => apiClient.get('/admin/reports/recipients'),
  },
};