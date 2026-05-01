// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';
import '../styles/PolicyPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 1, 2025</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>At Pujanam, we collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, address</li>
            <li><strong>Booking Information:</strong> Service details, date and time, pandit preferences</li>
            <li><strong>Payment Information:</strong> Transaction details (we do not store full payment credentials)</li>
            <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process and confirm your bookings</li>
            <li>To communicate with you about your bookings</li>
            <li>To improve our services and user experience</li>
            <li>To send you important updates and promotional offers (with your consent)</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>We share your information only with:</p>
          <ul>
            <li><strong>Pandits:</strong> To facilitate your booking (name, contact, address, service details)</li>
            <li><strong>Service Providers:</strong> For payment processing and email delivery</li>
            <li><strong>Legal Authorities:</strong> When required by law</li>
          </ul>
          <p>We never sell your personal information to third parties.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:privacy@pujanam.com">privacy@pujanam.com</a></p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>We use cookies to:</p>
          <ul>
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze site traffic</li>
          </ul>
          <p>You can disable cookies in your browser settings.</p>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect information from children.</p>
        </section>

        <section>
          <h2>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or website notice.</p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>If you have questions about this Privacy Policy:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@pujanam.com">privacy@pujanam.com</a></li>
            <li>Phone: +91 9373120370</li>
            <li>Address: Pune, India</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;