// Frontend/src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Pujanam</h3>
            <p>Connecting devotees with expert pandits for all spiritual needs.</p>
            <div className="social-links">
              <a href="#" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i></a>

              <a href="#" target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i></a>

              <a href="https://instagram.com/bhushan_0919" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i></a>

              <a href="https://youtube.com/" target="_blank" rel="noreferrer">
                <i className="fab fa-youtube"></i></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/pujas">Puja Services</Link></li>
              <li><Link to="/pandits">Find Pandits</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/pujas/regular">Regular Puja</Link></li>
              <li><Link to="/pujas/festive">Festival Puja</Link></li>
              <li><Link to="/pujas/hawan">Hawan's</Link></li>
              <li><Link to="/pujas/shanti">Shanti's</Link></li>
              <li><Link to="pujas/shardhha">Shraddha</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul>
              <li><i className="fas fa-phone"></i> +91 9373120370</li>
              <li><i className="fas fa-envelope"></i> info@pujanam.com</li>
              <li><i className="fas fa-map-marker-alt"></i> Pune, India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Pujanam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;