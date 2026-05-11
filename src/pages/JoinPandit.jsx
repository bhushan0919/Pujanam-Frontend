// frontend/src/pages/JoinPandit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildUrl } from '../config';
import '../styles/JoinPandit.css';

function JoinPandit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    qualification: '',
    pujaTypes: '',
    experience: '',
    aadhar: ''
  });

  const handleChange = (e) => {
    let value = e.target.value;

    // Validate mobile number - only numbers, max 10 digits
    if (e.target.name === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    // Validate Aadhar - only numbers, max 12 digits
    if (e.target.name === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }
    if (e.target.name === 'pujaTypes') {
      setCharCount(e.target.value.length);
    }

    // Validate experience - only numbers, min 0, max 50
    if (e.target.name === 'experience') {
      value = value.replace(/\D/g, '');
      if (parseInt(value) > 50) value = 50;
    }


    setFormData({
      ...formData,
      [e.target.name]: value
    });

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number starting with 6,7,8, or 9');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Qualification validation
    if (!formData.qualification.trim()) {
      setError('Qualification is required');
      return false;
    }

    // Puja types validation
    if (!formData.pujaTypes.trim()) {
      setError('Please mention the types of puja you can perform');
      return false;
    }

    // Experience validation
    if (!formData.experience) {
      setError('Years of experience is required');
      return false;
    }

    const expNum = parseInt(formData.experience);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) {
      setError('Please enter valid years of experience (0-50)');
      return false;
    }

    // Aadhar validation
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(formData.aadhar)) {
      setError('Please enter a valid 12-digit Aadhar number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(buildUrl('/application/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        // Reset form
        setFormData({
          name: '',
          mobile: '',
          email: '',
          qualification: '',
          pujaTypes: '',
          experience: '',
          aadhar: ''
        });

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-pandit-container">
      <div className="form-card">
        <h2>Join as Pandit</h2>
        <p>Fill the form to register on our portal. Our admin team will review your application.</p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            className={formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile) ? 'error' :
              formData.mobile && /^[6-9]\d{9}$/.test(formData.mobile) ? 'valid' : ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile) && (
            <span className="field-hint">⚠️ Enter 10-digit number starting with 6,7,8,9</span>
          )}

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number * (10-digit)"
            value={formData.mobile}
            onChange={handleChange}
            required
            disabled={loading}
            maxLength="10"
          />

          <input
            type="email"
            name="email"
            placeholder="Email ID *"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="text"
            name="qualification"
            placeholder="Qualification *"
            value={formData.qualification}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <textarea
            name="pujaTypes"
            placeholder="Types of Puja you can perform * (e.g., Satya Narayan, Ganesh Puja, etc.)"
            value={formData.pujaTypes}
            onChange={handleChange}
            required
            disabled={loading}
            rows="3"
            maxLength="500"

          />
          <div className="char-counter">{charCount}/500 characters</div>

          <input
            type="number"
            name="experience"
            placeholder="Years of Experience *"
            value={formData.experience}
            onChange={handleChange}
            required
            disabled={loading}
            min="0"
            max="50"
          />

          <input
            type="text"
            name="aadhar"
            placeholder="Aadhar Number * (12-digit)"
            value={formData.aadhar}
            onChange={handleChange}
            required
            disabled={loading}
            maxLength="12"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="note">
          Note: Your application will be reviewed by our admin team.
          You will receive email notification once your application is processed.
        </p>
      </div>
    </div>
  );
}

export default JoinPandit;