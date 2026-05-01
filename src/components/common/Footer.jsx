// Frontend/src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

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
                <FontAwesomeIcon icon={faFacebookF} />
              </a>

              <a href="#" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faTwitter} />
              </a>

              <a href="https://instagram.com/bhushan_0919" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a href="https://youtube.com/" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faYoutube} />
              </a>

            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/Services">Puja Services</Link></li>
              <li><Link to="/find-pandit">Find Pandits</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Regular Puja</Link></li>
              <li><Link to="/services">Festival Puja</Link></li>
              <li><Link to="/services">Hawan's</Link></li>
              <li><Link to="/services">Shanti's</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
              <li><Link to="/delete-account">Delete My Account</Link></li>
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