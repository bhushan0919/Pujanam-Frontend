// Frontend/src/components/admin/AdminLogin.jsx - FIXED VERSION
import React, { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { useNavigate } from 'react-router-dom'; 
import { analytics } from '../../utils/analytics';
import '../../styles/AdminLogin.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faLock, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';


const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debug navigation
  React.useEffect(() => {
    console.log('🔍 AdminLogin mounted');
    console.log('   navigate function available:', !!navigate);
    console.log('   Current path:', window.location.pathname);
  }, [navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('🔄 Starting admin login...');
    const result = await adminApi.login(credentials);
    console.log('✅ Login API response:', result);
    
    if (result.success && result.token) {
        console.log('🔑 Storing authentication data in sessionStorage...');
        
           // ✅ FIX: Store in BOTH sessionStorage AND localStorage for redundancy
      // sessionStorage (tab-specific)
         sessionStorage.setItem('adminToken', result.token);
      sessionStorage.setItem('adminUser', JSON.stringify(result.user));
      
      // localStorage (persistent across tabs)
      // localStorage.setItem('adminToken', result.token);
      // localStorage.setItem('adminUser', JSON.stringify(result.user));

       if (authStorage) {
        authStorage.saveAuth('admin', result.token, result.user);
      }
        
        console.log('📝 Verification:');
        console.log('   Token stored:', sessionStorage.getItem('adminToken') ? 'Yes' : 'No');
        console.log('   User stored:', sessionStorage.getItem('adminUser') ? 'Yes' : 'No');
        
        // 🔍 DEBUG: Check current path before navigation
        console.log('📍 Current path before navigation:', window.location.pathname);
        console.log('🔍 React Router navigate function available:', !!navigate);
        
        analytics.trackAuth('login', 'admin');
        
        if (onLogin) {
          console.log('📞 Calling onLogin callback...');
          onLogin(result.user);
        }
        
        console.log('🔄 Attempting navigation to /admin...');
        
        // Try different navigation approaches
        
        // Approach 1: React Router navigate
        // console.log('Trying React Router navigate...');
          // window.location.href = '/admin';
        
        // // Approach 2: Direct window location as immediate fallback
        console.log('Also setting window.location as backup...');
        setTimeout(() => {
          console.log('📍 Path after 100ms:', window.location.pathname);
          if (window.location.pathname !== '/admin') {
            console.log('⚠️ React Router navigation failed, using window.location');
            window.location.href = '/admin';
          }
        }, 100);
        
      } else {
        console.log('❌ Login failed - response:', result);
        setError(result.message || 'Login failed - No token received');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/icon.png" alt="Pujanam Logo" />
            <h1>Pujanam</h1>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <FontAwesomeIcon icon={faTriangleExclamation}/> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="admin@pujanam.com"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          > <FontAwesomeIcon icon={faLock}/>
            {loading ? (
              <LoadingSpinner size="small" /> 
            ) : (
              ' Sign In'
            )}
          </button>

          {/* Test button */}
          <button
            type="button"
            onClick={() => {
              console.log('🧪 Manual test:');
              console.log('   navigate:', navigate);
              console.log('   localStorage:', {
                token: localStorage.getItem('adminToken'),
                user: localStorage.getItem('adminUser')
              });
              navigate('/admin');
            }}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#f0f0f0',
              border: '1px solid #ccc'
            }}
          >
            Test Navigation
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Email:</strong> admin@pujanam.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <p className="security-note">
            <FontAwesomeIcon icon={faLock}/> Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;