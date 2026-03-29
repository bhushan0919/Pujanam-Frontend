// Frontend/src/components/common/BookNowButton.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookNowButton = ({ service, onBookClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('🎯 BookNowButton clicked for:', service.name);
    
    if (!isAuthenticated) {
      // Store pending booking
      localStorage.setItem('pendingBooking', JSON.stringify({
        service: service,
        redirectTo: window.location.pathname
      }));
      
      // Redirect to login
      navigate('/user/login');
      return;
    }
    
    // User is logged in, open booking modal
    if (onBookClick) {
      onBookClick(service);
    }
  };

  return (
    <button 
      className="book-btn" 
      onClick={handleClick}
    >
      Book Now
    </button>
  );
};

export default BookNowButton;