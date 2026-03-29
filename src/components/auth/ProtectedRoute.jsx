// Frontend/src/components/auth/ProtectedRoute.jsx - UPDATED
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, role = 'user' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      
      // Get token based on role
      let token, userData;
      
      switch (role) {
        case 'user':
          token = localStorage.getItem('userToken');
          userData = localStorage.getItem('userData');
          if (token && userData) {
            setIsAuthenticated(true);
          } else {
            navigate('/user/login', { replace: true, state: { from: window.location.pathname } });
          }
          break;
        case 'admin':
          token = sessionStorage.getItem('adminToken'); // Admin uses sessionStorage
          userData = sessionStorage.getItem('adminUser');
          if (token && userData) {
            setIsAuthenticated(true);
          } else {
            navigate('/admin-login', { replace: true });
          }
          break;
        case 'pandit':
          token = localStorage.getItem('panditToken');
          userData = localStorage.getItem('panditData');
          if (token && userData) {
            setIsAuthenticated(true);
          } else {
            navigate('/pandit-login', { replace: true });
          }
          break;
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [role, navigate]);
  
  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;