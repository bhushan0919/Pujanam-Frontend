// import { useState, useEffect } from 'react'
import React, { useState, useEffect } from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { analytics } from './utils/analytics';

import Header from './components/common/Header';
import Home from './pages/Home';
import Footer from './components/common/Footer.jsx';
import Services from './pages/Services.jsx';
import FindPandit from './BookPandit/FindPandit.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import ErrorBoundary from "./components/ErrorBoundary";
import PanditPortal from './pages/PanditPortal.jsx';
import UserRegister from './components/user/UserRegister';
import UserLogin from './components/user/UserLogin';
import { AuthProvider } from './context/AuthContext';
import UserDashboard from './components/user/UserDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthDebugger from './components/debug/AuthDebugger';


// ✅ Move PageTracker outside of App
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  return null;
}

// ✅ Admin Route Protection - Using sessionStorage (to match your login)
const AdminRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  
  useEffect(() => {
    // Check for token
    const token = sessionStorage.getItem("adminToken");
    console.log('🔐 AdminRoute check - Token exists:', !!token);
    console.log('📍 Current path:', window.location.pathname);
    
    setHasToken(!!token);
    
    // Short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isChecking) {
    return <div>Loading...</div>; // Or a spinner component
  }
  
  return hasToken ? children : <Navigate to="/admin-login" replace />;
};

// ✅ Pandit Route Protection  
const PanditRoute = ({ children }) => {
  const token = localStorage.getItem("panditToken");
  console.log('🔐 PanditRoute check - Token exists:', !!token);
  return token ? children : <Navigate to="/pandit-login" replace />;
};

function App() {
  useEffect(() => {
    const loadTime = performance.now();
    console.log('🕒 App mounted at:', loadTime, 'ms');
    
    const cleanupMixedTokens = () => {
      const currentPath = window.location.pathname;
      console.log('🧹 Token cleanup - Current path:', currentPath);
      
      // If on pandit routes, clear admin/user tokens
      if (currentPath.includes('/pandit')) {
        console.log('📛 On pandit route, clearing other tokens...');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        localStorage.removeItem('panditToken');
        localStorage.removeItem('panditData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
      // If on admin routes, clear pandit/user tokens
      else if (currentPath.includes('/admin')) {
        console.log('📛 On admin route, clearing other tokens...');
        // Keep admin tokens, clear others
        localStorage.removeItem('panditToken');
        localStorage.removeItem('panditData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
      // If on user routes, clear admin/pandit tokens
      else if (currentPath.includes('/user')) {
        console.log('📛 On user route, clearing other tokens...');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        localStorage.removeItem('panditToken');
        localStorage.removeItem('panditData');
      }
    };
    
    cleanupMixedTokens();

    return () => {
      const unloadTime = performance.now();
      console.log('⏱️ Total load time:', unloadTime - loadTime, 'ms');
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <PageTracker />
        <ErrorBoundary>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/find-pandit" element={<FindPandit />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            
            {/* ✅ Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            
            {/* ✅ Pandit Routes */}
            <Route path="/pandit-login" element={<PanditPortal />} />
            <Route path="/pandit" element={
              <PanditRoute>
                <PanditPortal />
              </PanditRoute>
            } />

            <Route path="/user/dashboard" element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            } />  
            
            {/* Redirect to login if accessing user routes directly */}
            <Route path="/user" element={<Navigate to="/user/login" />} />
            
            {/* ✅ 404 Route - MOVED INSIDE Routes component */}
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/'}>
                  Go Home
                </button>
              </div>
            } />
            
          </Routes>
        </ErrorBoundary>
        <AuthDebugger />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;