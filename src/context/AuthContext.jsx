import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

  // Helper to make authenticated API calls
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem('auth_token');
    const headers = { ...options.headers };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    return res;
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
