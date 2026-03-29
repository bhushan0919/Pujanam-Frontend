// Frontend/src/components/user/UserDashboard.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/UserDashboard.css';
import { authStorage } from '../../api/apiClient';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 UserDashboard mounted');
    console.log('Auth user:', user);
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      console.log('📡 Loading user bookings...');
      setLoading(true);
      
      const result = await userApi.getBookings();
      console.log('✅ Bookings loaded:', result);
      
      if (result.success) {
        setBookings(result.bookings || []);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setError('Failed to load bookings. Please try again.');
      
      // Show demo data for testing
      setBookings(getDemoBookings());
    } finally {
      setLoading(false);
    }
  };

  const getDemoBookings = () => {
    return [
      {
        _id: '1',
        name: 'Demo Booking',
        serviceId: { name: 'Ganesh Puja', price: '₹1499/-' },
        dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        address: '123 Demo Street, Pune',
        status: 'confirmed',
        price: '₹1499/-'
      },
      {
        _id: '2',
        name: 'Test Booking',
        serviceId: { name: 'Satya Narayan Puja', price: '₹1099/-' },
        dateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        address: '456 Test Road, Mumbai',
        status: 'completed',
        price: '₹1099/-'
      }
    ];
  };

  const handleLogout = () => {
  // Clear tab-specific storage
  authStorage.clearAuth('user');
  // Clear context
  logout();
  navigate('/');
};


  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const result = await userApi.cancelBooking(bookingId);
      if (result.success) {
        alert('✅ Booking cancelled successfully');
        loadBookings(); // Refresh bookings
      }
    } catch (error) {
      alert('❌ Failed to cancel booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'notified', 'accepted', 'confirmed'].includes(booking.status);
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
      case 'notified':
        return 'status-pending';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>👤 User Dashboard</h1>
          <div className="user-info">
            <p>Welcome, <strong>{user?.name || 'User'}</strong></p>
            <p>{user?.email || 'user@example.com'} • {user?.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/services')} className="btn-book">
            📅 Book New Service
          </button>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {error}
          <button 
            onClick={loadBookings}
            style={{
              marginLeft: '15px',
              padding: '5px 10px',
              background: '#856404',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>{bookings.filter(b => ['pending', 'notified', 'accepted', 'confirmed'].includes(b.status)).length}</h3>
          <p>Upcoming</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.filter(b => b.status === 'completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.filter(b => b.status === 'cancelled').length}</h3>
          <p>Cancelled</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.length}</h3>
          <p>Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          📅 Upcoming
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed
        </button>
        <button 
          className={activeTab === 'cancelled' ? 'active' : ''}
          onClick={() => setActiveTab('cancelled')}
        >
          ❌ Cancelled
        </button>
        <button 
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          📋 All
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-section">
        <h2>Your Bookings ({filteredBookings.length})</h2>
        
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found</p>
            <button onClick={() => navigate('/services')} className="btn-primary">
              Book Your First Service
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.serviceId?.name || 'Unknown Service'}</h3>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="booking-details">
                  <p><strong>📅 Date:</strong> {new Date(booking.dateTime).toLocaleDateString()}</p>
                  <p><strong>⏰ Time:</strong> {new Date(booking.dateTime).toLocaleTimeString()}</p>
                  <p><strong>📍 Address:</strong> {booking.address || 'Not specified'}</p>
                  <p><strong>💰 Price:</strong> {booking.price || booking.serviceId?.price || 'N/A'}</p>
                  
                  {booking.message && (
                    <p><strong>📝 Note:</strong> {booking.message}</p>
                  )}
                </div>
                
                <div className="booking-actions">
                  {['pending', 'notified', 'accepted', 'confirmed'].includes(booking.status) && (
                    <button 
                      onClick={() => cancelBooking(booking._id)}
                      className="btn-cancel"
                    >
                      ❌ Cancel
                    </button>
                  )}
                  
                  <button 
                    onClick={() => alert('Contact support for changes')}
                    className="btn-contact"
                  >
                    📞 Contact Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="links-grid">
          <button onClick={() => navigate('/services')} className="link-card">
            <span>📅</span>
            <h3>Book Service</h3>
            <p>Schedule a new puja</p>
          </button>
          
          <button onClick={() => navigate('/services')} className="link-card">
            <span>👨‍💼</span>
            <h3>Find Pandits</h3>
            <p>Browse available pandits</p>
          </button>
          
          <button onClick={() => alert('Profile update coming soon!')} className="link-card">
            <span>⚙️</span>
            <h3>Profile</h3>
            <p>Update your information</p>
          </button>
          
          <button onClick={() => alert('Support: +91 9373120370')} className="link-card">
            <span>📞</span>
            <h3>Support</h3>
            <p>Get help with bookings</p>
          </button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong>
        <p>User: {JSON.stringify(user)}</p>
        <p>Bookings: {bookings.length}</p>
        <p>Active Tab: {activeTab}</p>
        <button 
          onClick={() => {
            console.log('Current state:', { user, bookings });
            loadBookings();
          }}
          style={{
            padding: '5px 10px',
            marginTop: '10px',
            background: '#e9ecef',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;