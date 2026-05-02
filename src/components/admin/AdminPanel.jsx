// Frontend/src/components/admin/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { panditApi } from '../../api/panditApi';
import { serviceApi } from '../../api/serviceApi';
import { adminApi } from '../../api/adminApi';
import AdminLogin from './AdminLogin';
import { authStorage } from '../../api/apiClient';
import { bookingApi } from '../../api/bookingApi';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/AdminPanel.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faMagnifyingGlass, faScrewdriverWrench, faBook, faUserCheck, faHeadset, faCalendar, faNewspaper, faUserPlus, faCircleXmark, faPlus, faHeadSideCough, faPager, faParagraph, faLocation, faLocationDot, faEnvelope, faPhone, faStar, faGraduationCap, faPencil, faTrash, faCheck, faRupee, faRupeeSign, faIndianRupeeSign, faClock, faFile, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { buildUrl } from '../../config';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const generateUsername = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
  };
  const [pandits, setPandits] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [panditPerformance, setPanditPerformance] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    panditId: '',
    fromDate: '',
    toDate: ''
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [bookings, setBookings] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [isCancelling, setIsCancelling] = useState(false);



  useEffect(() => {

    const { token } = authStorage.getAuth('admin');

    if (!token) {

      return;
    }

    if (activeTab === 'bookings') {

      if (!isLoadingBookings) {
        loadAllBookings();
      }

    }

  }, [activeTab, filters]);

  // Load booking data
  const loadAllBookings = async () => {
    if (isLoadingBookings) {

      return;
    }

    try {
      setIsLoadingBookings(true);
      setLoading(true);


      const { token } = authStorage.getAuth('admin');


      if (!token) {

        return; // Prevent logout loop
      }

      const data = await adminApi.getAllBookings(filters);

      setAllBookings(data.bookings || []);
      setBookingStats(data.stats || {});

      // ⭐ CLEAR OLD ERROR MESSAGE AFTER SUCCESS
      setMessage('');

    } catch (error) {

      if (error.response?.status === 404) {

        setMessage('⚠️ Bookings feature is not available. Please check backend configuration.');
        setAllBookings([]);
        setBookingStats({});

      }
      else if (error.response?.status === 401) {

        // DO NOT logout automatically
        setMessage('⚠️ Authentication issue detected. Please refresh if problem continues.');

      }
      else {

        setMessage('❌ Error loading bookings: ' + (error.message || 'Unknown error'));

      }

    } finally {

      setLoading(false);
      setIsLoadingBookings(false);

    }
  };

  const loadPanditPerformance = async () => {
    try {

      const { token } = authStorage.getAuth('admin');
      if (!token) {

        return;
      }

      const data = await adminApi.getPanditPerformance();

      setPanditPerformance(data.pandits || []);
    } catch (error) {


      // Check if it's a 404 (endpoint not found)
      if (error.response?.status === 404) {

        setPanditPerformance([]);
        setMessage('ℹ️ Pandit performance feature coming soon');
      } else {
        setPanditPerformance([]);
      }
    }
  };

  // Update loadRecentActivity similarly
  const loadRecentActivity = async () => {
    try {


      const { token } = authStorage.getAuth('admin');
      if (!token) {

        return;
      }

      const data = await adminApi.getRecentActivity();

      setRecentActivity(data.activities || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);

      if (error.response?.status === 404) {

        setRecentActivity([]);
        setMessage('ℹ️ Recent activity feature coming soon');
      } else {
        setRecentActivity([]);
      }
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const data = await adminApi.getBookingAnalytics(analyticsPeriod);
      setAnalytics(data.analytics || null);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };


  // Load when tab changes
  useEffect(() => {

    if (activeTab === 'bookings') {

      if (!isLoadingBookings) {
        loadAllBookings();
      }

      loadPanditPerformance();
      loadRecentActivity();

    }
    else if (activeTab === 'analytics') {

      loadAnalytics();

    }

  }, [activeTab, filters, analyticsPeriod]);



  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getBookings({ page: 1, limit: 50 });
      setBookings(res.bookings || []);
    } catch (err) {
      setMessage('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {


    // Check BOTH storage locations
    const sessionToken = sessionStorage.getItem('adminToken');
    const sessionUser = sessionStorage.getItem('adminUser');

    const localToken = localStorage.getItem('adminToken');
    const localUser = localStorage.getItem('adminUser');

    console.log('   sessionStorage token:', !!sessionToken);
    console.log('   localStorage token:', !!localToken);

    // Use whichever token exists
    const token = sessionToken || localToken;
    const userData = sessionUser || localUser;

    if (token && userData) {
      try {
        // Ensure both storages have the token (sync them)
        if (!sessionToken && localToken) {

          sessionStorage.setItem('adminToken', localToken);
          sessionStorage.setItem('adminUser', localUser);
        }

        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setAdminUser(parsedUser);

      } catch (error) {

        handleLogout();
      }
    } else {

      setIsAuthenticated(false);
    }
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    loadData();
  };

  const handleLogout = () => {


    // Clear admin auth using authStorage
    authStorage.clearAuth('admin');

    // Clear any other potential storage
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Update state
    setIsAuthenticated(false);
    setAdminUser(null);

    // Use window.location for hard redirect (always works)

    window.location.href = '/admin-login';
  };


  // Form states
  const [panditForm, setPanditForm] = useState({
    name: '',
    location: '',
    services: [],
    contact: '',
    email: '',
    rating: 0,
    experience: 0,
    languages: [],
    image: '/images/icon.png'
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    purpose: '',
    details: [],
    image: '',
    price: '',
    category: 'regular',
    duration: '2-3 hours'
  });

  // New service input states
  const [newService, setNewService] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newDetail, setNewDetail] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // In the AdminPanel.jsx, update the services loading part:

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } else if (activeTab === 'pandits') {
        const data = await panditApi.getAllPandits();
        setPandits(data.pandits || []);
      } else if (activeTab === 'services') {
        console.log('🔄 Loading ALL services in admin panel...');
        const data = await serviceApi.getAllServices(); // This gets ALL services
        console.log('📦 Services loaded in admin:', data.length);
        setServices(data);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };





  // In handlePanditSubmit, don't send password when updating
  const handlePanditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create a copy with required fields
      const dataToSend = {
        ...panditForm,
        // Ensure password is always included for creation
        password: panditForm.password || 'pandit123',
        // Ensure username is generated if missing
        username: panditForm.username || generateUsername(panditForm.name)
      };

      // Remove any undefined or null values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined || dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });



      let result;
      if (editingItem) {
        // For updates, we might not want to send password if it's the default
        if (dataToSend.password === 'pandit123') {
          delete dataToSend.password; // Don't update password if it's default
        }
        result = await adminApi.updatePandit(editingItem._id, dataToSend);
        setMessage('✅ Pandit updated successfully!');
      } else {
        result = await adminApi.createPandit(dataToSend);
        setMessage('✅ Pandit created successfully!');
      }

      resetPanditForm();
      loadData(); // Reload the list

    } catch (error) {

      setMessage('❌ Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();

      // ✅ Add all text fields
      formData.append('name', serviceForm.name);
      formData.append('description', serviceForm.description);
      formData.append('purpose', serviceForm.purpose || '');
      formData.append('price', serviceForm.price);
      formData.append('category', serviceForm.category);
      formData.append('duration', serviceForm.duration || '2-3 hours');
      formData.append('details', JSON.stringify(serviceForm.details));

      // ✅ CRITICAL: Handle image properly
      if (serviceForm.image instanceof File) {
        console.log('📸 Uploading image file:', serviceForm.image.name);
        formData.append('serviceImage', serviceForm.image);
      } else if (typeof serviceForm.image === 'string' && serviceForm.image.startsWith('data:image')) {
        // If it's a base64 image (from camera/file preview)
        const blob = dataURLtoBlob(serviceForm.image);
        formData.append('serviceImage', blob, 'service-image.jpg');
      } else if (typeof serviceForm.image === 'string' && serviceForm.image.includes('/uploads/')) {
        // Existing image URL - keep it
        formData.append('existingImage', serviceForm.image);
      } else {
        // No image - required field error
        setMessage('❌ Please select an image for the service');
        setLoading(false);
        return;
      }

      // Debug: Log FormData contents
      console.log('📤 Sending FormData:');
      for (let pair of formData.entries()) {
        console.log(`   ${pair[0]}: ${pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]}`);
      }

      let result;
      if (editingItem) {
        result = await adminApi.updateService(editingItem._id, formData);
      } else {
        result = await adminApi.createService(formData);
      }

      console.log('✅ Service saved:', result);
      setMessage('✅ Service ' + (editingItem ? 'updated' : 'created') + ' successfully!');
      resetServiceForm();
      loadData();

    } catch (error) {
      console.error('❌ Service operation failed:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setMessage('❌ Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert dataURL to Blob
  function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }


  const resetPanditForm = () => {
    setPanditForm({
      name: '',
      username: '',
      password: 'pandit123', // Always include default password
      location: '',
      services: [],
      contact: '',
      email: '',
      rating: 0,
      experience: 0,
      languages: [],
      image: '/images/icon.png'
    });
    setNewService('');
    setNewLanguage('');
    setEditingItem(null);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      purpose: '',
      details: [],
      image: '',
      price: '',
      category: 'regular',
      duration: '2-3 hours'
    });
    setNewDetail('');
    setEditingItem(null);
  };

  const editPandit = (pandit) => {


    // Generate username if missing
    let username = pandit.username;
    if (!username || username === 'undefined' || username === 'null') {
      username = pandit.name.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);

    }

    setPanditForm({
      name: pandit.name || '',
      username: username,
      password: '********', // Don't show actual password, just placeholder
      location: pandit.location || '',
      services: pandit.services || [],
      contact: pandit.contact || '',
      email: pandit.email || '',
      rating: pandit.rating || 0,
      experience: pandit.experience || 0,
      languages: pandit.languages || [],
      image: pandit.image || '/images/icon.png'
    });
    setEditingItem(pandit);
  };

  const editService = (service) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      purpose: service.purpose || '',
      details: service.details,
      image: service.image,
      price: service.price,
      category: service.category || 'regular',
      duration: service.duration || '2-3 hours'
    });
    setEditingItem(service);
  };

  const deletePandit = async (id) => {
    if (window.confirm('Are you sure you want to delete this pandit? This action cannot be undone.')) {
      try {
        await adminApi.deletePandit(id);
        setMessage('✅ Pandit deleted successfully!');
        loadData();
      } catch (error) {
        setMessage('❌ Error deleting pandit: ' + error.message);
      }
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await adminApi.deleteService(id);
        setMessage('✅ Service deleted successfully!');

        // Force reload data
        await loadData();

      } catch (error) {
        setMessage('❌ Error deleting service: ' + error.message);
      }
    }
  };

  const togglePanditAvailability = async (id) => {
    try {
      await adminApi.togglePanditAvailability(id);
      setMessage('✅ Pandit availability updated!');
      loadData();
    } catch (error) {
      setMessage('❌ Error updating pandit: ' + error.message);
    }
  };

  const toggleServiceActivity = async (id) => {
    try {
      await adminApi.toggleServiceActivity(id);
      setMessage('✅ Service activity updated!');
      loadData();
    } catch (error) {
      setMessage('❌ Error updating service: ' + error.message);
    }
  };

  // Enhanced array item handlers
  const addService = () => {
    if (newService && !panditForm.services.includes(newService)) {
      setPanditForm({
        ...panditForm,
        services: [...panditForm.services, newService]
      });
      setNewService('');
    }
  };

  const addLanguage = () => {
    if (newLanguage && !panditForm.languages.includes(newLanguage)) {
      setPanditForm({
        ...panditForm,
        languages: [...panditForm.languages, newLanguage]
      });
      setNewLanguage('');
    }
  };


  const addDetail = () => {
    if (newDetail && !serviceForm.details.includes(newDetail)) {
      setServiceForm({
        ...serviceForm,
        details: [...serviceForm.details, newDetail]
      });
      setNewDetail('');
    }
  };

  const removeArrayItem = (field, index, setForm, form) => {
    const newArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: newArray });
  };

  // Filter data based on search
  const filteredPandits = pandits.filter(pandit =>
    pandit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pandit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pandit.services.some(service =>
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }


  //Function to load the support token ticket

  const loadSupportTickets = async () => {
    try {
      setLoading(true);
      const { token } = authStorage.getAuth('admin');

      const statusParam = ticketFilter !== 'all' ? `?status=${ticketFilter}` : '';
      const response = await fetch(buildUrl(`/api/admin/support-tickets${statusParam}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSupportTickets(data.tickets || []);
        setTicketStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add function to update ticket status
  const updateTicketStatus = async (ticketId, status, adminResponse = '') => {
    try {
      const { token } = authStorage.getAuth('admin');

      const response = await fetch(buildUrl(`/api/admin/support-tickets/${ticketId}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminResponse })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Ticket status updated successfully');
        loadSupportTickets();
        setSelectedTicket(null);
      } else {
        alert('❌ Failed to update: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error updating ticket');
    }
  };

  // Improved adminCancelBooking - prevents double execution
  const adminCancelBooking = async (bookingId, reason) => {
    // Prevent multiple simultaneous calls
    if (isCancelling) {

      return;
    }

    // Get booking details for confirmation message
    const booking = allBookings.find(b => b._id === bookingId);

    if (!booking) {
      alert('Booking not found');
      return;
    }

    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

    let confirmMessage = 'Are you sure you want to cancel this booking?\n\n';
    confirmMessage += `📅 Service: ${booking.serviceId?.name}\n`;
    confirmMessage += `👤 Customer: ${booking.name}\n`;
    confirmMessage += `📞 Contact: ${booking.contact}\n`;
    confirmMessage += `⏰ Date & Time: ${bookingDate.toLocaleString()}\n`;
    confirmMessage += `🕐 Hours until puja: ${hoursDifference.toFixed(1)} hours\n\n`;
    confirmMessage += 'Click OK to cancel, or Cancel to go back.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const cancelReason = prompt('Reason for cancellation:', reason || 'Customer request via support');
    if (cancelReason === null) return; // User cancelled prompt

    try {
      setIsCancelling(true); // Set loading state
      setLoading(true);

      const { token } = authStorage.getAuth('admin');

      const response = await fetch(buildUrl(`/api/admin/bookings/${bookingId}/admin-cancel`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason || 'Admin cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        // Refresh data
        await loadAllBookings();
        await loadPanditPerformance();
        // Return after successful cancellation
        return;
      } else {
        alert('❌ Failed to cancel: ' + data.message);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCancelling(false);
      setLoading(false);
    }
  };


  // Also update the name field to auto-generate username:
  <input
    id="pandit-name"
    type="text"
    placeholder="Enter pandit's full name"
    value={panditForm.name}
    onChange={(e) => {
      const newName = e.target.value;
      setPanditForm({
        ...panditForm,
        name: newName,
        username: generateUsername(newName) // Auto-generate username
      });
    }}
    required
  />

  return (
    <div className="admin-panel">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}  // ✅ Add this
        toastStyle={{ zIndex: 9999 }}
      />

      {/* Add Admin Header with Logout */}
      <div className="admin-header">
        <div className="admin-info">
          <h1><FontAwesomeIcon icon={faScrewdriverWrench} /> Pujanam Admin Panel</h1>
          <div className="user-info">
            <span>Welcome, <strong>{adminUser?.name || 'Admin'}</strong></span>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faArrowRight} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <FontAwesomeIcon icon={faBook} /> Dashboard
        </button>
        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}><FontAwesomeIcon icon={faCalendar} /> Bookings</button>

        <button
          className={activeTab === 'pandits' ? 'active' : ''}
          onClick={() => setActiveTab('pandits')}
        >
          <FontAwesomeIcon icon={faUserCheck} /> Manage Pandits
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          <FontAwesomeIcon icon={faScrewdriverWrench} /> Manage Services
        </button>
        <button
          className={activeTab === 'support' ? 'active' : ''}
          onClick={() => setActiveTab('support')}
        >
          <FontAwesomeIcon icon={faHeadset} /> Support Tickets ({ticketStats.open || 0})
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="admin-section">
          <h2><FontAwesomeIcon icon={faCalendar} /> Dashboard Overview</h2>
          {loading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : (
            <div className="dashboard-stats">
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Total Pandits</h3>
                  <div className="stat-number">{stats.totalPandits || 0}</div>
                  <div className="stat-subtitle">Registered Pandits</div>
                </div>
                <div className="stat-card">
                  <h3>Available Pandits</h3>
                  <div className="stat-number">{stats.availablePandits || 0}</div>
                  <div className="stat-subtitle">Active for Booking</div>
                </div>
                <div className="stat-card">
                  <h3>Total Services</h3>
                  <div className="stat-number">{stats.totalServices || 0}</div>
                  <div className="stat-subtitle">Puja Services</div>
                </div>
                <div className="stat-card">
                  <h3>Active Services</h3>
                  <div className="stat-number">{stats.activeServices || 0}</div>
                  <div className="stat-subtitle">Available for Booking</div>
                </div>
              </div>
              <div className="stat-card payment">
                <h4>Total Advance Collected</h4>
                <div className="stat-number">
                  ₹{bookingStats.totalAdvanceAmount?.toLocaleString() || 0}
                </div>
                <small>From {bookingStats.paidBookings || 0} bookings</small>
              </div>

              <div className="stat-card payment-id">
                <h4>Total Transactions</h4>
                <div className="stat-number">
                  {bookingStats.paidBookings || 0}
                </div>
                <small>Successful Payments</small>
              </div>

              <div className="recent-activity">
                <h3><FontAwesomeIcon icon={faNewspaper} /> Recent Activity</h3>
                <div className="activity-grid">
                  <div className="activity-section">
                    <h4>Recent Pandits</h4>
                    {stats.recentPandits?.length > 0 ? (
                      stats.recentPandits.map(pandit => (
                        <div key={pandit._id} className="activity-item">
                          <strong>{pandit.name}</strong> - {pandit.location} ⭐{pandit.rating}
                        </div>
                      ))
                    ) : (
                      <div className="no-data">No recent pandits</div>
                    )}
                  </div>
                  <div className="activity-section">
                    <h4>Recent Services</h4>
                    {stats.recentServices?.length > 0 ? (
                      stats.recentServices.map(service => (
                        <div key={service._id} className="activity-item">
                          <strong>{service.name}</strong> - {service.price}
                        </div>
                      ))
                    ) : (
                      <div className="no-data">No recent services</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pandits Tab */}
      {activeTab === 'pandits' && (
        <div className="admin-section">
          <div className="section-header">
            <h2><FontAwesomeIcon icon={faUserPlus} />{editingItem ? '✏️ Edit Pandit' : ' Add New Pandit'}</h2>
            <button
              className="btn-secondary"
              onClick={resetPanditForm}
              disabled={loading}
            >
              {editingItem ? 'Cancel Edit' : 'Clear Form'}
            </button>
          </div>

          <form onSubmit={handlePanditSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="pandit-name">Full Name *</label>
              <input
                id="pandit-name"
                type="text"
                placeholder="Enter pandit's full name"
                value={panditForm.name}
                onChange={(e) => setPanditForm({ ...panditForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pandit-location">Location *</label>
                <input
                  id="pandit-location"
                  type="text"
                  placeholder="e.g., Pune, Mumbai, Delhi"
                  value={panditForm.location}
                  onChange={(e) => setPanditForm({ ...panditForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pandit-email">Email Address *</label>
                <input
                  id="pandit-email"
                  type="email"
                  placeholder="pandit@example.com"
                  value={panditForm.email}
                  onChange={(e) => setPanditForm({ ...panditForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pandit-username">Username *</label>
                <input
                  id="pandit-username"
                  type="text"
                  placeholder="Generate username from name"
                  value={panditForm.username || generateUsername(panditForm.name)}
                  onChange={(e) => setPanditForm({ ...panditForm, username: e.target.value })}
                  required
                />
                <small>Will be auto-generated from name if empty</small>
              </div>

              <div className="form-group">
                <label htmlFor="pandit-password">Password *</label>
                <input
                  id="pandit-password"
                  type="text"
                  placeholder="Default password"
                  value={panditForm.password || "pandit123"}
                  onChange={(e) => setPanditForm({ ...panditForm, password: e.target.value })}
                  required={!editingItem}
                />
                <small>Default: pandit123</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pandit-contact">Contact Number *</label>
                <input
                  id="pandit-contact"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={panditForm.contact}
                  onChange={(e) => setPanditForm({ ...panditForm, contact: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pandit-rating">Rating (0-5) *</label>
                <input
                  id="pandit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                  value={panditForm.rating || 0}
                  onChange={(e) => setPanditForm({
                    ...panditForm,
                    rating: parseFloat(e.target.value) || 0 // ✅ Handle NaN
                  })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pandit-experience">Experience (Years) *</label>
                <input
                  id="pandit-experience"
                  type="number"
                  min="0"
                  placeholder="Years of experience"
                  value={panditForm.experience || 0} // ✅ Add fallback
                  onChange={(e) => setPanditForm({
                    ...panditForm,
                    experience: parseInt(e.target.value) || 0 // ✅ Handle NaN
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pandit-image">Profile Image</label>
                <input
                  id="pandit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        setMessage('❌ Please select an image file');
                        return;
                      }
                      // Validate file size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setMessage('❌ Image size should be less than 5MB');
                        return;
                      }
                      setPanditForm({ ...panditForm, image: file });
                    }
                  }}
                />
                {panditForm.image && typeof panditForm.image === 'string' && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img
                      src={panditForm.image}
                      alt="Current pandit"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
                {panditForm.image instanceof File && (
                  <div className="new-image-preview">
                    <p>New Image Preview:</p>
                    <img
                      src={URL.createObjectURL(panditForm.image)}
                      alt="New pandit preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <p className="file-name">{panditForm.image.name}</p>
                  </div>
                )}
                <small className="file-hint">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB.
                  {!panditForm.image && " Leave empty for default icon."}
                </small>
              </div>
            </div>

            <div className="array-input">
              <label htmlFor="pandit-services">Services Offered *</label>
              <div className="array-controls">
                <input
                  id="pandit-services"
                  type="text"
                  placeholder="Add a service (e.g., Satya Narayan Puja)"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addService();
                    }
                  }}
                />
                <button type="button" onClick={addService} className="btn-add">
                  <FontAwesomeIcon icon={faPlus} />Add
                </button>
              </div>
              <div className="array-items">
                {panditForm.services.map((service, index) => (
                  <span key={index} className="array-item">
                    <FontAwesomeIcon icon={faScrewdriverWrench} /> {service}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('services', index, setPanditForm, panditForm)}
                      aria-label={`Remove ${service}`}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="array-input">
              <label htmlFor="pandit-languages">Languages Known</label>
              <div className="array-controls">
                <input
                  id="pandit-languages"
                  type="text"
                  placeholder="Add a language (e.g., Hindi, English)"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <button type="button" onClick={addLanguage} className="btn-add">
                  <FontAwesomeIcon icon={faPlus} />Add
                </button>
              </div>
              <div className="array-items">
                {panditForm.languages.map((language, index) => (
                  <span key={index} className="array-item">
                    <FontAwesomeIcon icon={faHeadSideCough} />Add {language}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('languages', index, setPanditForm, panditForm)}
                      aria-label={`Remove ${language}`}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary"> <FontAwesomeIcon icon={faPlus} />
                {loading ? '⏳ Saving...' : (editingItem ? '💾 Update Pandit' : ' Add Pandit')}
              </button>
            </div>
          </form>

          <div className="data-section">
            <div className="section-header">
              <h2> <FontAwesomeIcon icon={faParagraph} /> Existing Pandits ({filteredPandits.length})</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder=" Search pandits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading pandits...</div>
            ) : (
              <div className="admin-list">
                {filteredPandits.length === 0 ? (
                  <div className="no-data">
                    {searchTerm ? 'No pandits found matching your search.' : 'No pandits available.'}
                  </div>
                ) : (
                  filteredPandits.map(pandit => (
                    <div key={pandit._id} className="admin-item">
                      <div className="item-info">
                        <h3>
                          {pandit.name}
                          {pandit.isAvailable === false && <span className="status-badge inactive">Inactive</span>}
                        </h3>
                        <p><strong> <FontAwesomeIcon icon={faLocationDot} />  Location:</strong> {pandit.location}</p>
                        <p><strong> <FontAwesomeIcon icon={faEnvelope} /> Email:</strong> {pandit.email}</p>
                        <p><strong> <FontAwesomeIcon icon={faPhone} /> Contact:</strong> {pandit.contact}</p>
                        <p><strong> <FontAwesomeIcon icon={faStar} /> Rating:</strong> {pandit.rating}/5</p>
                        <p><strong> <FontAwesomeIcon icon={faGraduationCap} /> Experience:</strong> {pandit.experience} years</p>
                        <p><strong> <FontAwesomeIcon icon={faScrewdriverWrench} /> Services:</strong> {pandit.services.join(', ')}</p>
                        <p><strong> <FontAwesomeIcon icon={faHeadSideCough} /> Languages:</strong> {pandit.languages?.join(', ') || 'Not specified'}</p>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => editPandit(pandit)} className="btn-edit">
                          <FontAwesomeIcon icon={faPencil} /> Edit
                        </button>
                        <button
                          onClick={() => togglePanditAvailability(pandit._id)}
                          className={pandit.isAvailable === false ? 'btn-activate' : 'btn-deactivate'}
                        >
                          {pandit.isAvailable === false ? '✅ Activate' : '⏸️ Deactivate'}
                        </button>
                        <button
                          onClick={() => deletePandit(pandit._id)}
                          className="btn-delete"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}




      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="admin-section">
          <div className="section-header">
            <h2> <FontAwesomeIcon icon={faScrewdriverWrench} />{editingItem ? '✏️ Edit Service' : ' Add New Service'}</h2>
            <button
              className="btn-secondary"
              onClick={resetServiceForm}
              disabled={loading}
            >
              {editingItem ? 'Cancel Edit' : 'Clear Form'}
            </button>
          </div>

          <form onSubmit={handleServiceSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="service-name">Service Name *</label>
              <input
                id="service-name"
                type="text"
                placeholder="e.g., Satya Narayan Puja, Ganesh Puja"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="service-description">Description *</label>
              <textarea
                id="service-description"
                placeholder="Brief description of the service and its significance..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="service-purpose">Purpose</label>
              <textarea
                id="service-purpose"
                placeholder="Main purpose and benefits of this puja..."
                value={serviceForm.purpose}
                onChange={(e) => setServiceForm({ ...serviceForm, purpose: e.target.value })}
                rows="2"
              />
            </div>

            <div className="array-input">
              <label htmlFor="service-details">Key Details & Benefits *</label>
              <div className="array-controls">
                <input
                  id="service-details"
                  type="text"
                  placeholder="Add a key point (e.g., Removes obstacles, Brings prosperity)"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDetail();
                    }
                  }}
                />
                <button type="button" onClick={addDetail} className="btn-add">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>
              </div>
              <div className="array-items">
                {serviceForm.details.map((detail, index) => (
                  <span key={index} className="array-item">
                    <FontAwesomeIcon icon={faCheck} /> {detail}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('details', index, setServiceForm, serviceForm)}
                      aria-label={`Remove ${detail}`}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="service-price">Price *</label>
                <input
                  id="service-price"
                  type="text"
                  placeholder="e.g., ₹1099/-, ₹1999/-"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="service-duration">Duration</label>
                <input
                  id="service-duration"
                  type="text"
                  placeholder="e.g., 2-3 hours, Full day"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                />
              </div>
            </div>


            <div className="form-group">
              <label htmlFor="service-image">Service Image *</label>
              <input
                id="service-image"
                type="file"
                accept="image/*"
                required={!editingItem}  // Required for new services
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      setMessage('❌ Please select an image file');
                      e.target.value = ''; // Clear the input
                      return;
                    }
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      setMessage('❌ Image size should be less than 5MB');
                      e.target.value = '';
                      return;
                    }
                    // Set the image as File object
                    setServiceForm({ ...serviceForm, image: file });

                    // Show preview
                    const previewUrl = URL.createObjectURL(file);
                    // You can store preview URL in state if needed
                  }
                }}
              />


              <div className="form-group">
                <label htmlFor="service-category">Category *</label>
                <select
                  id="service-category"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                >
                  <option value="regular">Regular Puja</option>
                  <option value="festive">Festival Puja</option>
                  <option value="hawan">Hawan</option>
                  <option value="shanti">Shanti</option>
                  <option value="shraddha">Shraddha</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary"> <FontAwesomeIcon icon={faPlus} />
                {loading ? (
                  <LoadingSpinner text="Loading dashboard data..." />
                ) : (editingItem ? '💾 Update Service' : ' Add Service')}
              </button>
            </div>
          </form>

          <div className="data-section">
            <div className="section-header">
              <h2> <FontAwesomeIcon icon={faEnvelope} /> Existing Services ({filteredServices.length})</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder=" Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSpinner text="Loading dashboard data..." />
            ) : (
              <div className="admin-list">
                {filteredServices.length === 0 ? (
                  <div className="no-data">
                    {searchTerm ? 'No services found matching your search.' : 'No services available.'}
                  </div>
                ) : (
                  filteredServices.map(service => (
                    <div key={service._id} className="admin-item">
                      <div className="item-info">
                        <h3>
                          {service.name}
                          <span className={`category-badge ${service.category}`}>
                            {service.category}
                          </span>
                          {service.isActive === false && <span className="status-badge inactive">Inactive</span>}
                        </h3>
                        <p><strong> <FontAwesomeIcon icon={faIndianRupeeSign} /> Price:</strong> {service.price}</p>
                        <p><strong> <FontAwesomeIcon icon={faClock} /> Duration:</strong> {service.duration}</p>
                        <p><strong> <FontAwesomeIcon icon={faFile} /> Category:</strong> {service.category}</p>
                        <p><strong> <FontAwesomeIcon icon={faEdit} /> Description:</strong> {service.description}</p>
                        {service.purpose && (
                          <p><strong> Purpose:</strong> {service.purpose}</p>
                        )}
                        <p><strong> Key Benefits:</strong></p>
                        <ul className="benefits-list">
                          {service.details.slice(0, 3).map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                          {service.details.length > 3 && (
                            <li>...and {service.details.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => editService(service)} className="btn-edit">
                          <FontAwesomeIcon icon={faPencil} /> Edit
                        </button>
                        <button
                          onClick={() => toggleServiceActivity(service._id)}
                          className={service.isActive === false ? 'btn-activate' : 'btn-deactivate'}
                        >
                          {service.isActive === false ? '✅ Activate' : '⏸️ Deactivate'}
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          className="btn-delete"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-bookings-section">
          <h2>📋 All Bookings</h2>

          {/* Filters */}
          <div className="filters-bar">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="notified">Notified</option>
              <option value="accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              placeholder="From Date"
            />

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              placeholder="To Date"
            />

            <button onClick={loadAllBookings} className="btn-filter">
              Apply Filters
            </button>
          </div>

          {/* Booking Stats Cards */}
          {bookingStats && Object.keys(bookingStats).length > 0 ? (
            <div className="booking-stats">
              <div className="stat-card">
                <h4>Total</h4>
                <div className="stat-number">{bookingStats.total || 0}</div>
              </div>
              <div className="stat-card pending">
                <h4>Pending</h4>
                <div className="stat-number">{bookingStats.pending || 0}</div>
              </div>
              <div className="stat-card notified">
                <h4>Notified</h4>
                <div className="stat-number">{bookingStats.notified || 0}</div>
              </div>
              <div className="stat-card accepted">
                <h4>Accepted</h4>
                <div className="stat-number">{bookingStats.accepted || 0}</div>
              </div>
              <div className="stat-card confirmed">
                <h4>Confirmed</h4>
                <div className="stat-number">{bookingStats.confirmed || 0}</div>
              </div>
              <div className="stat-card completed">
                <h4>Completed</h4>
                <div className="stat-number">{bookingStats.completed || 0}</div>
              </div>
              <div className="stat-card cancelled">
                <h4>Cancelled</h4>
                <div className="stat-number">{bookingStats.cancelled || 0}</div>
              </div>
              <div className="stat-card payment">
                <h4>Advance Collected</h4>
                <div className="stat-number">
                  ₹{bookingStats.totalAdvanceAmount || 0}
                </div>
                <small>From {bookingStats.paidBookings || 0} bookings</small>
              </div>
            </div>
          ) : (
            <div className="loading-stats">Loading statistics...</div>
          )}

          {/* Bookings Table */}
          <div className="bookings-table-container">
            {allBookings.length > 0 ? (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Pandit</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Payment</th>
                    <th>Payment ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map(booking => (
                    <tr key={booking._id}>
                      <td>{new Date(booking.dateTime).toLocaleDateString()}</td>
                      <td>{booking.name}</td>
                      <td>{booking.serviceId?.name}</td>
                      <td>
                        {booking.panditId ? (
                          <span className="pandit-name">{booking.panditId.name}</span>
                        ) : (
                          <span className="not-assigned">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{booking.price}</td>
                      <td>
                        {booking.paymentStatus === 'completed' ? (
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                            ₹{booking.advanceAmount || 0}
                          </span>
                        ) : (
                          <span style={{ color: '#ffc107' }}>
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        {booking.paymentId ? (
                          <span
                            style={{
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              cursor: 'pointer',
                              color: '#0066cc'
                            }}
                            title="Click to copy"
                            onClick={() => {
                              navigator.clipboard.writeText(booking.paymentId);
                              toast.success('Payment ID copied!', { autoClose: 1500 });
                            }}
                          >
                            {booking.paymentId.slice(-8)}...
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => setSelectedBooking(booking)} className="btn-view">
                          View
                        </button>

                        {/* Cancel button - available for all non-cancelled/non-completed bookings */}
                        {!['cancelled', 'completed'].includes(booking.status) && (
                          <button
                            onClick={() => adminCancelBooking(booking._id)}
                            className="btn-cancel-admin"
                            style={{
                              marginLeft: '8px',
                              background: '#dc3545',
                              color: 'white',
                              padding: '5px 12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>) : (
              <div className="no-data-message">
                <p>No bookings found</p>
                {message && <p className="info-message">{message}</p>}
              </div>
            )}
          </div>

          {/* Pandit Performance Section */}
          <h2>👨‍💼 Pandit Performance</h2>
          {panditPerformance.length > 0 ? (
            <div className="pandit-performance">
              {panditPerformance.map(pandit => (
                <div key={pandit._id} className="performance-card">
                  <div className="pandit-header">
                    <h4>{pandit.name}</h4>
                    <span className="rating">⭐ {pandit.rating}</span>
                  </div>
                  <div className="stats-grid">
                    <div className="stat">
                      <label>Total</label>
                      <span>{pandit.stats.totalBookings}</span>
                    </div>
                    <div className="stat">
                      <label>Accepted</label>
                      <span>{pandit.stats.acceptedBookings}</span>
                    </div>
                    <div className="stat">
                      <label>Completed</label>
                      <span>{pandit.stats.completedBookings}</span>
                    </div>
                    <div className="stat">
                      <label>Earnings</label>
                      <span>₹{pandit.stats.totalEarnings}</span>
                    </div>

                  </div>


                  <div className="progress-bars">
                    <div className="progress-item">
                      <label>Acceptance Rate</label>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${pandit.stats.acceptanceRate}%` }}
                        ></div>
                      </div>
                      <span>{pandit.stats.acceptanceRate}%</span>
                    </div>
                    <div className="progress-item">
                      <label>Completion Rate</label>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${pandit.stats.completionRate}%` }}
                        ></div>
                      </div>
                      <span>{pandit.stats.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>Pandit performance data unavailable</p>
            </div>
          )}


          {/* Recent Activity */}
          <h2>🔄 Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="activity-feed">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.action.split(' ')[0]}</div>
                  <div className="activity-content">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-description">{activity.description}</div>
                    <div className="activity-meta">
                      <span>👤 {activity.customer}</span>
                      {activity.pandit && <span>👨‍💼 {activity.pandit}</span>}
                      <span>🕒 {new Date(activity.time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="admin-analytics">
          <h2>📊 Booking Analytics</h2>

          <div className="period-selector">
            <button
              className={analyticsPeriod === 'day' ? 'active' : ''}
              onClick={() => setAnalyticsPeriod('day')}
            >
              Day
            </button>
            <button
              className={analyticsPeriod === 'week' ? 'active' : ''}
              onClick={() => setAnalyticsPeriod('week')}
            >
              Week
            </button>
            <button
              className={analyticsPeriod === 'month' ? 'active' : ''}
              onClick={() => setAnalyticsPeriod('month')}
            >
              Month
            </button>
            <button
              className={analyticsPeriod === 'year' ? 'active' : ''}
              onClick={() => setAnalyticsPeriod('year')}
            >
              Year
            </button>
          </div>

          {analytics && (
            <div className="analytics-grid">
              {/* Popular Services */}
              <div className="analytics-card">
                <h3>🔥 Popular Services</h3>
                {analytics.popularServices.map((service, index) => (
                  <div key={index} className="analytics-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{service.name}</span>
                    <span className="count">{service.bookings} bookings</span>
                    <span className="earnings">₹{service.earnings}</span>
                  </div>
                ))}
              </div>

              {/* Top Pandits */}
              <div className="analytics-card">
                <h3>🏆 Top Pandits</h3>
                {analytics.topPandits.map((pandit, index) => (
                  <div key={index} className="analytics-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{pandit.name}</span>
                    <span className="rating">⭐ {pandit.rating}</span>
                    <span className="count">{pandit.completedBookings} completed</span>
                    <span className="earnings">₹{pandit.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ ADD SUPPORT TAB CONTENT HERE - Right after analytics or bookings tab */}
      {activeTab === 'support' && (
        <div className="admin-support-section">
          <div className="section-header">
            <h2><FontAwesomeIcon icon={faHeadset} /> Support Tickets</h2>
            <div className="ticket-filters">
              <button
                className={ticketFilter === 'all' ? 'active' : ''}
                onClick={() => { setTicketFilter('all'); loadSupportTickets(); }}
              >
                All ({ticketStats.total || 0})
              </button>
              <button
                className={ticketFilter === 'open' ? 'active' : ''}
                onClick={() => { setTicketFilter('open'); loadSupportTickets(); }}
              >
                Open ({ticketStats.open || 0})
              </button>
              <button
                className={ticketFilter === 'in_progress' ? 'active' : ''}
                onClick={() => { setTicketFilter('in_progress'); loadSupportTickets(); }}
              >
                In Progress ({ticketStats.inProgress || 0})
              </button>
              <button
                className={ticketFilter === 'resolved' ? 'active' : ''}
                onClick={() => { setTicketFilter('resolved'); loadSupportTickets(); }}
              >
                Resolved ({ticketStats.resolved || 0})
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading tickets..." />
          ) : supportTickets.length === 0 ? (
            <div className="no-data">No support tickets found</div>
          ) : (
            <div className="tickets-list">
              {supportTickets.map(ticket => (
                <div key={ticket._id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <h3>Ticket #{ticket._id.toString().slice(-8)}</h3>
                      <span className={`ticket-status ${ticket.status}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="ticket-details">
                    <p><strong>Customer:</strong> {ticket.name} ({ticket.email})</p>
                    <p><strong>Issue Type:</strong> {ticket.issueType.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Description:</strong> {ticket.issueDescription}</p>
                    {ticket.bookingId && (
                      <p><strong>Booking ID:</strong> {ticket.bookingId._id}</p>
                    )}
                    {ticket.adminResponse && (
                      <p><strong>Admin Response:</strong> {ticket.adminResponse}</p>
                    )}
                  </div>

                  <div className="ticket-actions">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="btn-view"
                    >
                      View & Respond
                    </button>
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => updateTicketStatus(ticket._id, 'in_progress')}
                        className="btn-start"
                      >
                        Start Processing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content ticket-modal" onClick={e => e.stopPropagation()}>
            <h3>Support Ticket #{selectedTicket._id.toString().slice(-8)}</h3>

            <div className="ticket-full-details">
              <p><strong>Customer:</strong> {selectedTicket.name}</p>
              <p><strong>Email:</strong> {selectedTicket.email}</p>
              <p><strong>Issue Type:</strong> {selectedTicket.issueType}</p>
              <p><strong>Status:</strong>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </p>
              <p><strong>Description:</strong></p>
              <p className="ticket-description">{selectedTicket.issueDescription}</p>

              {/* ✅ Show cancel button if issue is about cancellation and booking exists */}
              {selectedTicket.issueType === 'cancellation' && selectedTicket.bookingId && (
                <div className="cancellation-section" style={{
                  marginTop: '15px',
                  padding: '15px',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  border: '1px solid #ffc107'
                }}>
                  <h4>⚠️ Cancellation Request</h4>
                  <p><strong>Booking ID:</strong> {selectedTicket.bookingId._id}</p>
                  <p><strong>Service:</strong> {selectedTicket.bookingId.serviceId?.name}</p>
                  <p><strong>Customer:</strong> {selectedTicket.name}</p>
                  <p><strong>Date:</strong> {new Date(selectedTicket.bookingId.dateTime).toLocaleString()}</p>

                  {(() => {
                    const hoursUntil = (new Date(selectedTicket.bookingId.dateTime) - new Date()) / (1000 * 60 * 60);
                    return (
                      <p><strong>Time until puja:</strong>
                        <span style={{ color: hoursUntil < 2 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                          {hoursUntil.toFixed(1)} hours
                        </span>
                        {hoursUntil < 2 && (
                          <span style={{ display: 'block', color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                            ⏰ Less than 2 hours remaining - Admin can still cancel
                          </span>
                        )}
                      </p>
                    );
                  })()}

                  <button
                    onClick={async () => {
                      const confirmCancel = confirm('Cancel this booking?');
                      if (confirmCancel) {
                        const reason = prompt('Reason for cancellation:', selectedTicket.issueDescription);
                        await adminCancelBooking(selectedTicket.bookingId._id, reason || 'Customer request via support ticket');
                        // Update ticket status
                        await updateTicketStatus(selectedTicket._id, 'resolved', 'Booking cancelled as requested.');
                        setSelectedTicket(null);
                        loadSupportTickets();
                      }
                    }}
                    className="btn-cancel-booking"
                    style={{
                      padding: '10px 20px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Cancel Booking (Admin)
                  </button>
                </div>
              )}
              <label><strong>Admin Response:</strong></label>
              <textarea
                rows="4"
                value={selectedTicket.adminResponse || ''}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, adminResponse: e.target.value })}
                placeholder="Type your response here..."
                className="response-textarea"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setSelectedTicket(null)} className="btn-cancel">
                Cancel
              </button>
              <button
                onClick={() => updateTicketStatus(selectedTicket._id, selectedTicket.status, selectedTicket.adminResponse)}
                className="btn-submit"
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}

 {/* Image Preview */}
  {serviceForm.image && (
    <div className="image-preview">
      <p>Image Preview:</p>
      <img 
        src={serviceForm.image instanceof File ? URL.createObjectURL(serviceForm.image) : serviceForm.image}
        alt="Service preview"
        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
      />
      {serviceForm.image instanceof File && (
        <p className="file-name">{serviceForm.image.name}</p>
      )}
    </div>
  )}


      {/* Booking Details Modal */}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <div className="detail-row">
                  <div className="detail-label">
                    <i>📋</i> Booking ID:
                  </div>
                  <div className="detail-value">
                    <span className="booking-id">{selectedBooking._id}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>👤</i> Customer Name:
                  </div>
                  <div className="detail-value">{selectedBooking.name}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>📞</i> Contact:
                  </div>
                  <div className="detail-value">{selectedBooking.contact}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>✉️</i> Email:
                  </div>
                  <div className="detail-value">{selectedBooking.email || 'N/A'}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>🛕</i> Service:
                  </div>
                  <div className="detail-value">{selectedBooking.serviceId?.name}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>👨‍💼</i> Assigned Pandit:
                  </div>
                  <div className="detail-value">
                    {selectedBooking.panditId?.name || 'Not assigned yet'}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>📅</i> Date & Time:
                  </div>
                  <div className="detail-value">
                    {new Date(selectedBooking.dateTime).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>📍</i> Address:
                  </div>
                  <div className="detail-value">{selectedBooking.address}</div>
                </div>

                {selectedBooking.paymentId && (
                  <div className="detail-section payment-details">

                    <div className="detail-row">
                      <span className="detail-label">Payment ID:</span>
                      <span className="detail-value monospace">{selectedBooking.paymentId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedBooking.paymentId);
                          toast.success('Payment ID copied!');
                        }}
                        style={{ marginLeft: '10px', padding: '2px 8px' }}
                      >
                        Copy
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Order ID:</span>
                      <span className="detail-value monospace">{selectedBooking.orderId || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Advance Amount:</span>
                      <span className="detail-value">₹{selectedBooking.advanceAmount || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment Status:</span>
                      <span className={`status-badge ${selectedBooking.paymentStatus}`}>
                        {selectedBooking.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Paid On:</span>
                      <span className="detail-value">
                        {selectedBooking.paidAt ? new Date(selectedBooking.paidAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}


                <div className="detail-row">
                  <div className="detail-label">
                    <i>⚡</i> Status:
                  </div>
                  <div className="detail-value">
                    <span className={`status-badge-large ${selectedBooking.status}`}>
                      {selectedBooking.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <i>💰</i> Price:
                  </div>
                  <div className="detail-value">
                    <span className="price-highlight">{selectedBooking.price}</span>
                  </div>
                </div>

                {selectedBooking.message && (
                  <div className="message-section">
                    <span className="message-label">
                      <i>💬</i> Customer Message:
                    </span>
                    <p className="message-text">"{selectedBooking.message}"</p>
                  </div>
                )}

                <div className="timestamp-section">
                  <div className="timestamp-item">
                    <i>🕐</i> Created: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </div>
                  <div className="timestamp-item">
                    <i>🔄</i> Last Updated: {new Date(selectedBooking.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>


            <div className="modal-actions">
              <button onClick={() => setSelectedBooking(null)} className="btn-close-modal">
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;


