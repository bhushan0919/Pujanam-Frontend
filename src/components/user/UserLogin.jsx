// Frontend/src/components/user/UserLogin.jsx - UPDATED
import React, { useState } from 'react';
import { userApi } from '../../api/userApi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import '../../styles/UserAuth.css';

const UserLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('🔄 User login attempt...');
    const result = await userApi.login(credentials);
    
    console.log('✅ Login response:', result);
    
    if (result.success) {
      // ✅ FIXED: Use authStorage consistently
      authStorage.saveAuth('user', result.token, result.customer);
      
      // Update context
      login(result.token, result.customer);
      
      console.log('🔐 User logged in');
      
      // Get previous page or default
      const previousPage = localStorage.getItem('previousPage') || '/';
      localStorage.removeItem('previousPage');
      
      // Check for pending booking
      const pendingBooking = localStorage.getItem('pendingBookingData');
      if (pendingBooking) {
        localStorage.removeItem('pendingBookingData');
        navigate('/services');
      } else {
        navigate(previousPage);
      }
    } else {
      setError(result.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    setError(error.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="user-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>User Login</h2>
          <p>Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : 'Sign In'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/user/register">Register here</Link>
            </p>
            <p>
              <Link to="/">← Back to Home</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;