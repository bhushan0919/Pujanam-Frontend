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

      // ✅ Clear previous sessions (multi-role safety)
      authStorage.clearAuth('admin');
      authStorage.clearAuth('user');
      authStorage.clearAuth('pandit');

      const result = await panditApi.login(credentials);
      console.log('✅ Login response:', result);

      // ✅ Check token properly
      if (result?.token) {
        console.log('🎯 Login success');

        // ✅ Store auth (single source of truth)
        authStorage.saveAuth(
          'pandit',
          result.token,
          result.pandit,
          result.refreshToken
        );

        // Optional callback
        if (onLogin) {
          onLogin(result.pandit);
        }

        // ✅ FIX: Delay ensures React + ProtectedRoute sync
        setTimeout(() => {
          navigate('/pandit');
        }, 100);

      } else {
        setError(result.message || 'Invalid credentials');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
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
          <div className="demo-credentials">
            <h4>Test Credentials:</h4>
            <p><strong>Username:</strong> testpandit</p>
            <p><strong>Password:</strong> test123</p>
          </div>
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