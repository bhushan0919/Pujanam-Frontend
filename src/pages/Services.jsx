// Frontend/src/pages/Services.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import "../styles/Services.css";
import BookingForm from '../components/common/BookingForm';
import Popup from "../pages/pujaDetails/PopUp";
import { serviceApi } from "../api/serviceApi";
import { useAuth } from "../context/AuthContext";
import ProtectedBooking from "../components/auth/ProtectedBooking";
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookNowButton from '../components/common/BookNowButton';

const Services = () => {
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [pendingBooking, setPendingBooking] = useState(null);
  const [error, setError] = useState("");

  // ✅ FIXED: Add useEffect to load services on component mount
  useEffect(() => {
  console.log('🔄 Services component mounted');
  loadServices();
  
  // Listen for booking events from ProtectedBooking
  const handleOpenBooking = (event) => {
    console.log('🎯 Received openBooking event:', event.detail);
    openBooking(event.detail);
  };
  
  window.addEventListener('openBooking', handleOpenBooking);
  
  return () => {
    window.removeEventListener('openBooking', handleOpenBooking);
  };
}, []);


  useEffect(() => {
    // Check for pending booking when user logs in
    if (isAuthenticated) {
      const savedBooking = localStorage.getItem('pendingBooking');
      if (savedBooking) {
        try {
          const bookingData = JSON.parse(savedBooking);
          setPendingBooking(bookingData);
          
          // Ask user if they want to continue booking
          if (window.confirm('You have a pending booking. Would you like to complete it now?')) {
            openBooking(bookingData.service); // Pass the service object
          }
          
          // Clear pending booking
          localStorage.removeItem('pendingBooking');
        } catch (error) {
          console.error('Error parsing pending booking:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const loadServices = async () => {
    try {
      console.log('📡 Loading services from API...');
      setLoading(true);
      setError("");
      
      const data = await serviceApi.getActiveServices();
      console.log('✅ Services loaded:', data?.length || 0, 'services');
      
      if (data && data.length > 0) {
        setServices(data);
      } else {
        // If no data, use fallback
        console.log('⚠️ No services returned from API, using fallback');
        setServices(getFallbackServices());
        setError('Showing demo services. Real services will load when backend is connected.');
      }
    } catch (error) {
      console.error('❌ Error loading active services:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Use fallback services
      setServices(getFallbackServices());
      setError('Failed to load services from server. Showing demo data.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback services if API fails
  const getFallbackServices = () => {
    return [
      {
        _id: "1",
        name: "Satya Narayan Puja",
        description: "Performed for well-being, prosperity, and happiness, seeking blessings from Lord Satya Narayan.",
        details: ["Remove sufferings", "Purify mind and soul", "Bring positive energy"],
        image: "/images/Satyanarayan.jpg",
        price: "₹1099/-",
        category: "regular"
      },
      {
        _id: "2",
        name: "Ganesh Puja",
        description: "Performed to remove obstacles and bring success, wisdom, and prosperity.",
        details: ["Remove obstacles", "Bring success", "Increase wisdom"],
        image: "/images/GaneshPuja.jpeg",
        price: "₹1499/-",
        category: "regular"
      },
      {
        _id: "3",
        name: "Lakshmi Puja",
        description: "Performed for wealth, prosperity, and blessings from Goddess Lakshmi.",
        details: ["Remove poverty", "Attract wealth", "Bring prosperity"],
        image: "/images/LaxmiPuja.jpeg",
        price: "₹1999/-",
        category: "festive"
      },
      {
        _id: "4",
        name: "Bhumi Pujan",
        description: "Performed to honor and seek blessings from Mother Earth before construction.",
        details: ["Remove Vaastu Doshas", "Purify the land", "Bring auspiciousness"],
        image: "/images/BhumiPujan.jpg",
        price: "₹999/-",
        category: "regular"
      }
    ];
  };

  // Open booking for specific service
  const openBooking = (service) => {
    console.log("📞 Opening booking for:", service?.name || 'Unknown service');
    if (service) {
      setSelectedServiceForBooking(service);
      setSelectedServiceForDetails(null);
    }
  };
  

  // Open details for specific service
  const openDetails = (service) => {
    console.log("📖 Opening details for:", service.name);
    setSelectedServiceForDetails(service);
    setSelectedServiceForBooking(null);
  };

  // Close booking form
  const closeBooking = () => {
    setSelectedServiceForBooking(null);
  };

  // Close details popup
  const closeDetails = () => {
    setSelectedServiceForDetails(null);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking) => {
    console.log("✅ Booking successful:", booking);
    setSelectedServiceForBooking(null);
  };

  

  

  if (loading) {
    return (
      <div className="services-page page-content">
        <h2 className="services-title">Our Puja Services</h2>
        <div className="loading-container">
          <LoadingSpinner text="Loading services..." />
          <button 
            onClick={loadServices}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <h2 className="services-title">Our Puja Services</h2>
      
      {error && (
        <div className="error-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <div className="services-grid">
        {services.length === 0 ? (
          <div className="no-services">
            <p>No services available at the moment.</p>
            <button onClick={loadServices} className="retry-btn">
              🔄 Try Again
            </button>
          </div>
        ) : (
          services.map((service) => (
            <div className="service-card" key={service._id || service.id}>
              <img 
                src={service.image} 
                alt={service.name} 
                className="service-img"
                onError={(e) => {
                  e.target.src = "/images/default-puja.jpg";
                  e.target.alt = "Default Puja Image";
                }}
              />
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p className="price">{service.price}</p>
              
              {/* ✅ FIXED: No pandit parameter needed for services booking */}
              {/* Instead of ProtectedBooking wrapper, use BookNowButton directly */}
<BookNowButton 
  service={service} 
  onBookClick={openBooking}
/>
        
        <button
          className="view-details-btn"
          onClick={() => openDetails(service)}
        >
          View Details
        </button>
      </div>
    ))
  )}
</div>

      {/* Debug info - remove in production */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong>
        <p>Total Services: {services.length}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <button 
          onClick={() => {
            console.log('Current services:', services);
            console.log('Testing API...');
            fetch('http://localhost:5000/api/services/active')
              .then(res => {
                console.log('API Status:', res.status);
                return res.json();
              })
              .then(data => console.log('API Response:', data))
              .catch(err => console.error('API Error:', err));
          }}
          style={{
            padding: '5px 10px',
            background: '#e9ecef',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Test API
        </button>
      </div>

      {/* Booking Form Modal */}
      {selectedServiceForBooking && (
        <div className="modal-overlay" onClick={closeBooking}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeBooking}>✖</button>
            <BookingForm 
              service={selectedServiceForBooking} 
              onClose={closeBooking} 
              onSuccess={handleBookingSuccess}
            />
          </div>
        </div>
      )}

      {/* Service Details Popup */}
      {selectedServiceForDetails && (
        <div className="popup-overlay" onClick={closeDetails}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetails}>✖</button>
            <Popup 
              service={selectedServiceForDetails} 
              onClose={closeDetails} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;