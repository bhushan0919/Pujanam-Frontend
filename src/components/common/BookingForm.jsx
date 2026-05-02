// Frontend/src/components/common/BookingForm.jsx - COMPLETE FIXED VERSION
import React, { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookingApi";
import { panditApi } from "../../api/panditApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner';
import { analytics } from '../../utils/analytics';
import { serviceApi } from "../../api/serviceApi";
import RazorpayPayment from './RazorpayPayment';
import "../../styles/bookingForm.css";
import { authStorage } from '../../api/apiClient';
import API_CONFIG from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const extractPrice = (priceString) => {
  if (!priceString) return 0;
  const match = priceString.toString().match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

export default function BookingForm({ service, pandit, onSuccess, onClose }) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    dateTime: "",
    address: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [panditLocations, setPanditLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityError, setCityError] = useState('');

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || ""
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadServices();
    loadPanditLocations();
  }, []);

  useEffect(() => {
    if (service) {
      setSelectedService(service);
    }
  }, [service]);

  useEffect(() => {
    const restorePendingBooking = async () => {
      if (isAuthenticated && user) {
        const savedBooking = localStorage.getItem('pendingBooking');
        if (savedBooking) {
          try {
            const bookingData = JSON.parse(savedBooking);
            console.log('🔄 Restoring pending booking:', bookingData);
            
            if (bookingData.formData) {
              setForm(bookingData.formData);
            }
            
            if (bookingData.selectedCity) {
              setSelectedCity(bookingData.selectedCity);
            }
            
            if (bookingData.service) {
              setSelectedService(bookingData.service);
            } else if (bookingData.serviceId) {
              const service = await serviceApi.getServiceById(bookingData.serviceId);
              setSelectedService(service);
            }
            
            localStorage.removeItem('pendingBooking');
            toast?.success('Your booking information has been restored!');
          } catch (error) {
            console.error('Error restoring pending booking:', error);
            localStorage.removeItem('pendingBooking');
          }
        }
      }
    };
    
    restorePendingBooking();
  }, [isAuthenticated, user]);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await serviceApi.getActiveServices();
      setServices(data);

      if (service) {
        setSelectedService(service);
      } else if (data.length > 0) {
        setSelectedService(data[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadPanditLocations = async () => {
    try {
      setLoadingLocations(true);
      const data = await panditApi.getPanditLocations();
      setPanditLocations(data.locations || []);
    } catch (error) {
      console.error('Error loading pandit locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedService) newErrors.service = 'Please select a puja/service';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }
    if (!form.dateTime) newErrors.dateTime = 'Date and time is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (minimum 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCity = () => {
    if (!selectedCity) {
      setCityError('Please select a city where you want the pandit');
      return false;
    }
    setCityError('');
    return true;
  };

  const voidBooking = async (bookingId) => {
    try {
      const { token } = authStorage.getAuth('user');
      await fetch(`${API_CONFIG.BASE_URL}/user/bookings/${bookingId}/void`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to void booking:', err);
    }
  };

  const handlePaymentCancel = async () => {
    if (createdBookingId) {
      await voidBooking(createdBookingId);
    }
    setShowPayment(false);
    setCreatedBookingId(null);
    setTotalAmount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const bookingData = {
        serviceId: selectedService?._id,
        service: selectedService,
        panditId: pandit?._id,
        pandit: pandit,
        formData: form,
        selectedCity: selectedCity,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      localStorage.setItem('previousPage', window.location.pathname);
      alert('🔐 Please login or register to complete your booking. Your information has been saved.');
      navigate('/user/login');
      return;
    }

    if (!validateForm()) return;
    if (!validateCity()) return;

    setLoading(true);
    try {
      const priceValue = extractPrice(selectedService?.price);
      const totalPrice = priceValue;
      
      const payload = {
        name: form.name,
        contact: form.contact,
        email: form.email,
        serviceId: selectedService?._id,
        panditId: pandit?._id || null,
        dateTime: form.dateTime,
        address: form.address,
        userLocation: selectedCity,
        message: form.message,
        price: selectedService?.price,
        totalAmount: totalPrice
      };

      const result = await bookingApi.createBooking(payload);

      if (result.success) {
        analytics.trackBooking(result.booking);
        setCreatedBookingId(result.booking._id);
        setTotalAmount(totalPrice);
        setShowPayment(true);
        localStorage.removeItem('pendingBooking');
      } else {
        alert("❌ Booking failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert("❌ Booking failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const displayService = selectedService || service;
  const displayPrice = displayService?.price || 'Price on request';
  const advanceAmount = totalAmount ? Math.round(totalAmount * 0.3) : 0;

  // Save booking data helper function
  const saveBookingData = () => {
    const formDataToSave = {
      serviceId: selectedService?._id,
      service: selectedService,
      panditId: pandit?._id,
      pandit: pandit,
      formData: form,
      selectedCity: selectedCity,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingBooking', JSON.stringify(formDataToSave));
    localStorage.setItem('previousPage', window.location.pathname);
  };



  return (
    <div className="booking-form">
      <div className="booking-form-header">
        <h3>Book: {pandit?.name || 'Pandit'} - {displayService?.name || 'Select Service'}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
 <div className="booking-form-content"> 
      <div className="booking-form-body">
        <div className="booking-form-scrollable">
          {!isAuthenticated && (
            <div className="auth-notice warning-notice">
              <p className="warning-title">🔐 Please login or register to book this service</p>
              <p className="warning-message">
                Your booking information will be saved. After login, you can continue where you left off.
              </p>
              <div className="auth-buttons">
                <button
                  onClick={() => {
                    saveBookingData();
                    navigate('/user/login');
                  }}
                  className="auth-btn login-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    saveBookingData();
                    navigate('/user/register');
                  }}
                  className="auth-btn register-btn"
                >
                  Register
                </button>
                <button onClick={onClose} className="auth-btn cancel-auth-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Service Selection */}
          <div className="form-group">
            <label>Select Puja/Service *</label>
            <select
              value={selectedService?._id || ''}
              onChange={(e) => {
                const service = services.find(s => s._id === e.target.value);
                setSelectedService(service);
              }}
              required
              disabled={loadingServices}
            >
              <option value="">-- Select a Puja/Service --</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} - {s.price}
                </option>
              ))}
            </select>
            {!selectedService && <span className="error-text">Please select a service</span>}
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Your Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={errors.name ? 'error' : ''}
                disabled={isAuthenticated}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
              {isAuthenticated && <small className="field-info">Auto-filled from your profile</small>}
            </label>

            <label>
              Contact (Mobile) *
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                className={errors.contact ? 'error' : ''}
                placeholder="10-digit mobile number"
                disabled={isAuthenticated}
              />
              {errors.contact && <span className="error-text">{errors.contact}</span>}
              {isAuthenticated && <small className="field-info">Auto-filled from your profile</small>}
            </label>

            <label>
              Email *
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your@email.com"
                required
                disabled={isAuthenticated}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
              {isAuthenticated && <small className="field-info">Auto-filled from your profile</small>}
            </label>

            <label>
              Date & Time *
              <input
                name="dateTime"
                type="datetime-local"
                value={form.dateTime}
                onChange={handleChange}
                required
                className={errors.dateTime ? 'error' : ''}
              />
              {errors.dateTime && <span className="error-text">{errors.dateTime}</span>}
            </label>

            <div className="form-group">
              <label>Select City for Puja *</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCityError('');
                }}
                required
                disabled={loadingLocations}
                className={cityError ? 'error' : ''}
              >
                <option value="">-- Select a City --</option>
                {panditLocations.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {cityError && <span className="error-text">{cityError}</span>}
              {panditLocations.length === 0 && !loadingLocations && (
                <small className="error-text">
                  ⚠️ No cities available. Please contact support.
                </small>
              )}
              <small className="field-info">
                Pandits are available in these cities only
              </small>
            </div>

            <label>
              Full Address *
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete address with street, area, city, and landmark"
                rows="3"
                required
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
              <small className="field-info">Minimum 10 characters required</small>
            </label>

            <label>
              Note (Optional)
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Any special requirements or notes..."
                rows="3"
              />
            </label>
          </form>
        </div>
        </div>

        {/* Form Actions - ALWAYS VISIBLE at bottom */}
        <div className="form-actions-fixed">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedService}
            className="submit-btn"
          >
            {loading ? <InlineSpinner /> : "Confirm Booking"}
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && createdBookingId && (
        <div className="modal-overlay" onClick={handlePaymentCancel}>
          <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
            <h3>Complete Payment to Confirm Booking</h3>
            <p>Pay 30% advance to confirm your booking</p>
            <p className="total-amount">Total Amount: {displayPrice}</p>
            <p className="advance-amount">Advance (30%): ₹{advanceAmount}</p>
            <RazorpayPayment
              bookingId={createdBookingId}
              totalAmount={totalAmount}
              onSuccess={() => {
                setShowPayment(false);
                setCreatedBookingId(null);
                alert("✅ Booking confirmed! Payment successful.");
                if (onSuccess) onSuccess();
                if (onClose) onClose();
              }}
              onFailure={handlePaymentCancel}
            />
            <button onClick={handlePaymentCancel} className="cancel-btn">Cancel Payment</button>
          </div>
        </div>
      )}
    </div>
  );
}