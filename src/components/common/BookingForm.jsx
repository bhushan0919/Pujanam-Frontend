// Frontend/src/components/common/BookingForm.jsx - UPDATED
import React, { useState } from "react";
import { bookingApi } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner';
import { analytics } from '../../utils/analytics';
import "../../styles/bookingForm.css";


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

  // Auto-fill form if user is logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || ""
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }
    if (!form.dateTime) newErrors.dateTime = 'Date and time is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (minimum 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store current booking data and redirect to login
      const bookingData = {
        serviceId: service._id || service.id,
        panditId: pandit?._id || pandit?.id,
        formData: form
      };
      
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      localStorage.setItem('previousPage', window.location.pathname);
      
      alert('Please login or register to book a service');
      navigate('/user/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        contact: form.contact,
        email: form.email,
        serviceId: service._id || service.id,
        panditId: pandit?._id || pandit?.id,
        dateTime: form.dateTime,
        address: form.address,
        message: form.message,
        price: service.price
      };

      console.log('📤 Sending booking payload:', payload);

      const result = await bookingApi.createBooking(payload);
      
      console.log('✅ Booking successful:', result);
      
      if (result.success) {
        analytics.trackBooking(result.booking);
        alert("✅ Booking placed successfully! We will contact you soon.");
        
        // Clear pending booking
        localStorage.removeItem('pendingBooking');
        
        if (onSuccess) onSuccess(result.booking);
        if (onClose) onClose();

        // Reset form
        setForm({
          name: user?.name || "",
          contact: user?.phone || "",
          email: user?.email || "",
          dateTime: "",
          address: "",
          message: ""
        });
      } else {
        alert("❌ Booking failed: " + (result.message || "Unknown error"));
      }

    } catch (err) {
      console.error('Booking error details:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.message) {
        alert("❌ Booking failed: " + err.response.data.message);
      } else if (err.response?.data?.errors) {
        alert("❌ Booking failed: " + JSON.stringify(err.response.data.errors));
      } else {
        alert("❌ Booking failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <div className="booking-form-header">
        <h3>Book: {service?.name}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {!isAuthenticated && (
        <div className="auth-notice">
          <p>🔐 <strong>Please login or register to book this service</strong></p>
          <p>Your information will be saved for faster booking next time</p>
          <div className="auth-buttons">
            <button 
              onClick={() => {
                localStorage.setItem('previousPage', window.location.pathname);
                navigate('/user/login');
              }}
              className="auth-btn"
            >
              Login
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('previousPage', window.location.pathname);
                navigate('/user/register');
              }}
              className="auth-btn secondary"
            >
              Register
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Your Name *
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={errors.name ? 'error' : ''}
            disabled={isAuthenticated} // Disable if logged in (auto-filled)
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

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || !isAuthenticated} 
            className="submit-btn"
          >
            {loading ? <InlineSpinner /> : 
              isAuthenticated ? "Confirm Booking" : "Login to Book"}
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};