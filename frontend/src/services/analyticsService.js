import api from './api';

const analyticsService = {
  getAnalytics: (urlId) => api.get(`/analytics/${urlId}`).then(r => r.data),
  getPublicStats: (shortCode) => api.get(`/analytics/public/${shortCode}`).then(r => r.data),
};

export default analyticsService;
