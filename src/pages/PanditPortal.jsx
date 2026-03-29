// Frontend/src/pages/PanditPortal.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { panditApi } from '../api/panditApi';
import PanditLogin from '../components/pandit/PanditLogin';
import PanditDashboard from '../components/pandit/PanditDashboard';
import '../styles/PanditDashboard.css';
import { useNavigate } from 'react-router-dom';

const PanditPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 PanditPortal mounted');
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    console.log('🔄 Checking authentication...');
    
    const token = localStorage.getItem('panditToken');
    const panditData = localStorage.getItem('panditData');
    
    console.log('   Token:', token ? '✅ Present' : '❌ Missing');
    console.log('   Data:', panditData ? '✅ Present' : '❌ Missing');
    
    if (token && panditData) {
      try {
        const parsedData = JSON.parse(panditData);
        setIsAuthenticated(true);
        setPandit(parsedData);
        console.log('✅ Pandit authenticated:', parsedData.name);
      } catch (error) {
        console.error('❌ Error parsing pandit data:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const handleLogin = (loginResult) => {
  console.log('🎯 Login successful, result:', loginResult);
  
  if (loginResult.success && loginResult.token) {
    // Store in localStorage
    localStorage.setItem('panditToken', loginResult.token);
    localStorage.setItem('panditData', JSON.stringify(loginResult.pandit));
    
    // Update state
    setIsAuthenticated(true);
    setPandit(loginResult.pandit);
    
    console.log('🔐 Authentication stored');
    
    // ✅ FIX: Use window.location for hard redirect
    console.log('🔄 Hard redirecting to /pandit...');
    window.location.href = '/pandit'; // This will force a full page reload
    
    // OR use navigate with replace
    // navigate('/pandit', { replace: true });
  }
};

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('panditToken');
    localStorage.removeItem('panditData');
    setIsAuthenticated(false);
    setPandit(null);
    navigate('/pandit-login');
  };

  if (loading) {
    return (
      <div className="pandit-portal-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Debug info
  console.log('📊 PanditPortal Render State:', {
    isAuthenticated,
    panditName: pandit?.name,
    currentPath: window.location.pathname
  });

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <PanditLogin onLogin={handleLogin} />;
  }

  // If authenticated, show dashboard
  return <PanditDashboard pandit={pandit} onLogout={handleLogout} />;
};

export default PanditPortal;