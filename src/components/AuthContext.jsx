import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('healthhub_token');
    const storedUser = localStorage.getItem('healthhub_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('healthhub_token', data.token);
      localStorage.setItem('healthhub_user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('healthhub_token');
    localStorage.removeItem('healthhub_user');
    setToken(null);
    setUser(null);
  };

  const isDoctor = () => user?.role === 'Doctor' || user?.role === 'Admin';
  const isNurse = () => user?.role === 'Nurse' || isDoctor();
  const isAdmin = () => user?.role === 'Admin';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isDoctor,
    isNurse,
    isAdmin,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
