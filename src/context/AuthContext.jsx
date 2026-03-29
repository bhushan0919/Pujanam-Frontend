// Frontend/src/context/AuthContext.jsx - FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authStorage } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const { token, data } = authStorage.getAuth('user');
    
    if (token && data) {
      setUser(data);
      console.log('✅ User authenticated from storage:', data.name);
    }
    
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    authStorage.saveAuth('user', token, userData);
    setUser(userData);
  };

  const logout = () => {
    authStorage.clearAuth('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    const { token } = authStorage.getAuth('user');
    if (token) {
      authStorage.saveAuth('user', token, newUserData);
      setUser(newUserData);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser, 
      loading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};