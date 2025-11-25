import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for auth tokens (add later)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tenant API
export const tenantAPI = {
  getAll: () => api.get('/tenants'),
  getById: (id: number) => api.get(`/tenants/${id}`),
  create: (data: any) => api.post('/tenants', data),
  delete: (id: number) => api.delete(`/tenants/${id}`),
};

// Calls API
export const callsAPI = {
  getActive: (tenantId?: number) => 
    api.get('/calls/active', { params: { tenant_id: tenantId } }),
  getCDR: (params: any) => 
    api.get('/calls/cdr', { params }),
};

// Analytics API
export const analyticsAPI = {
  getStats: (tenantId: number, period: string) =>
    api.get(`/analytics/stats/${tenantId}`, { params: { period } }),
  getCallVolume: (tenantId: number) =>
    api.get(`/analytics/call-volume/${tenantId}`),
};

export default api;