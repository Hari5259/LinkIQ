import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages authentication state across the app.
 * 
 * Stores JWT token and user data in localStorage for persistence.
 * Validates token on mount by calling /auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('linkiq_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data.user);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('linkiq_token');
        localStorage.removeItem('linkiq_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('linkiq_token', newToken);
    localStorage.setItem('linkiq_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return response;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authService.register({ name, email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('linkiq_token', newToken);
    localStorage.setItem('linkiq_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return response;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('linkiq_token');
    localStorage.removeItem('linkiq_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
