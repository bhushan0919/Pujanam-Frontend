// Frontend/src/components/pandit/PanditDashboard.jsx

import React, { useState, useEffect } from 'react';
import { panditApi } from '../../api/panditApi';
import { bookingApi } from '../../api/bookingApi';
import { authStorage } from '../../api/apiClient';
import '../../styles/PanditDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBell, faBook, faBullhorn, faCalendar, faSyncAlt, faCheck, faCircleCheck, faIndianRupeeSign, faMobileScreen, faStar, faX, faPhone, faPencil, faMicrophone, faForwardFast, faNoteSticky, faEnvelope, faLocation, faAddressCard, faInr, faComment, faClockFour } from "@fortawesome/free-solid-svg-icons";
import { useSocket } from '../../context/SocketContext';
import { useCallback } from 'react';
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import API_CONFIG, { buildUrl } from '../../config';




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
  // verification code generation
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);// Add this state
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeStatus, setCodeStatus] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { socket, isConnected } = useSocket();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedBookingForWA, setSelectedBookingForWA] = useState(null);
  const [samagriItems, setSamagriItems] = useState([]);
  const [newSamagriItem, setNewSamagriItem] = useState('');
  const [samagriOption, setSamagriOption] = useState('pandit_brings'); // pandit_brings or user_brings
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [customTiming, setCustomTiming] = useState('');
  // Add this state with other states
  const [customTime, setCustomTime] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);




  const loadDashboardData = useCallback(async () => {
    try {
      //console.log('📊 Loading dashboard data...');
      setLoading(true);
      setError('');

      const data = await panditApi.getDashboard();

      //console.log('✅ Dashboard data loaded:', data);

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
  }, []);

  const loadBookings = async () => {
    try {
      //console.log('📅 Loading bookings for tab:', activeTab);
      const status = activeTab === 'pending' ? 'notified' :
        activeTab === 'confirmed' ? 'confirmed' :
          activeTab === 'upcoming' ? 'accepted' : '';

      const params = status ? { status } : {};
      const res = await bookingApi.getPanditBookings(params);
      //console.log('✅ Bookings loaded:', res.bookings?.length || 0);
      setBookings(res.bookings || []);
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setBookings([]); // Set empty array on error
    }
  };


  const loadNotifications = async () => {
    try {
      //console.log('🔔 Loading notifications...');
      const res = await panditApi.getNotifications();
      //console.log('✅ Notifications response:', res);

      if (res.success) {
        setNotifications(res.notifications || []);
        //console.log(`📨 Loaded ${res.notifications?.length || 0} notifications`);

        // If no notifications, show demo for testing
        if (res.notifications?.length === 0) {
          //console.log('📭 No notifications found');
          setNotifications([]); // ✅ keep empty
        }
      } else {
        //console.log('⚠️ API returned error:', res.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };



  // Load dashboard data and notifications only once on mount
  // Load dashboard data and notifications only once on mount
  useEffect(() => {
    //console.log('🚀 PanditDashboard mounted - Loading all data');

    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDashboardData(),
          loadNotifications(),
          loadBookings()
        ]);
        //console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();

    const intervalId = setInterval(() => {
      //console.log('🔄 Periodic refresh...');
      loadNotifications();
      if (activeTab === 'dashboard') loadDashboardData();
      if (activeTab === 'upcoming') loadBookings();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Load specific data when tab changes
  useEffect(() => {
    //console.log(`📂 Tab changed to: ${activeTab}`);

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

  useEffect(() => {
    if (!socket) return;

    // Listen for remove_notification events
    const handleRemoveNotification = (data) => {
      //console.log('📡 Received remove_notification:', data);
      // Remove the notification from the list
      setNotifications(prev =>
        prev.filter(notification => notification.bookingId !== data.bookingId)
      );

      // Show toast notification (optional)
      if (data.message) {
        alert(data.message);
      }
    };
    // Listen for booking_accepted events (for the accepting pandit)
    const handleBookingAccepted = (data) => {
      //console.log('📡 Booking accepted:', data);
      // Refresh bookings to show the accepted status
      loadBookings();
      loadDashboardData();
    };

    socket.on('remove_notification', handleRemoveNotification);
    socket.on('booking_accepted', handleBookingAccepted);

    return () => {
      socket.off('remove_notification', handleRemoveNotification);
      socket.off('booking_accepted', handleBookingAccepted);
    };
  }, [socket, loadBookings, loadDashboardData]);

  // Load detailed data when detailedView changes
  useEffect(() => {
    if (detailedView) {
      loadDetailedData();
    }
  }, [detailedView]);





  const loadDetailedData = async () => {
    if (!detailedView) return;

    try {
      setDetailedLoading(true);
      setError(''); // Clear any previous errors

      // ✅ FIX: Get token using authStorage
      const { token, data: panditData } = authStorage.getAuth('pandit');

      //console.log('🔍 Loading detailed data:', detailedView);
      //console.log('   Token exists:', !!token);
      //console.log('   Pandit data exists:', !!panditData);

      if (!token) {
        //console.log('❌ No pandit token found');
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
          //console.log('⚠️ Token expired');
          setError('Session expired. Please login again.');
          authStorage.clearAuth('pandit');
          setDetailedData([]);
          setDetailedLoading(false);
          return;
        }
      } catch (e) {
        //console.log('Could not verify token expiry');
      }

      //console.log(`📊 Loading ${detailedView} details with token...`);

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

  useEffect(() => {
    let activityInterval;

    const updateActivity = async () => {
      try {
        const { token } = authStorage.getAuth('pandit');
        if (token && isOnline) {
          await fetch(buildUrl('/pandit/update-activity'), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          //console.log('🔄 Activity updated');
        }
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    };

    // Update activity every 5 minutes
    activityInterval = setInterval(updateActivity, 5 * 60 * 1000);

    // Update activity on user interaction
    const handleUserActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [isOnline]);

  // Check online status periodically
  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        const { token } = authStorage.getAuth('pandit');
        if (token) {
          const response = await fetch(buildUrl('/pandit/online-status'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.isOnline !== isOnline) {
            setIsOnline(data.isOnline);
            localStorage.setItem('panditOnlineStatus', JSON.stringify(data.isOnline));
          }
        }
      } catch (error) {
        console.error('Error checking online status:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkOnlineStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [isOnline]);


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
    //console.log(`📊 Clicked on ${section}`);

    // Check if pandit is authenticated
    const { token } = authStorage.getAuth('pandit');
    if (!token) {
      //console.log('❌ No pandit token found');
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
  useEffect(() => {
    if (socket && isConnected && pandit?.id) {
      socket.emit('register', {
        userId: pandit.id,
        role: 'pandit'
      });
    }
  }, [socket, isConnected, pandit]);

  const handleLogout = () => {
    //console.log('🚪 Pandit logging out...');

    // ✅ Use authStorage to clear (handles all key formats)
    authStorage.clearAuth('pandit');

    // Also clear online status
    localStorage.removeItem('panditOnlineStatus');

    // Call parent's onLogout if provided
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    } else {
      navigate('/pandit-login');
    }
  };







  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = !isOnline;
      //console.log('🔄 Toggling availability to:', newStatus);
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
      //console.log('✅ Accepting booking:', bookingId);
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


  const refreshAllData = async () => {
    setIsRefreshing(true);
    //console.log('🔄 Refreshing all dashboard data...');

    try {
      // Refresh based on current active tab
      if (activeTab === 'dashboard') {
        await loadDashboardData();
      }

      if (activeTab === 'upcoming' || activeTab === 'pending' || activeTab === 'confirmed') {
        await loadBookings();
      }

      if (activeTab === 'notifications') {
        await loadNotifications();
      }

      // Always refresh these regardless of tab
      await loadDashboardData(); // For stats
      await loadBookings(); // For counts

      //console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate verification code
  // Generate verification code - DON'T show code to pandit
  const generateVerificationCode = async (bookingId) => {
    //console.log('🔐 Generating code for booking:', bookingId);

    try {
      setIsGeneratingCode(true);
      const { token, data: panditData } = authStorage.getAuth('pandit');

      //console.log('   Pandit ID:', panditData?.id);
      //console.log('   Token exists:', !!token);

      if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = '/pandit-login';
        return;
      }

      // ✅ Fix URL - remove ${base}
      const response = await fetch(buildUrl(`/pandit/bookings/${bookingId}/generate-code`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      //console.log('Generate code response:', data);

      if (data.success) {
        alert('✅ Verification code has been generated and sent to customer.\n\nPlease ask the customer to provide the code from their dashboard.');
        setCodeGenerated(true);
        setShowCodeModal(false);
        loadBookings();
        loadDashboardData();
      } else {
        alert('❌ Failed to generate code: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('❌ Error generating code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Verify code and complete booking
  const verifyAndComplete = async (bookingId) => {
    if (!enteredCode || enteredCode.length !== 6) {
      alert('Please enter the 6-digit verification code');
      return;
    }

    try {
      setIsVerifying(true);
      const { token } = authStorage.getAuth('pandit');

      const response = await fetch(buildUrl(`/pandit/bookings/${bookingId}/verify-code`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: enteredCode })
      });

      const data = await response.json();
      //console.log('Verify code response:', data);

      if (data.success) {
        alert('✅ Booking completed successfully!');
        setShowCodeModal(false);
        setEnteredCode('');
        setVerificationCode('');
        setSelectedBooking(null);

        // Refresh data
        loadBookings();
        loadDashboardData();
        loadNotifications();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('❌ Error verifying code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Open code modal for a booking
  const openCodeModal = async (booking) => {
    //console.log('🎯 openCodeModal called with booking:', booking);
    //console.log('   Booking ID:', booking?._id);
    //console.log('   Booking status:', booking?.status);

    if (!booking || !booking._id) {
      console.error('❌ Invalid booking object');
      alert('Error: Invalid booking data');
      return;
    }

    setSelectedBooking(booking);
    setEnteredCode('');

    // Check if code already exists
    try {
      const { token } = authStorage.getAuth('pandit');
      //console.log('   Token exists:', !!token);

      if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = '/pandit-login';
        return;
      }

      const response = await fetch(buildUrl(`/pandit/bookings/${booking._id}/code-status`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      //console.log('   Code status response status:', response.status);
      const data = await response.json();
      //console.log('   Code status data:', data);

      if (data.success && data.data && data.data.hasCode && !data.data.isExpired) {
        setVerificationCode(data.data.verificationCode);
        setCodeStatus({
          code: data.data.verificationCode,
          expiresAt: data.data.expiresAt
        });
        //console.log('   Existing code found:', data.data.verificationCode);
      } else {
        setVerificationCode('');
        setCodeStatus(null);
        //console.log('   No existing code found');
      }
    } catch (error) {
      console.error('❌ Error checking code status:', error);
      setVerificationCode('');
      setCodeStatus(null);
    }

    setShowCodeModal(true);
    //console.log('   Modal opened');
  };


  const completeBooking = async (bookingId) => {
    if (!bookingId) {
      alert('Booking ID is missing');
      return;
    }

    // Confirm with user
    if (!window.confirm('Are you sure you want to mark this booking as completed?')) {
      return;
    }

    try {
      //console.log('✅ Attempting to complete booking:', bookingId);

      // Get token
      const { token } = authStorage.getAuth('pandit');
      if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = '/pandit-login';
        return;
      }

      // Call the correct endpoint
      const response = await fetch(buildUrl(`/pandit/bookings/${bookingId}/complete`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      //console.log('Complete booking response:', data);

      if (response.ok && data.success) {
        alert('✅ Booking marked as completed successfully!');

        // Refresh all data
        loadBookings(); // Reload bookings
        loadDashboardData(); // Reload dashboard stats

      } else {
        alert('❌ Failed to complete booking: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error completing booking:', error);
      alert('❌ Failed to complete booking. Please try again.');
    }
  };

  const addSamagriItem = () => {
    if (newSamagriItem.trim()) {
      setSamagriItems([...samagriItems, newSamagriItem.trim()]);
      setNewSamagriItem('');
    }
  };

  // Remove samagri item
  const removeSamagriItem = (index) => {
    setSamagriItems(samagriItems.filter((_, i) => i !== index));
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = (booking, items, instructions, customTime) => {
    const customerName = booking.name || 'Customer';
    const serviceName = booking.serviceId?.name || 'Puja Service';

    // Format the date (fixed from booking)
    const bookingDate = new Date(booking.dateTime);
    const formattedDate = bookingDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Use custom time if provided, otherwise use booking time
    const finalTime = customTime || bookingDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build samagri list
    let samagriText = '';
    if (items.length > 0) {
      samagriText = '\n\n📋 Suggested Samagri List:\n';
      items.forEach((item, idx) => {
        samagriText += `${idx + 1}. ${item}\n`;
      });
    } else {
      samagriText = '\n\n📋 Samagri: Please let me know if you need the list of items required for the puja.';
    }

    // Add instructions
    let instructionsText = '';
    if (instructions.trim()) {
      instructionsText = `\n\n📝 Instructions: ${instructions}`;
    }

    // Complete message
    const message = `🙏 Namaste ${customerName}!

Your booking for ${serviceName} has been confirmed.
📅 Date: ${formattedDate}
⏰ Time: ${finalTime}
📍 Address: ${booking.address || 'To be confirmed'}
${samagriText}
❓ Please confirm:
1️⃣ Time: Is the above time convenient for you?
2️⃣ Samagri Arrangement: Will you arrange the samagri, or should I bring it?${instructionsText}

💫 Please reply with your confirmation.
🕉️ Thank you for choosing Pujanam!`;

    return encodeURIComponent(message);
  };


  // Open WhatsApp modal
  const openWhatsAppModal = (booking) => {
    setSelectedBookingForWA(booking);
    setSamagriItems([]);
    setAdditionalInstructions('');

    // ✅ Extract only the time from existing booking date
    const existingDate = new Date(booking.dateTime);
    const hours = existingDate.getHours().toString().padStart(2, '0');
    const minutes = existingDate.getMinutes().toString().padStart(2, '0');
    setCustomTime(`${hours}:${minutes}`);

    setShowWhatsAppModal(true);
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = () => {
    if (!selectedBookingForWA) return;

    const phoneNumber = selectedBookingForWA.contact;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    let finalNumber = cleanNumber;
    if (!cleanNumber.startsWith('91') && cleanNumber.length === 10) {
      finalNumber = `91${cleanNumber}`;
    }

    const message = generateWhatsAppMessage(
      selectedBookingForWA,
      samagriItems,
      additionalInstructions,
      customTime  // ✅ Pass only the time
    );

    const whatsappUrl = `https://wa.me/${finalNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    setShowWhatsAppModal(false);
    setSelectedBookingForWA(null);
  };


  const handleTabChange = (tab) => {
    //console.log(`📂 Switching to tab: ${tab}`);
    setActiveTab(tab);

    // Load appropriate data when switching tabs
    if (tab === 'notifications') {
      //console.log('🔔 Loading notifications for notifications tab...');
      loadNotifications();
    } else if (tab === 'upcoming') {
      //console.log('📅 Loading bookings for upcoming tab...');
      loadBookings();
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setShowImageModal(true);
  };

  const saveProfileImage = async () => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const { token } = authStorage.getAuth('pandit');
      const formData = new FormData();
      formData.append('panditImage', selectedImage);

      const response = await fetch(buildUrl('/pandit/profile/image'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Profile image updated successfully!');
        // Update local state
        setPandit(prev => ({ ...prev, image: data.imageUrl }));
        // Refresh dashboard data
        loadDashboardData();
        setShowImageModal(false);
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        alert('❌ Failed to update image: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Debug function
  const checkAuth = () => {
    const token = localStorage.getItem('panditToken');
    const data = localStorage.getItem('panditData');

    //console.log('🔍 Auth Check:');
    //console.log('   Token exists:', !!token);
    if (token) {
      //console.log('   Token (first 20 chars):', token.substring(0, 20) + '...');
      //console.log('   Token length:', token.length);
    }
    //console.log('   Pandit data exists:', !!data);
    if (data) {
      try {
        const panditData = JSON.parse(data);
        //console.log('   Pandit name:', panditData.name);
        //console.log('   Pandit ID:', panditData.id);
      } catch (e) {
        //console.log('   Error parsing pandit data:', e);
      }
    }

    return !!token;
  };

  // Call this when component mounts and before API calls
  useEffect(() => {
    checkAuth();
  }, []);

  const reconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

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
        <div className="loading-hint">
          <p>If this takes too long, try:</p>
          <ul>
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Contacting support if the problem persists</li>
          </ul>
        </div>
        <button
          onClick={() => {
            setLoading(false);
            setDashboardData(getDemoDashboardData());
          }}
          className="btn-skip"
        >
          <FontAwesomeIcon icon={faForwardFast } /> Skip loading & use demo data
        </button>
      </div>
    );
  }

  return (
    <div className="pandit-dashboard">

      {/* Code Verification Modal */}
      {/* Code Verification Modal - CORRECTED VERSION */}
      {showCodeModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="modal-content code-modal" onClick={e => e.stopPropagation()}>
            <h3>Complete Puja: {selectedBooking.serviceId?.name}</h3>

            <div className="code-step">
              <p><strong>Verify Puja Completion</strong></p>

              <div className="verification-instructions">
                <p><FontAwesomeIcon icon={faMicrophone} /> Please follow these steps:</p>
                <ol>
                  <li>Click <strong>"Generate Code"</strong> button below</li>
                  <li>A verification code will be sent to the customer's dashboard</li>
                  <li><strong>Ask the customer</strong> to provide you the code</li>
                  <li>Enter the code below to complete the puja</li>
                </ol>
              </div>

              {/* Step 1: Generate Code Button */}
              {!codeGenerated ? (
                <button
                  onClick={() => generateVerificationCode(selectedBooking._id)}
                  disabled={isGeneratingCode}
                  className="btn-generate"
                >
                  {isGeneratingCode ? 'Generating...' : '🔐 Generate Verification Code'}
                </button>
              ) : (
                /* Step 2: Enter Code from Customer */
                <div className="code-input-section">
                  <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                    <FontAwesomeIcon icon={faCheck} /> Code generated! Ask customer for the code.
                  </p>

                  <div className="code-input-group">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter 6-digit code from customer"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      className="code-input"
                      autoFocus
                    />
                    <button
                      onClick={() => verifyAndComplete(selectedBooking._id)}
                      disabled={isVerifying || enteredCode.length !== 6}
                      className="btn-verify"
                    >
                      {isVerifying ? 'Verifying...' : '✓ Verify & Complete Puja'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-close-modal" onClick={() => {
              setShowCodeModal(false);
              setCodeGenerated(false);
              setEnteredCode('');
            }}>
              Close
            </button>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="dashboard-header">

        <div className="header-left">
          <div className="pandit-profile-section">
            {/* Clickable image to change */}
            <div className="avatar-container" onClick={() => document.getElementById('imageUpload').click()}>
              <img
                src={pandit?.image || '/images/icon.png'}
                alt={pandit?.name || 'Pandit'}
                className="pandit-avatar"
                onError={(e) => {
                  e.target.src = '/images/icon.png';
                }}
              />
              <div className="avatar-overlay">
                <span><FontAwesomeIcon icon={faPencil} /></span>
              </div>
            </div>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <div>
              <h1><FontAwesomeIcon icon={faBook} /> Pandit Dashboard</h1>
              <div className="pandit-info">
                <span>Welcome, <strong>{pandit?.name || 'Pandit'}</strong></span>
                <div className="online-status">
                  <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                  <span>{isOnline ? 'Online - Receiving Bookings' : 'Offline'}</span>

                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={refreshAllData}
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} />
            {isRefreshing ? ' Refreshing...' : ' Refresh'}
          </button>

          <div className="availability-toggle">
            <label>Go Online</label>
            <div
              className={`toggle-switch ${isOnline ? 'active' : ''}`}
              onClick={handleAvailabilityToggle}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn"><FontAwesomeIcon icon={faArrowRight} /> Logout</button>
        </div>
      </div>




      {/* Stats Overview - NOW CLICKABLE */}
      <div className="stats-overview">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick('todayBookings')}
        >
          <div className="stat-icon"><FontAwesomeIcon icon={faCalendar} /></div>
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
          <div className="stat-icon"><FontAwesomeIcon icon={faIndianRupeeSign} /></div>
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
          <div className="stat-icon"><FontAwesomeIcon icon={faStar} /></div>
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
          <div className="stat-icon"><FontAwesomeIcon icon={faCircleCheck} /></div>
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
                            <span className="status-completed"><FontAwesomeIcon icon={faCheck} /> Completed</span>
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
          <FontAwesomeIcon icon={faBook} /> Dashboard
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          <FontAwesomeIcon icon={faBell} /> Notifications ({notifications.length})
        </button>
        <button
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          <FontAwesomeIcon icon={faCalendar} /> Upcoming
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="section">
              <h3>Today's Schedule</h3>
              <button
                onClick={refreshAllData}
                className="small-refresh-btn"
                disabled={isRefreshing}
              >
                <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} />
              </button>
              {bookings.filter(b => isToday(new Date(b.dateTime))).length > 0 ? (
                <div className="bookings-list">
                  {bookings.filter(b => isToday(new Date(b.dateTime))).map(booking => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onAccept={acceptBooking}
                      onComplete={completeBooking}
                      onGenerateCode={openCodeModal}
                      onWhatsApp={openWhatsAppModal}
                    />
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
                  <span><FontAwesomeIcon icon={faBell} /></span>
                  View Notifications
                </button>
                <button className="action-btn" onClick={handleAvailabilityToggle}>
                  <span>{isOnline ? '⏸️' : '▶️'}</span>
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                <button className="action-btn" onClick={() => alert('Profile update coming soon!')}>
                  <span><FontAwesomeIcon icon={faMobileScreen} /></span>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-content">
            <h3>Booking Notifications</h3>
            <button
              onClick={refreshAllData}
              className="small-refresh-btn"
              disabled={isRefreshing}
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} />
            </button>
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
                    onGenerateCode={openCodeModal}
                    onWhatsApp={openWhatsAppModal}
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
          //console.log('🔍 Debug - Current auth state:');
          //console.log('Pandit token:', localStorage.getItem('panditToken') ? 'Present' : 'Missing');
          //console.log('Pandit data:', localStorage.getItem('panditData'));
          //console.log('Current URL:', window.location.href);
          //console.log('API Base URL:', process.env.VITE_API_BASE_URL);

          // Test API call manually
          const token = localStorage.getItem('panditToken');
          if (token) {
            fetch(buildUrl(`${base}/pandit/notifications`), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
              .then(res => {
                //console.log('API Status:', res.status);
                return res.json();
              })
              .then(data => data)
              .catch(err => err);
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
      {/* WhatsApp Message Modal */}
      {showWhatsAppModal && selectedBookingForWA && (
        <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
          <div className="modal-content whatsapp-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FontAwesomeIcon icon={faWhatsapp} style={{ color: '#25D366' }} /> Send WhatsApp Message</h3>
              <button className="close-btn" onClick={() => setShowWhatsAppModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Customer Info */}
              <div className="customer-info">
                <p><strong>👤 Customer:</strong> {selectedBookingForWA.name}</p>
                <p><strong>📞 Phone:</strong> {selectedBookingForWA.contact}</p>
                <p><strong>🛕 Service:</strong> {selectedBookingForWA.serviceId?.name}</p>
                <p><strong>📅 Date:</strong> {new Date(selectedBookingForWA.dateTime).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</p>
              </div>

              <hr />
              <div className="timing-input-group">
                <label><strong>⏰ Proposed Time:</strong></label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="timing-input"
                  step="60"  // 1 minute intervals
                />
                <small>Adjust the time if needed (date remains the same)</small>
              </div>


              {/* Samagri List */}
              <div className="samagri-section">
                <label><strong>📋 Samagri (Items needed for puja):</strong></label>

                <div className="samagri-input-group">
                  <input
                    type="text"
                    value={newSamagriItem}
                    onChange={(e) => setNewSamagriItem(e.target.value)}
                    placeholder="Enter samagri item (e.g., Coconut, Flowers, Kumkum)"
                    onKeyPress={(e) => e.key === 'Enter' && addSamagriItem()}
                  />
                  <button type="button" onClick={addSamagriItem} className="btn-add-item">
                    + Add
                  </button>
                </div>

                {samagriItems.length > 0 && (
                  <div className="samagri-list">
                    {samagriItems.map((item, index) => (
                      <div key={index} className="samagri-item">
                        <span>{index + 1}. {item}</span>
                        <button onClick={() => removeSamagriItem(index)} className="remove-item">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="samagri-preset">
                  <p className="preset-title">Quick Add Presets:</p>
                  <div className="preset-buttons">
                    <button onClick={() => setNewSamagriItem('Coconut')}> Coconut</button>
                    <button onClick={() => setNewSamagriItem('Betel Leaves')}> Betel Leaves</button>
                    <button onClick={() => setNewSamagriItem('Flowers')}> Flowers</button>
                    <button onClick={() => setNewSamagriItem('Kumkum')}> Kumkum</button>
                    <button onClick={() => setNewSamagriItem('Turmeric')}>Turmeric</button>
                    <button onClick={() => setNewSamagriItem('Sandalwood Paste')}> Sandalwood</button>
                    <button onClick={() => setNewSamagriItem('Incense Sticks')}> Incense Sticks</button>
                    <button onClick={() => setNewSamagriItem('Camphor')}> Camphor</button>
                  </div>
                </div>
              </div>


              {/* Additional Instructions */}
              <div className="instructions-section">
                <label><strong><FontAwesomeIcon icon={faNoteSticky } /> Additional Instructions (Optional):</strong></label>
                <textarea
                  rows="3"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Add any special instructions for the customer..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowWhatsAppModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={sendWhatsAppMessage} className="btn-send-wa">
                <FontAwesomeIcon icon={faWhatsapp} /> Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )
      }
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={e => e.stopPropagation()}>
            <h3>Update Profile Picture</h3>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowImageModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={saveProfileImage} disabled={uploadingImage} className="btn-save">
                {uploadingImage ? 'Uploading...' : 'Save Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

// Booking Card Component
const BookingCard = ({ booking, onAccept, onComplete, onGenerateCode, onWhatsApp }) => (
  <div className="booking-card">
    <div className="booking-info">
      <h4>{booking.serviceId?.name || 'Puja Service'}</h4>
      <p><strong>Customer:</strong> {booking.name || 'N/A'}</p>
      <p><strong>When:</strong> {new Date(booking.dateTime).toLocaleString()}</p>
      <p><strong>Where:</strong> {booking.address || 'N/A'}</p>
      <p><strong>Contact:</strong> {booking.contact || 'N/A'}</p>
      <p><strong>Price:</strong> {booking.price || 'N/A'}</p>
      <span className={`status-badge ${booking.status}`}>{booking.status}</span>
      <div className="payment-badge" style={{
        marginTop: '8px',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'inline-block',
        background: booking.paymentStatus === 'completed' ? '#28a745' : '#ffc107',
        color: 'white'
      }}>
        {booking.paymentStatus === 'completed' ?
          `✅ Advance: ₹${booking.advanceAmount || 0} Paid` :
          '⏳ Payment Pending'}
      </div>
    </div>

    <div className="booking-actions">

      {/* Accept */}
      {['notified', 'pending'].includes(booking.status) && (
        <button onClick={() => onAccept(booking._id)} className="btn-accept">
          <FontAwesomeIcon icon={faCircleCheck} /> Accept
        </button>
      )}

      {/* Complete */}
      {['accepted', 'confirmed'].includes(booking.status) && (
        <button
          onClick={() => {
            //console.log('Complete Puja button clicked for booking:', booking._id);
            onGenerateCode(booking);
          }} className="btn-complete"
        >
          <FontAwesomeIcon icon={faCheck} /> Complete Puja
        </button>
      )}
      {/* ✅ WhatsApp Button - Show for accepted/confirmed bookings */}
      {['accepted', 'confirmed'].includes(booking.status) && (
        <button
          onClick={() => onWhatsApp(booking)}
          className="btn-whatsapp"
        >
          <FontAwesomeIcon icon={faWhatsapp} /> Message on WhatsApp
        </button>
      )}

      {/* Call Button - always shows */}
      <a href={`tel:${booking.contact}`} className="btn-call">
        <FontAwesomeIcon icon={faPhone} /> Call
      </a>

    </div>
  </div>
);



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
          <FontAwesomeIcon icon={faBullhorn} />
          New Booking: {notification.serviceName || 'Puja Service'}
        </h4>

        <div className="notification-details">
          <p><strong><FontAwesomeIcon icon={faUser } /> Customer:</strong> {notification.customerName || 'Not provided'}</p>
          <p><strong><FontAwesomeIcon icon={faPhone } /> Contact:</strong> {notification.customerContact || notification.contact || 'Not provided'}</p>
          {notification.customerEmail && notification.customerEmail !== 'N/A' && (
            <p><strong><FontAwesomeIcon icon={faEnvelope } /> Email:</strong> {notification.customerEmail}</p>
          )}
          <p><strong><FontAwesomeIcon icon={faCalendar } /> Date & Time:</strong> {formatDateTime(notification.bookingDateTime)}</p>
          <p><strong><FontAwesomeIcon icon={faLocation } /> Location:</strong> {notification.location || 'Not specified'}</p>
          <p><strong><FontAwesomeIcon icon={faAddressCard } /> Address:</strong> {notification.address || 'Not provided'}</p>
          <p><strong><FontAwesomeIcon icon={faInr } /> Price:</strong> {notification.price || notification.servicePrice || 'N/A'}</p>
          {notification.message && (
            <p><strong><FontAwesomeIcon icon={faComment } /> Message:</strong> {notification.message}</p>
          )}
          <p className="notification-time">
            <strong><FontAwesomeIcon icon={faClockFour } /> Received:</strong> {formatDateTime(notification.createdAt)}
          </p>
        </div>
      </div>

      <div className="notification-actions">
        {/* Accept Button */}
        <button
          onClick={() => onAccept(notification.bookingId)}
          className="btn-accept"
        >
          <FontAwesomeIcon icon={faCheck} /> Accept Booking
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
          <FontAwesomeIcon icon={faX} /> Dismiss
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






export default PanditDashboard;