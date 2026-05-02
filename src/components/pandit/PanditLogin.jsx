// Frontend/src/components/pandit/PanditLogin.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { panditApi } from '../../api/panditApi';
import { authStorage } from '../../api/apiClient';
import LoadingSpinner from '../common/LoadingSpinner';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import '../../styles/PanditLogin.css';

const PanditLogin = ({ onLogin }) => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('🔐 Pandit login attempt...');

    // Clear previous sessions
    authStorage.clearAuth('admin');
    authStorage.clearAuth('user');
    authStorage.clearAuth('pandit');

    const result = await panditApi.login(credentials);
    console.log('✅ Login response:', result);

    if (result.success && result.token) {
      console.log('🎯 Login success');

      // ✅ DON'T save again here - panditApi.login already saved
      // Just verify the save worked
      const { token: savedToken, data: savedData } = authStorage.getAuth('pandit');
      console.log('🔍 Verification - Token saved:', !!savedToken);
      console.log('🔍 Verification - Data saved:', !!savedData);

      if (savedToken && savedData) {
        console.log('✅ Storage verified, redirecting...');
        
        // ✅ Use window.location for guaranteed redirect
        window.location.href = '/pandit';
      } else {
        console.error('❌ Storage verification failed');
        setError('Login failed - storage error');
        setLoading(false);
      }

    } else {
      setError(result.message || 'Invalid credentials');
      setLoading(false);
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    setError('Login failed. Please try again.');
    setLoading(false);
  }
};

  return (
    <div className="pandit-login-container">
      <div className="pandit-login-card">

        <div className="login-header">
          <div className="logo">
            <img src="/icon.png" alt="Pujanam" />
            <h1>Pujanam</h1>
          </div>
          <h2>Pandit Portal</h2>
          <p>Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <FontAwesomeIcon icon={faLock} />
            {loading ? <LoadingSpinner size="small" /> : ' Sign In'}
          </button>

        </form>

        <div className="login-footer">
          
          <p>Don't have an account? Contact admin</p>
          <p className="security-note">
            <FontAwesomeIcon icon={faLock} /> Secure pandit access only
          </p>
        </div>

      </div>
    </div>
  );
};

export default PanditLogin;