import api from './api';

/**
 * Authentication service — handles register, login, and user profile.
 */
const authService = {
  /**
   * Register a new user account.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ token: string, user: object }>}
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ token: string, user: object }>}
   */
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile.
   * @returns {Promise<{ user: object }>}
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
