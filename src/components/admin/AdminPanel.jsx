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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faMagnifyingGlass, faScrewdriverWrench, faBook, faUserCheck, faCalendar, faNewspaper, faUserPlus, faCircleXmark,faPlus, faHeadSideCough, faPager, faParagraph, faLocation, faLocationDot, faEnvelope, faPhone, faStar, faGraduationCap, faPencil, faTrash, faCheck, faRupee, faRupeeSign, faIndianRupeeSign, faClock, faFile, faEdit } from '@fortawesome/free-solid-svg-icons';


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



  useEffect(() => {

  console.log('📂 Active tab changed to:', activeTab);

  const { token } = authStorage.getAuth('admin');

  console.log('🔑 Token check:', token ? 'Present' : 'Missing');

  if (!token) {
    console.warn('⚠️ Admin token missing, skipping API calls');
    return;
  }

  if (activeTab === 'bookings') {

    console.log('📅 Booking tab opened');

    if (!isLoadingBookings) {
      loadAllBookings();
    }

  }

}, [activeTab, filters]); 

  // Load booking data
  const loadAllBookings = async () => {
  if (isLoadingBookings) {
    console.log('⚠️ Booking request already in progress, skipping duplicate call');
    return;
  }

  try {
    setIsLoadingBookings(true);
    setLoading(true);

    console.log('📡 Loading all bookings...');

    const { token } = authStorage.getAuth('admin');

    console.log('🔑 Token check:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No admin token found');
      return; // Prevent logout loop
    }

    const data = await adminApi.getAllBookings(filters);

    console.log('✅ Bookings loaded:', data);

    setAllBookings(data.bookings || []);
    setBookingStats(data.stats || {});

    // ⭐ CLEAR OLD ERROR MESSAGE AFTER SUCCESS
    setMessage('');

  } catch (error) {

    console.error('❌ Error loading bookings:', error);

    if (error.response?.status === 404) {

      console.log('📌 Bookings endpoint not found - showing placeholder');

      setMessage('⚠️ Bookings feature is not available. Please check backend configuration.');
      setAllBookings([]);
      setBookingStats({});

    } 
    else if (error.response?.status === 401) {

      console.warn('⚠️ Unauthorized request detected');

      console.warn('⚠️ Token might be expired or backend rejected it');

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
    console.log('📊 Loading pandit performance...');
    
    const { token } = authStorage.getAuth('admin');
    if (!token) {
      console.log('❌ No admin token found');
      return;
    }
    
    const data = await adminApi.getPanditPerformance();
    console.log('✅ Pandit performance loaded:', data);
    setPanditPerformance(data.pandits || []);
  } catch (error) {
    console.error('Error loading pandit performance:', error);
    
    // Check if it's a 404 (endpoint not found)
    if (error.response?.status === 404) {
      console.log('📌 Pandit performance endpoint not found - showing placeholder');
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
    console.log('📡 Loading recent activity...');
    
    const { token } = authStorage.getAuth('admin');
    if (!token) {
      console.log('❌ No admin token found');
      return;
    }
    
    const data = await adminApi.getRecentActivity();
    console.log('✅ Recent activity loaded:', data);
    setRecentActivity(data.activities || []);
  } catch (error) {
    console.error('Error loading recent activity:', error);
    
    if (error.response?.status === 404) {
      console.log('📌 Activity endpoint not found - showing placeholder');
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
  console.log('🔍 Checking admin authentication...');
  
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
        console.log('📝 Syncing token from localStorage to sessionStorage');
        sessionStorage.setItem('adminToken', localToken);
        sessionStorage.setItem('adminUser', localUser);
      }
      
      const parsedUser = JSON.parse(userData);
      setIsAuthenticated(true);
      setAdminUser(parsedUser);
      console.log('✅ Admin authenticated:', parsedUser.name);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      handleLogout();
    }
  } else {
    console.log('❌ No admin token found');
    setIsAuthenticated(false);
  }
};

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    loadData();
  };

  const handleLogout = () => {
    console.log('🚪 Admin logging out...');

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
    console.log('🔄 Redirecting to admin login...');
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

      console.log('📤 Sending pandit data:', dataToSend);

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

      console.log('✅ Pandit operation successful:', result);

      resetPanditForm();
      loadData(); // Reload the list

    } catch (error) {
      console.error('❌ Pandit operation failed:', error);
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
      console.log('📤 Sending service data:', serviceForm);
      console.log('📁 Image file:', serviceForm.image);

      let result;
      if (editingItem) {
        result = await adminApi.updateService(editingItem._id, serviceForm);
      } else {
        result = await adminApi.createService(serviceForm);
      }

      console.log('✅ Service operation successful:', result);
      setMessage('✅ Service ' + (editingItem ? 'updated' : 'created') + ' successfully!');

      resetServiceForm();
      loadData();
    } catch (error) {
      console.error('❌ Service operation failed:', error);
      console.error('❌ Error response:', error.response?.data);

      const errorMessage = error.response?.data?.errors
        ? `Validation errors: ${error.response.data.errors.map(e => e.msg).join(', ')}`
        : error.response?.data?.message || error.message;

      setMessage('❌ Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };
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
    console.log('✏️ EDITING PANDIT - Raw data:', pandit);

    // Generate username if missing
    let username = pandit.username;
    if (!username || username === 'undefined' || username === 'null') {
      username = pandit.name.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
      console.log('📝 Generated username:', username);
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



  // Add this temporary debug button in AdminPanel.jsx
  const checkToken = () => {
    const { token, data } = authStorage.getAuth('admin');
    console.log('🔍 Admin Token Check:');
    console.log('   Token exists:', !!token);
    console.log('   Token preview:', token ? token.substring(0, 30) + '...' : 'none');
    console.log('   User data:', data);

    // Test the auth endpoint
    fetch('http://localhost:5000/api/admin/test-auth', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => console.log('   Auth test response:', data))
      .catch(err => console.error('   Auth test error:', err));
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

      {/* Add Admin Header with Logout */}
      <div className="admin-header">
        <div className="admin-info">
          <h1><FontAwesomeIcon icon={faScrewdriverWrench}/> Pujanam Admin Panel</h1>
          <div className="user-info">
            <span>Welcome, <strong>{adminUser?.name || 'Admin'}</strong></span>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faArrowRight}/> Logout
            </button>
          </div>
          <button onClick={checkToken} style={{ margin: '10px', padding: '5px' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass}/> Check Admin Token
          </button>

        </div>
      </div>
      <button 
  onClick={async () => {
    console.log('🧪 Testing connection...');
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    // Test 1: Health check
    try {
      const health = await fetch('http://localhost:5000/api/health');
      console.log('Health check:', await health.json());
    } catch (e) {
      console.error('Health check failed:', e);
    }
    
    // Test 2: Bookings with token
    try {
      const bookings = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Bookings response:', bookings.status);
      if (bookings.ok) {
        console.log('Bookings data:', await bookings.json());
      } else {
        console.log('Bookings error:', await bookings.text());
      }
    } catch (e) {
      console.error('Bookings fetch failed:', e);
    }
  }}
  style={{
    padding: '10px',
    background: '#ffc107',
    border: 'none',
    borderRadius: '5px',
    margin: '10px',
    cursor: 'pointer'
  }}
>
  🧪 Test Connection
</button>


      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <FontAwesomeIcon icon={faBook}/> Dashboard
        </button>
        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}><FontAwesomeIcon icon={faCalendar}/> Bookings</button>

        <button
          className={activeTab === 'pandits' ? 'active' : ''}
          onClick={() => setActiveTab('pandits')}
        >
          <FontAwesomeIcon icon={faUserCheck}/> Manage Pandits
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          <FontAwesomeIcon icon={faScrewdriverWrench}/> Manage Services
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="admin-section">
          <h2><FontAwesomeIcon icon={faCalendar}/> Dashboard Overview</h2>
          {loading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : (
            <div className="dashboard-stats">
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Total Pandits</h3>
                  <div className="stat-number">{stats.totalPandits || 0}</div>
                  <div className="stat-subtitle">Registered Priests</div>
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


              <div className="recent-activity">
                <h3><FontAwesomeIcon icon={faNewspaper}/> Recent Activity</h3>
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
            <h2><FontAwesomeIcon icon={faUserPlus}/>{editingItem ? '✏️ Edit Pandit' : ' Add New Pandit'}</h2>
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
                  <FontAwesomeIcon icon={faPlus}/>Add
                </button>
              </div>
              <div className="array-items">
                {panditForm.services.map((service, index) => (
                  <span key={index} className="array-item">
                    <FontAwesomeIcon icon={faScrewdriverWrench}/> {service}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('services', index, setPanditForm, panditForm)}
                      aria-label={`Remove ${service}`}
                    >
                      <FontAwesomeIcon icon={faCircleXmark}/>
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
                  <FontAwesomeIcon icon={faPlus}/>Add
                </button>
              </div>
              <div className="array-items">
                {panditForm.languages.map((language, index) => (
                  <span key={index} className="array-item">
                    <FontAwesomeIcon icon={faHeadSideCough}/>Add {language}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('languages', index, setPanditForm, panditForm)}
                      aria-label={`Remove ${language}`}
                    >
                      <FontAwesomeIcon icon={faCircleXmark}/>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary"> <FontAwesomeIcon icon={faPlus}/>
                {loading ? '⏳ Saving...' : (editingItem ? '💾 Update Pandit' : ' Add Pandit')}
              </button>
            </div>
          </form>

          <div className="data-section">
            <div className="section-header">
              <h2> <FontAwesomeIcon icon={faParagraph}/> Existing Pandits ({filteredPandits.length})</h2>
              <div className="search-box">
                <input
                  type="text" 
                  placeholder=  " Search pandits..."
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
                        <p><strong> <FontAwesomeIcon icon={faLocationDot}/>  Location:</strong> {pandit.location}</p>
                        <p><strong> <FontAwesomeIcon icon={faEnvelope}/> Email:</strong> {pandit.email}</p>
                        <p><strong> <FontAwesomeIcon icon={faPhone}/> Contact:</strong> {pandit.contact}</p>
                        <p><strong> <FontAwesomeIcon icon={faStar}/> Rating:</strong> {pandit.rating}/5</p>
                        <p><strong> <FontAwesomeIcon icon={faGraduationCap}/> Experience:</strong> {pandit.experience} years</p>
                        <p><strong> <FontAwesomeIcon icon={faScrewdriverWrench}/> Services:</strong> {pandit.services.join(', ')}</p>
                        <p><strong> <FontAwesomeIcon icon={faHeadSideCough}/> Languages:</strong> {pandit.languages?.join(', ') || 'Not specified'}</p>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => editPandit(pandit)} className="btn-edit">
                           <FontAwesomeIcon icon={faPencil}/> Edit
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
                           <FontAwesomeIcon icon={faTrash}/> Delete
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
            <h2> <FontAwesomeIcon icon={faScrewdriverWrench}/>{editingItem ? '✏️ Edit Service' : ' Add New Service'}</h2>
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
                  <FontAwesomeIcon icon={faPlus}/> Add
                </button>
              </div>
              <div className="array-items">
                {serviceForm.details.map((detail, index) => (
                  <span key={index} className="array-item">
                     <FontAwesomeIcon icon={faCheck}/> {detail}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('details', index, setServiceForm, serviceForm)}
                      aria-label={`Remove ${detail}`}
                    >
                       <FontAwesomeIcon icon={faCircleXmark}/>
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


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="service-image">Service Image *</label>
                <input
                  id="service-image"
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
                      setServiceForm({ ...serviceForm, image: file });
                    }
                  }}
                />
                {serviceForm.image && typeof serviceForm.image === 'string' && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img
                      src={serviceForm.image}
                      alt="Current service"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
                {serviceForm.image instanceof File && (
                  <div className="new-image-preview">
                    <p>New Image Preview:</p>
                    <img
                      src={URL.createObjectURL(serviceForm.image)}
                      alt="New service preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <p className="file-name">{serviceForm.image.name}</p>
                  </div>
                )}
                <small className="file-hint">Supported formats: JPG, PNG, WebP. Max size: 5MB</small>
              </div>

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
              <button type="submit" disabled={loading} className="btn-primary"> <FontAwesomeIcon icon={faPlus}/>
                {loading ? (
                  <LoadingSpinner text="Loading dashboard data..." />
                ) : (editingItem ? '💾 Update Service' : ' Add Service')}
              </button>
            </div>
          </form>

          <div className="data-section">
            <div className="section-header">
              <h2> <FontAwesomeIcon icon={faEnvelope}/> Existing Services ({filteredServices.length})</h2>
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
                        <p><strong> <FontAwesomeIcon icon={faIndianRupeeSign}/> Price:</strong> {service.price}</p>
                        <p><strong> <FontAwesomeIcon icon={faClock}/> Duration:</strong> {service.duration}</p>
                        <p><strong> <FontAwesomeIcon icon={faFile}/> Category:</strong> {service.category}</p>
                        <p><strong> <FontAwesomeIcon icon={faEdit}/> Description:</strong> {service.description}</p>
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
                          <FontAwesomeIcon icon={faPencil}/> Edit
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
                          <FontAwesomeIcon icon={faTrash}/> Delete
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
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="btn-view"
                        >
                          View
                        </button>
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
          ):(
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Booking Details</h3>
            <div className="booking-details">
              <p><strong>Booking ID:</strong> {selectedBooking._id}</p>
              <p><strong>Customer:</strong> {selectedBooking.name}</p>
              <p><strong>Contact:</strong> {selectedBooking.contact}</p>
              <p><strong>Email:</strong> {selectedBooking.email}</p>
              <p><strong>Service:</strong> {selectedBooking.serviceId?.name}</p>
              <p><strong>Pandit:</strong> {selectedBooking.panditId?.name || 'Not assigned'}</p>
              <p><strong>Date & Time:</strong> {new Date(selectedBooking.dateTime).toLocaleString()}</p>
              <p><strong>Address:</strong> {selectedBooking.address}</p>
              <p><strong>Status:</strong>
                <span className={`status-badge ${selectedBooking.status}`}>
                  {selectedBooking.status}
                </span>
              </p>
              <p><strong>Price:</strong> {selectedBooking.price}</p>
              {selectedBooking.message && (
                <p><strong>Message:</strong> {selectedBooking.message}</p>
              )}
              <p><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(selectedBooking.updatedAt).toLocaleString()}</p>
            </div>
            <button onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
    </div>

  );
};

export default AdminPanel;


