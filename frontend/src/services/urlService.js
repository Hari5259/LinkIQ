import api from './api';

const urlService = {
  getAll: (params = {}) => api.get('/urls', { params }).then(r => r.data),
  create: (data) => api.post('/urls', data).then(r => r.data),
  update: (id, data) => api.put(`/urls/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/urls/${id}`).then(r => r.data),
  getStats: () => api.get('/urls/stats').then(r => r.data),
};

export default urlService;
