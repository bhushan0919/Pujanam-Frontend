// frontend/src/pages/TermsConditions.jsx
import React from 'react';
import '../styles/PolicyPages.css';

const TermsConditions = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1>Terms & Conditions</h1>
        <p className="last-updated">Last Updated: January 1, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Pujanam's website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2>2. Services Description</h2>
          <p>Pujanam provides an online platform connecting users with pandits for religious ceremonies and puja services. We facilitate bookings but are not responsible for the actual performance of services.</p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must be at least 18 years old to use our services</li>
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You agree to provide accurate and complete information</li>
            <li>You are responsible for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2>4. Booking and Payments</h2>
          <ul>
            <li>Bookings are confirmed only after payment confirmation</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to refuse or cancel bookings</li>
            <li>Payment processing is handled by secure third-party providers</li>
          </ul>
        </section>

        <section>
          <h2>5. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate booking information</li>
            <li>Be present at the scheduled time and location</li>
            <li>Provide necessary arrangements for the puja</li>
            <li>Treat pandits with respect</li>
            <li>Not use the platform for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2>6. Pandit Responsibilities</h2>
          <p>Pandits agree to:</p>
          <ul>
            <li>Perform services with dedication and professionalism</li>
            <li>Arrive on time at the scheduled location</li>
            <li>Maintain respectful conduct</li>
            <li>Follow all religious protocols and customs</li>
          </ul>
        </section>

        <section>
          <h2>7. Cancellation and Refunds</h2>
          <p>Please refer to our <a href="/cancellation-policy">Cancellation Policy</a> for detailed information.</p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>Pujanam is not liable for:</p>
          <ul>
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Service quality provided by pandits</li>
            <li>Technical issues beyond our control</li>
            <li>Losses resulting from unauthorized account access</li>
          </ul>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>All content on this website, including logos, text, graphics, and software, is the property of Pujanam and protected by copyright laws.</p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse our services.</p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, India.</p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of our services constitutes acceptance of modified terms.</p>
        </section>

        <section>
          <h2>13. Contact Information</h2>
          <p>For questions about these terms:</p>
          <ul>
            <li>Email: <a href="mailto:legal@pujanam.com">legal@pujanam.com</a></li>
            <li>Phone: +91 9373120370</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;