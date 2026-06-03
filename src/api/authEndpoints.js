// src/api/apiService.js
import apiClient from './apiClient';

class ApiService {
  // ==================== AUTH ENDPOINTS ====================
  static auth = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    getMe: () => apiClient.get('/auth/me'),
    register: (formData) => apiClient.post('/auth/register', formData),
    updatePassword: (data) => apiClient.put('/auth/updatepassword', data),
    forgotPassword: (email) => apiClient.post('/auth/forgotpassword', { email }),
    resetPassword: (token, password) => apiClient.put(`/auth/resetpassword/${token}`, { password }),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    updatePreferences: (userId, preferences) => apiClient.put(`/auth/profile/preferences/${userId}`, preferences),
    refreshToken: () => apiClient.post('/auth/refresh'),
    verifyEmail: (token, userId) => apiClient.get(`/auth/verifyemail/${token}?userId=${userId}`),
    resendVerification: () => apiClient.post('/auth/verifyemail'),
  };

}

export default ApiService;