// Frontend/src/components/pandit/PanditDashboard.jsx

import React, { useState, useEffect } from 'react';
import { panditApi } from '../../api/panditApi';
import { bookingApi } from '../../api/bookingApi';
import { authStorage } from '../../api/apiClient';
import '../../styles/PanditDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowRight, faBell, faBook, faBullhorn, faCalendar,faCheck,faCircleCheck,faIndianRupeeSign,faMobileScreen,faStar, faX, faPhone} from "@fortawesome/free-solid-svg-icons";


const PanditDashboard = ({ pandit, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(() => {
    const savedStatus = localStorage.getItem('panditOnlineStatus');
    return savedStatus ? JSON.parse(savedStatus) : (pandit?.isOnline || false);
  });
  const [error, setError] = useState('');

  // NEW STATE FOR DETAIL VIEWS
  const [detailedView, setDetailedView] = useState(null); // 'todayBookings', 'earnings', 'completed', 'ratings'
  const [detailedData, setDetailedData] = useState([]);
  const [detailedLoading, setDetailedLoading] = useState(false);


  // Load dashboard data and notifications only once on mount
  // Load dashboard data and notifications only once on mount
  useEffect(() => {
    console.log('🚀 PanditDashboard mounted - Loading all data');

    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDashboardData(),
          loadNotifications(),
          loadBookings()
        ]);
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();

    const intervalId = setInterval(() => {
      console.log('🔄 Periodic refresh...');
      loadNotifications();
      if (activeTab === 'dashboard') loadDashboardData();
      if (activeTab === 'upcoming') loadBookings();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Load specific data when tab changes
  useEffect(() => {
    console.log(`📂 Tab changed to: ${activeTab}`);

    switch (activeTab) {
      case 'notifications':
        loadNotifications();
        break;
      case 'upcoming':
        loadBookings();
        break;
      case 'dashboard':
        loadDashboardData();
        break;
    }
  }, [activeTab]);

  // Load detailed data when detailedView changes
  useEffect(() => {
    if (detailedView) {
      loadDetailedData();
    }
  }, [detailedView]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      setLoading(true);
      setError('');

      const data = await panditApi.getDashboard();

      console.log('✅ Dashboard data loaded:', data);

      if (data.success) {
        setDashboardData(data.dashboard);
      } else {
        setError(data.message || 'Failed to load dashboard');
        setDashboardData(getDemoDashboardData());
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setError('Dashboard loading failed. Showing demo data.');
      setDashboardData(getDemoDashboardData());
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedData = async () => {
  if (!detailedView) return;

  try {
    setDetailedLoading(true);
    setError(''); // Clear any previous errors

    // ✅ FIX: Get token using authStorage
    const { token, data: panditData } = authStorage.getAuth('pandit');
    
    console.log('🔍 Loading detailed data:', detailedView);
    console.log('   Token exists:', !!token);
    console.log('   Pandit data exists:', !!panditData);
    
    if (!token) {
      console.log('❌ No pandit token found');
      setError('Session expired. Please login again.');
      // Don't automatically logout - just show error
      setDetailedData([]);
      setDetailedLoading(false);
      return;
    }

    // ✅ FIX: Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() >= expiry) {
        console.log('⚠️ Token expired');
        setError('Session expired. Please login again.');
        authStorage.clearAuth('pandit');
        setDetailedData([]);
        setDetailedLoading(false);
        return;
      }
    } catch (e) {
      console.log('Could not verify token expiry');
    }

    console.log(`📊 Loading ${detailedView} details with token...`);

    switch (detailedView) {
      case 'todayBookings':
        try {
          // ✅ FIX: Use api client instead of direct fetch
          const response = await panditApi.getTodayBookings();
          if (response.success) {
            setDetailedData(response.bookings || []);
          } else {
            setDetailedData([]);
            setError(response.message || 'Failed to load today\'s bookings');
          }
        } catch (error) {
          console.error('Today bookings API error:', error);
          setDetailedData([]);
          setError(error.response?.data?.message || 'Failed to load today\'s bookings');
        }
        break;

      case 'earnings':
        try {
          const response = await panditApi.getEarnings();
          if (response.success) {
            setDetailedData(response.bookings || []);
          } else {
            setDetailedData([]);
            setError(response.message || 'Failed to load earnings');
          }
        } catch (error) {
          console.error('Earnings API error:', error);
          setDetailedData([]);
          setError(error.response?.data?.message || 'Failed to load earnings');
        }
        break;

      case 'completed':
        try {
          const response = await panditApi.getCompletedBookings();
          if (response.success) {
            setDetailedData(response.bookings || []);
          } else {
            setDetailedData([]);
            setError(response.message || 'Failed to load completed bookings');
          }
        } catch (error) {
          console.error('Completed bookings API error:', error);
          setDetailedData([]);
          setError(error.response?.data?.message || 'Failed to load completed bookings');
        }
        break;

      case 'ratings':
        try {
          const response = await panditApi.getRatings();
          if (response.success) {
            setDetailedData([{
              rating: response.rating,
              totalReviews: response.totalReviews,
              reviews: response.reviews || []
            }]);
          } else {
            // Use fallback data from dashboard
            setDetailedData([{
              rating: dashboardData?.pandit?.rating || 4.5,
              totalReviews: 24,
              reviews: []
            }]);
          }
        } catch (error) {
          console.error('Ratings API error:', error);
          // Use fallback
          setDetailedData([{
            rating: dashboardData?.pandit?.rating || 4.5,
            totalReviews: 24,
            reviews: []
          }]);
        }
        break;
    }
  } catch (error) {
    console.error(`❌ Error loading ${detailedView} details:`, error);
    setDetailedData([]);
    setError(error.message || 'Failed to load data');
  } finally {
    setDetailedLoading(false);
  }
};

  // Helper function to extract price from string
  const extractPrice = (priceString) => {
    if (!priceString) return 0;
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Fallback data for when API fails
  const getFallbackDetailedData = (view) => {
    switch (view) {
      case 'todayBookings':
        return [
          {
            _id: 'fb1',
            name: 'Rajesh Sharma',
            contact: '9876543210',
            serviceId: { name: 'Ganesh Puja', price: '₹1499/-' },
            dateTime: new Date(Date.now() + 2 * 3600000).toISOString(),
            address: '123 Shivaji Nagar, Pune',
            status: 'confirmed',
            price: '₹1499/-',
            actualPrice: 1499
          },
          {
            _id: 'fb2',
            name: 'Priya Patel',
            contact: '9876543211',
            serviceId: { name: 'Satya Narayan Puja', price: '₹1099/-' },
            dateTime: new Date(Date.now() + 5 * 3600000).toISOString(),
            address: '456 FC Road, Pune',
            status: 'accepted',
            price: '₹1099/-',
            actualPrice: 1099
          }
        ];

      case 'earnings':
        return [
          {
            _id: 'e1',
            name: 'Amit Kumar',
            serviceId: { name: 'Ganesh Puja' },
            dateTime: new Date(Date.now() - 2 * 86400000).toISOString(),
            price: '₹1499/-',
            actualPrice: 1499,
            earnings: 1499
          },
          {
            _id: 'e2',
            name: 'Sunita Desai',
            serviceId: { name: 'Satya Narayan Puja' },
            dateTime: new Date(Date.now() - 4 * 86400000).toISOString(),
            price: '₹1099/-',
            actualPrice: 1099,
            earnings: 1099
          },
          {
            _id: 'e3',
            name: 'Vikram Singh',
            serviceId: { name: 'Lakshmi Puja' },
            dateTime: new Date(Date.now() - 7 * 86400000).toISOString(),
            price: '₹1999/-',
            actualPrice: 1999,
            earnings: 1999
          }
        ];

      case 'completed':
        return [
          {
            _id: 'c1',
            name: 'Amit Kumar',
            contact: '9876543212',
            serviceId: { name: 'Ganesh Puja', price: '₹1499/-' },
            dateTime: new Date(Date.now() - 2 * 86400000).toISOString(),
            address: '789 Koregaon Park, Pune',
            status: 'completed',
            price: '₹1499/-'
          },
          {
            _id: 'c2',
            name: 'Sunita Desai',
            contact: '9876543213',
            serviceId: { name: 'Satya Narayan Puja', price: '₹1099/-' },
            dateTime: new Date(Date.now() - 4 * 86400000).toISOString(),
            address: '321 Kothrud, Pune',
            status: 'completed',
            price: '₹1099/-'
          }
        ];

      case 'ratings':
        return [
          {
            rating: 4.5,
            totalReviews: 24,
            reviews: [
              {
                customerName: 'Rajesh',
                rating: 5,
                comment: 'Very knowledgeable and punctual pandit. Highly recommended!',
                date: new Date(Date.now() - 5 * 86400000).toISOString()
              },
              {
                customerName: 'Priya',
                rating: 4,
                comment: 'Good experience. Performed puja with proper rituals.',
                date: new Date(Date.now() - 10 * 86400000).toISOString()
              }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const getDemoDashboardData = () => {
    return {
      pandit: {
        name: 'Demo Pandit',
        rating: 4.5,
        isOnline: true,
        location: 'Pune',
        experience: 5
      },
      todayBookings: 2,
      completedBookings: 15,
      totalEarnings: 7500,
      upcomingBookings: 3,
      notificationsCount: 1,
      todayBookingsList: [
        {
          _id: 'demo1',
          serviceId: { name: 'Ganesh Puja', price: '₹1499/-' },
          dateTime: new Date(Date.now() + 3600000).toISOString(),
          customerName: 'Customer 1'
        },
        {
          _id: 'demo2',
          serviceId: { name: 'Satya Narayan Puja', price: '₹1099/-' },
          dateTime: new Date(Date.now() + 7200000).toISOString(),
          customerName: 'Customer 2'
        }
      ],
      stats: {
        totalBookings: 20,
        completionRate: 75
      }
    };
  };

  const handleStatCardClick = (section) => {
    console.log(`📊 Clicked on ${section}`);

    // Check if pandit is authenticated
    const token = localStorage.getItem('panditToken');
    if (!token) {
      console.log('❌ No pandit token found');
      alert('Please login again to view details');
      handleLogout();
      return;
    }

    setDetailedView(section);
  };

  const closeDetailedView = () => {
    setDetailedView(null);
    setDetailedData([]);
  };

  const handleLogout = () => {
    console.log('🚪 Pandit logging out...');

    // Clear localStorage
    localStorage.removeItem('panditToken');
    localStorage.removeItem('panditData');

    // Clear sessionStorage if using tab-specific storage
    const tabId = sessionStorage.getItem('tabId');
    if (tabId) {
      sessionStorage.removeItem(`panditToken_${tabId}`);
      sessionStorage.removeItem(`panditData_${tabId}`);
    }

    // Call parent's onLogout if provided
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    } else {
      // Fallback: redirect to login
      window.location.href = '/pandit-login';
    }
  };

  const loadBookings = async () => {
    try {
      console.log('📅 Loading bookings for tab:', activeTab);
      const status = activeTab === 'pending' ? 'notified' :
        activeTab === 'confirmed' ? 'confirmed' :
          activeTab === 'upcoming' ? 'accepted' : '';

      const params = status ? { status } : {};
      const res = await bookingApi.getPanditBookings(params);
      console.log('✅ Bookings loaded:', res.bookings?.length || 0);
      setBookings(res.bookings || []);
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]); // Set empty array on error
    }
  };



  const loadNotifications = async () => {
    try {
      console.log('🔔 Loading notifications...');
      const res = await panditApi.getNotifications();
      console.log('✅ Notifications response:', res);

      if (res.success) {
        setNotifications(res.notifications || []);
        console.log(`📨 Loaded ${res.notifications?.length || 0} notifications`);

        // If no notifications, show demo for testing
        if (res.notifications?.length === 0) {
          console.log('⚠️ No notifications, showing demo data');
          setNotifications([
            {
              _id: 'demo1',
              bookingId: 'demo1',
              serviceName: 'Satya Narayan Puja',
              bookingDateTime: new Date(Date.now() + 86400000).toISOString(),
              location: 'Pune',
              customerName: 'Test Customer',
              price: '₹1099/-',
              contact: '9876543210',
              address: '123 Test Street, Pune',
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } else {
        console.log('⚠️ API returned error:', res.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);

      // Show demo notifications for testing
      setNotifications([
        {
          _id: 'demo1',
          bookingId: 'demo1',
          serviceName: 'Ganesh Puja',
          bookingDateTime: new Date(Date.now() + 86400000).toISOString(),
          location: 'Mumbai',
          customerName: 'Demo Customer',
          price: '₹1499/-',
          contact: '9876543210',
          address: '456 Demo Road, Mumbai',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };


  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = !isOnline;
      console.log('🔄 Toggling availability to:', newStatus);
      await panditApi.updateAvailability({ isOnline: newStatus });
      setIsOnline(newStatus);
      // Update localStorage immediately
      localStorage.setItem('panditOnlineStatus', JSON.stringify(newStatus));
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      alert('Failed to update availability');
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      console.log('✅ Accepting booking:', bookingId);
      const result = await bookingApi.acceptBooking(bookingId);

      if (result.success) {
        alert('✅ Booking accepted successfully!');

        // Reload data
        loadBookings();
        loadNotifications();
        loadDashboardData();
      } else {
        alert('❌ Failed to accept booking: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Error accepting booking:', error);
      alert('❌ Failed to accept booking: ' + (error.response?.data?.message || error.message));
    }
  };




  const completeBooking = async (bookingId) => {
    try {
      await bookingApi.updateBooking(bookingId, { status: 'completed' });
      alert('Booking marked as completed!');
      loadBookings();
    } catch (error) {
      alert('Failed to complete booking: ' + error.message);
    }
  };


  const handleTabChange = (tab) => {
    console.log(`📂 Switching to tab: ${tab}`);
    setActiveTab(tab);

    // Load appropriate data when switching tabs
    if (tab === 'notifications') {
      console.log('🔔 Loading notifications for notifications tab...');
      loadNotifications();
    } else if (tab === 'upcoming') {
      console.log('📅 Loading bookings for upcoming tab...');
      loadBookings();
    }
  };

  // Debug function
  const checkAuth = () => {
    const token = localStorage.getItem('panditToken');
    const data = localStorage.getItem('panditData');

    console.log('🔍 Auth Check:');
    console.log('   Token exists:', !!token);
    if (token) {
      console.log('   Token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('   Token length:', token.length);
    }
    console.log('   Pandit data exists:', !!data);
    if (data) {
      try {
        const panditData = JSON.parse(data);
        console.log('   Pandit name:', panditData.name);
        console.log('   Pandit ID:', panditData.id);
      } catch (e) {
        console.log('   Error parsing pandit data:', e);
      }
    }

    return !!token;
  };

  // Call this when component mounts and before API calls
  useEffect(() => {
    checkAuth();
  }, []);

  // loading state
  if (loading && !dashboardData) {
    return (
      <div className="pandit-dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Loading your dashboard...</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
        <p className="loading-hint">
          If this takes too long, try:
          <ul>
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Contacting support if the problem persists</li>
          </ul>
        </p>
        <button
          onClick={() => {
            setLoading(false);
            setDashboardData(getDemoDashboardData());
          }}
          className="btn-skip"
        >
          ⏩ Skip loading & use demo data
        </button>
      </div>
    );
  }

  return (
    <div className="pandit-dashboard">
      {/* Debug Info - Remove in production */}
      <div style={{
        background: '#fff3cd',
        padding: '10px',
        margin: '10px',
        borderRadius: '5px',
        border: '1px solid #ffeaa7'
      }}>
        <strong>Debug Info:</strong>
        Dashboard: {dashboardData ? '✅ Loaded' : '❌ Loading'} |
        Bookings: {bookings.length} |
        Online: {isOnline ? '✅' : '❌'} |
        Error: {error || 'None'}
      </div>

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faBook}/> Pandit Dashboard</h1>
          <div className="pandit-info">
            <span>Welcome, <strong>{pandit?.name || 'Pandit'}</strong></span>
            <div className="online-status">
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
              <span>{isOnline ? 'Online - Receiving Bookings' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="availability-toggle">
            <label>Go Online</label>
            <div
              className={`toggle-switch ${isOnline ? 'active' : ''}`}
              onClick={handleAvailabilityToggle}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn"><FontAwesomeIcon icon={faArrowRight}/> Logout</button>
        </div>
      </div>
      <button
  onClick={debugNotifications}
  style={{
    padding: '10px',
    background: '#9c27b0',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    margin: '10px',
    cursor: 'pointer'
  }}
>
  🐛 Debug Notifications
</button>

      {error && (
        <div className="error-message" style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          ⚠️ {error}
          <br />
          <small>Showing demo data for testing</small>
        </div>
      )}

      {/* Stats Overview - NOW CLICKABLE */}
      <div className="stats-overview">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick('todayBookings')}
        >
          <div className="stat-icon"><FontAwesomeIcon icon={faCalendar}/></div>
          <div className="stat-info">
            <h3>{dashboardData?.todayBookings || 0}</h3>
            <p>Today's Bookings</p>
            <small>Click to view details</small>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick('earnings')}
        >
          <div className="stat-icon"><FontAwesomeIcon icon={faIndianRupeeSign}/></div>
          <div className="stat-info">
            <h3>₹{dashboardData?.totalEarnings?.toLocaleString() || 0}</h3>
            <p>Total Earnings</p>
            <small>From {dashboardData?.completedBookings || 0} completed pujas</small>
            <small>Click to view earnings breakdown</small>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick('completed')}
        >
          <div className="stat-icon"><FontAwesomeIcon icon={faStar}/></div>
          <div className="stat-info">
            <h3>{pandit?.rating || '4.8'}</h3>
            <p>Your Rating</p>
            <small>Click to view rating details</small>
          </div>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick('completed')}
        >
          <div className="stat-icon"><FontAwesomeIcon icon={faCircleCheck}/></div>
          <div className="stat-info">
            <h3>{dashboardData?.completedBookings || 0}</h3>
            <p>Completed</p>
            <small>Click to view history</small>
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      {detailedView && (
        <div className="modal-overlay">
          {/* Modal content - this should be clear */}
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {detailedView === 'todayBookings' && "📅 Today's Bookings"}
                {detailedView === 'earnings' && "💰 Earnings Breakdown"}
                {detailedView === 'completed' && "✅ Completed Pujas History"}
                {detailedView === 'ratings' && "⭐ Rating Details"}
              </h2>
              <button className="close-btn" onClick={closeDetailedView}>✕</button>
            </div>

            <div className="modal-body">

       
              {error && (
          <div className="error-message" style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb'
          }}>
            ⚠️ {error}
            <button 
              onClick={() => {
                setError('');
                loadDetailedData(); // Retry
              }}
              style={{
                marginLeft: '15px',
                padding: '5px 10px',
                background: '#721c24',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
              {detailedLoading ? (
                <div className="loading">Loading details...</div>
              ) : detailedData.length === 0 ? (
                <div className="no-data">
                  <p>No data available</p>
                </div>
              ) : (
                <div className="detailed-list">
                  {detailedView === 'todayBookings' && (
                    <div className="bookings-details">
                      <h3>Today's Schedule ({detailedData.length})</h3>
                      {detailedData.map(booking => (
                        <div key={booking._id} className="detailed-booking-item">
                          <div className="booking-time">
                            <strong>{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                            <span>{new Date(booking.dateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="booking-info">
                            <h4>{booking.serviceId?.name || 'Puja Service'}</h4>
                            <p>Customer: {booking.name}</p>
                            <p>Contact: {booking.contact}</p>
                            <p>Address: {booking.address}</p>
                          </div>
                          <div className="booking-price">
                            <span className="price">{booking.price || booking.serviceId?.price || 'N/A'}</span>
                            <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailedView === 'earnings' && (
                    <div className="earnings-details">
                      <div className="total-summary">
                        <h3>Total Earnings: ₹{detailedData.reduce((sum, item) => sum + (item.earnings || 0), 0).toLocaleString()}</h3>
                        <p>From {detailedData.length} completed pujas</p>
                      </div>

                      <div className="earnings-list">
                        <h4>Earnings Breakdown:</h4>
                        {detailedData.map((item, index) => (
                          <div key={item._id || index} className="earning-item">
                            <div className="earning-date">
                              {new Date(item.date).toLocaleDateString()}
                            </div>
                            <div className="earning-service">
                              <strong>{item.serviceName}</strong>
                              <small>Customer: {item.name}</small>
                            </div>
                            <div className="earning-amount">
                              <span className="amount">₹{item.earnings?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailedView === 'completed' && (
                    <div className="completed-details">
                      <h3>Completed Pujas History ({detailedData.length})</h3>
                      {detailedData.map(booking => (
                        <div key={booking._id} className="completed-item">
                          <div className="completed-date">
                            <strong>{new Date(booking.dateTime).toLocaleDateString()}</strong>
                            <span>{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="completed-info">
                            <h4>{booking.serviceId?.name || 'Puja Service'}</h4>
                            <p>Customer: {booking.name}</p>
                            <p>Contact: {booking.contact}</p>
                            <p className="address">{booking.address}</p>
                          </div>
                          <div className="completed-status">
                            <span className="price">{booking.price || 'N/A'}</span>
                            <span className="status-completed">✅ Completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailedView === 'ratings' && (
                    <div className="ratings-details">
                      <div className="rating-summary">
                        <div className="rating-number">
                          <h1>{pandit?.rating || 4.5}</h1>
                          <p>/ 5</p>
                        </div>
                        <div className="rating-stars">
                          {'★'.repeat(Math.floor(pandit?.rating || 4.5))}
                          {'☆'.repeat(5 - Math.floor(pandit?.rating || 4.5))}
                        </div>
                        <p>Based on {detailedData[0]?.reviews || 24} reviews</p>
                      </div>

                      <div className="recent-reviews">
                        <h4>Recent Feedback:</h4>
                        <div className="review-item">
                          <p>"Very professional and knowledgeable pandit."</p>
                          <span className="reviewer">- Customer A</span>
                        </div>
                        <div className="review-item">
                          <p>"Excellent service, arrived on time."</p>
                          <span className="reviewer">- Customer B</span>
                        </div>
                        {/* Add more reviews from backend */}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={closeDetailedView}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-overlay" onClick={closeDetailedView}></div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <FontAwesomeIcon icon={faBook}/> Dashboard
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          <FontAwesomeIcon icon={faBell}/> Notifications ({notifications.length})
        </button>
        <button
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          <FontAwesomeIcon icon={faCalendar}/> Upcoming
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="section">
              <h3>Today's Schedule</h3>
              {bookings.filter(b => isToday(new Date(b.dateTime))).length > 0 ? (
                <div className="bookings-list">
                  {bookings.filter(b => isToday(new Date(b.dateTime))).map(booking => (
                    <BookingCard key={booking._id} booking={booking} onAccept={acceptBooking} onComplete={completeBooking} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No bookings for today</p>
                  <small>When you receive bookings, they will appear here</small>
                </div>
              )}
            </div>

            <div className="section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setActiveTab('notifications')}>
                  <span><FontAwesomeIcon icon={faBell}/></span>
                  View Notifications
                </button>
                <button className="action-btn" onClick={handleAvailabilityToggle}>
                  <span>{isOnline ? '⏸️' : '▶️'}</span>
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                <button className="action-btn" onClick={() => alert('Profile update coming soon!')}>
                  <span><FontAwesomeIcon icon={faMobileScreen}/></span>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-content">
            <h3>Booking Notifications</h3>
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <NotificationCard
                    notification={notification}
                    onAccept={acceptBooking}
                    setNotifications={setNotifications} // ← Pass it
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No new notifications</p>
                <small>You will receive notifications when new bookings match your profile</small>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="bookings-content">
            <h3>Upcoming Bookings</h3>
            {bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onAccept={acceptBooking}
                    onComplete={completeBooking}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No upcoming bookings</p>
                <small>Accepted bookings will appear here</small>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          console.log('🔍 Debug - Current auth state:');
          console.log('Pandit token:', localStorage.getItem('panditToken') ? 'Present' : 'Missing');
          console.log('Pandit data:', localStorage.getItem('panditData'));
          console.log('Current URL:', window.location.href);
          console.log('API Base URL:', process.env.VITE_API_BASE_URL);

          // Test API call manually
          const token = localStorage.getItem('panditToken');
          if (token) {
            fetch('http://localhost:5000/api/pandit/notifications', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
              .then(res => {
                console.log('API Status:', res.status);
                return res.json();
              })
              .then(data => console.log('API Response:', data))
              .catch(err => console.error('API Error:', err));
          }
        }}
        style={{
          padding: '10px',
          background: '#ffc107',
          color: '#000',
          border: 'none',
          borderRadius: '5px',
          margin: '10px',
          cursor: 'pointer'
        }}
      >
        Debug Auth
      </button>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onAccept, onComplete }) => (
  <div className="booking-card">
    <div className="booking-info">
      <h4>{booking.serviceId?.name || 'Puja Service'}</h4>
      <p><strong>Customer:</strong> {booking.name || 'N/A'}</p>
      <p><strong>When:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
      <p><strong>Where:</strong> {booking.address || 'N/A'}</p>
      <p><strong>Contact:</strong> {booking.contact || 'N/A'}</p>
      <p><strong>Price:</strong> {booking.price || 'N/A'}</p>
      <span className={`status-badge ${booking.status}`}>{booking.status}</span>
    </div>

    <div className="booking-actions">
      
      {/* Accept */}
      {['notified', 'pending'].includes(booking.status) && (
        <button
          onClick={() => onAccept(booking._id)}
          className="btn-accept"
        >
          <FontAwesomeIcon icon={faCircleCheck}/> Accept
        </button>
      )}

      {/* Complete */}
      {booking.status === 'accepted' && (
        <button
          onClick={() => onComplete(booking._id)}
          className="btn-complete"
        >
          <FontAwesomeIcon icon={faCheck}/> Complete
        </button>
      )}

      {/* Call */}
      <a href={`tel:${booking.contact}`} className="btn-call">
        <FontAwesomeIcon icon={faPhone}/> Call
      </a>

    </div>
  </div>
);

// Notification Card Component
// Frontend/src/components/pandit/PanditDashboard.jsx
// Replace the NotificationCard component

const NotificationCard = ({ notification, onAccept, setNotifications }) => {
  // Format date safely
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Date not specified';
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return 'Date not specified';
      return date.toLocaleString();
    } catch (e) {
      return 'Date not specified';
    }
  };

  return (
    <div className="notification-card">
      <div className="notification-info">
        <h4>
          <FontAwesomeIcon icon={faBullhorn}/> 
          New Booking: {notification.serviceName || 'Puja Service'}
        </h4>
        
        <div className="notification-details">
          <p><strong>👤 Customer:</strong> {notification.customerName || 'Not provided'}</p>
          <p><strong>📞 Contact:</strong> {notification.customerContact || notification.contact || 'Not provided'}</p>
          {notification.customerEmail && notification.customerEmail !== 'N/A' && (
            <p><strong>📧 Email:</strong> {notification.customerEmail}</p>
          )}
          <p><strong>📅 Date & Time:</strong> {formatDateTime(notification.bookingDateTime)}</p>
          <p><strong>📍 Location:</strong> {notification.location || 'Not specified'}</p>
          <p><strong>🏠 Address:</strong> {notification.address || 'Not provided'}</p>
          <p><strong>💰 Price:</strong> {notification.price || notification.servicePrice || 'N/A'}</p>
          {notification.message && (
            <p><strong>💬 Message:</strong> {notification.message}</p>
          )}
          <p className="notification-time">
            <strong>🕐 Received:</strong> {formatDateTime(notification.createdAt)}
          </p>
        </div>
      </div>
      
      <div className="notification-actions">
        {/* Accept Button */}
        <button
          onClick={() => onAccept(notification.bookingId)}
          className="btn-accept"
        >
          <FontAwesomeIcon icon={faCheck}/> Accept Booking
        </button>

        {/* Dismiss Button */}
        <button
          onClick={async () => {
            try {
              await panditApi.markNotificationRead(notification._id);
              if (setNotifications) {
                setNotifications(prev => prev.filter(n => n._id !== notification._id));
              }
            } catch (error) {
              console.error('Error dismissing notification:', error);
            }
          }}
          className="btn-dismiss"
        >
          <FontAwesomeIcon icon={faX}/> Dismiss
        </button>
      </div>
    </div>
  );
};
// Helper function
const isToday = (someDate) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

// Add this debug function inside PanditDashboard component
const debugNotifications = async () => {
  console.log('🔍 DEBUG: Fetching notifications raw data...');
  try {
    const { token } = authStorage.getAuth('pandit');
    console.log('Token exists:', !!token);
    
    const response = await fetch('http://localhost:5000/api/pandit/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const rawData = await response.json();
    console.log('📦 RAW API RESPONSE:', JSON.stringify(rawData, null, 2));
    
    // Also check localStorage for any stored notifications
    console.log('📦 LocalStorage check:', {
      pandit_token: localStorage.getItem('pandit_token')?.substring(0, 30),
      pandit_data: localStorage.getItem('pandit_data')
    });
    
    alert('Check console for raw API response');
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Add a debug button in the dashboard



export default PanditDashboard;