// Frontend/src/components/common/Header.jsx - UPDATED
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleUser, faAddressCard,faGear,faBook,faCalendar, faArrowRight, faArrowDown} from "@fortawesome/free-solid-svg-icons";
import '../../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  const { user, logout, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setIsMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate('/services');
    } else {
      navigate('/user/login');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target) &&
          userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Close menu when clicking on nav links
    const handleNavLinkClick = () => {
      closeMenus();
    };

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      navLinks.forEach(link => {
        link.removeEventListener('click', handleNavLinkClick);
      });
    };
  }, []);

  // Close menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMenus();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

 return (
  <header className="header">
    <nav className="nav">
      {/* Mobile Menu Button - MOVED TO LEFT SIDE */}
      <button
        ref={buttonRef}
        className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Left side - Logo and Site Name */}
      <div className="nav-left">
        <Link to="/" className="site-brand" onClick={closeMenus}>
          <img src="/icon.png" alt="Pujanam Logo" className="logo-image" />
          <span className="site-name">Pujanam</span>
        </Link>
      </div>

      {/* Right side - Desktop Navigation (hidden on mobile) */}
      <div
        ref={menuRef}
        className={`nav-right ${isMenuOpen ? 'nav-right-open' : ''}`}
      >
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link" onClick={closeMenus}>Home</Link>
          </li>
          <li>
            <Link to="/services" className="nav-link" onClick={closeMenus}>Services</Link>
          </li>
          <li>
            <Link to="/find-pandit" className="nav-link" onClick={closeMenus}>Find Pandit</Link>
          </li>
          <li>
            <Link to="/contact" className="nav-link" onClick={closeMenus}>Contact</Link>
          </li>
        </ul>

        {/* Mobile User Section */}
        {isAuthenticated ? (
          <div className="mobile-user-section">
            <div className="mobile-user-header">
              <span className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </span>
              <div className="mobile-user-details">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
            
            <div className="mobile-nav-links">
              <Link to="/user/dashboard" 
                className="mobile-nav-item"
                onClick={closeMenus} >
                <FontAwesomeIcon icon={faBook}/>
                Dashboard
              </Link>
              
              <Link 
                to="/user/dashboard" 
                className="mobile-nav-item"
                onClick={closeMenus}
              >
                <FontAwesomeIcon icon={faCalendar}/>
                My Bookings
              </Link>
              <Link 
                to="/user/dashboard" 
                className="mobile-nav-item"
                onClick={closeMenus}
              >
                <FontAwesomeIcon icon={faGear}/>
                Profile Settings
              </Link>
              <button 
                className="mobile-nav-item logout-item"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faArrowRight}/>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="mobile-auth-section">
            <Link 
              to="/user/login" 
              className="mobile-login-btn" 
              onClick={closeMenus}
            >
              <FontAwesomeIcon icon={faCircleUser} /> Login
            </Link>
            <Link 
              to="/user/register" 
              className="mobile-register-btn" 
              onClick={closeMenus}
            >
              <FontAwesomeIcon icon={faAddressCard}/> Register
            </Link>
          </div>
        )}
        
        {/* Book Now Button */}
        <button className="mobile-book-now-btn" onClick={handleBookNow}> <FontAwesomeIcon icon={faCalendar}/>
          {isAuthenticated ? ' Book Service' : 'Book Now'}
        </button>
      </div>

      {/* Desktop User Menu (hidden on mobile) */}
      <div className="desktop-user-section">
        {isAuthenticated ? (
          <div className="user-info" ref={userMenuRef}>
            <button 
              className="user-menu-btn"
              onClick={toggleUserMenu}
              aria-label="User menu"
            >
              <span className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </span>
              <span className="user-name">{user?.name || 'User'}</span>
              <FontAwesomeIcon icon={faArrowDown}/>
            </button>
            
            {userMenuOpen && (
              <div className="user-dropdown">
                <Link 
                  to="/user/dashboard" 
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  <FontAwesomeIcon icon={faBook}/> Dashboard
                </Link>
                <Link 
                  to="/user/dashboard" 
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                 <FontAwesomeIcon icon={faCalendar}/> My Bookings
                </Link>
                <Link 
                  to="/user/dashboard" 
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  <FontAwesomeIcon icon={faGear}/> Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faArrowRight}/>  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/user/login" className="login-btn" onClick={closeMenus}>
               <FontAwesomeIcon icon={faCircleUser} /> Login
            </Link>
            <Link to="/user/register" className="register-btn" onClick={closeMenus}>
                <FontAwesomeIcon icon={faAddressCard}/> Register
            </Link>
          </div>
        )}
        
        {/* Desktop Book Now Button */}
        <button className="book-now-btn" onClick={handleBookNow}><FontAwesomeIcon icon={faCalendar}/>
          {isAuthenticated ? ' Book Service' : 'Book Now'}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenus}></div>
      )}
    </nav>
  </header>
);
}
export default Header;