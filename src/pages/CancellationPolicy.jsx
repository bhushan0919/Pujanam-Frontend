// frontend/src/pages/CancellationPolicy.jsx
import React from 'react';
import '../styles/PolicyPages.css';

const CancellationPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1>Cancellation & Refund Policy</h1>
        <p className="last-updated">Last Updated: January 1, 2025</p>

        <section>
          <h2>1. User Cancellation Policy</h2>
          
          <h3>1.1 Standard Cancellation</h3>
          <ul>
            <li>Cancellations made <strong>more than 24 hours</strong> before the scheduled puja: <strong>Full refund</strong></li>
            <li>Cancellations made <strong>less than 24 hours</strong> before the scheduled puja: <strong>No refund</strong></li>
            <li>Cancellations on the day of puja: <strong>No refund</strong></li>
          </ul>

          <h3>1.2 How to Cancel</h3>
          <ul>
            <li>Log in to your account</li>
            <li>Go to "My Bookings"</li>
            <li>Click "Cancel" on the relevant booking</li>
            <li>Confirm cancellation</li>
          </ul>
        </section>

        <section>
          <h2>2. Pandit Cancellation Policy</h2>
          <ul>
            <li>If a pandit cancels less than 12 hours before the puja: <strong>Full refund to user + Replacement pandit arranged</strong></li>
            <li>If a pandit cancels more than 12 hours before: <strong>Full refund + Alternative pandit offered</strong></li>
            <li>Repeated cancellations may result in pandit account suspension</li>
          </ul>
        </section>

        <section>
          <h2>3. Admin Cancellation</h2>
          <ul>
            <li>Admin can cancel any booking at any time (emergency situations)</li>
            <li>Full refund will be processed for admin-initiated cancellations</li>
            <li>Users will be notified via email and SMS</li>
          </ul>
        </section>

        <section>
          <h2>4. Refund Process</h2>
          <ul>
            <li>Refunds are processed within <strong>5-7 business days</strong></li>
            <li>Refunds are issued to the original payment method</li>
            <li>You will receive a confirmation email once refund is processed</li>
            <li>For cash payments, contact support for refund arrangements</li>
          </ul>
        </section>

        <section>
          <h2>5. No-Show Policy</h2>
          <ul>
            <li><strong>User No-Show:</strong> If user is not present at the scheduled time, no refund will be provided</li>
            <li><strong>Pandit No-Show:</strong> If pandit does not arrive within 30 minutes, full refund + ₹200 compensation</li>
          </ul>
        </section>

        <section>
          <h2>6. Force Majeure</h2>
          <p>In case of natural disasters, government restrictions, or unforeseen circumstances:</p>
          <ul>
            <li>Full refund will be provided</li>
            <li>Option to reschedule without additional charges</li>
            <li>No cancellation fees apply</li>
          </ul>
        </section>

        <section>
          <h2>7. Special Cases</h2>
          
          <h3>7.1 Medical Emergency</h3>
          <p>With valid medical certificate, cancellation can be made up to 2 hours before puja with 50% refund.</p>
          
          <h3>7.2 Wrong Booking</h3>
          <p>If you booked the wrong service, contact support within 1 hour for free modification.</p>
          
          <h3>7.3 Dissatisfaction with Service</h3>
          <p>If you are unsatisfied, please submit a support ticket. We will investigate and may offer partial refund.</p>
        </section>

        <section>
          <h2>8. How to Request a Refund</h2>
          <ol>
            <li>Go to "Contact Support" in your dashboard</li>
            <li>Select "Refund Request" as issue type</li>
            <li>Provide booking ID and reason</li>
            <li>Our team will review and respond within 48 hours</li>
          </ol>
        </section>

        <section>
          <h2>9. Contact for Cancellation</h2>
          <ul>
            <li>Email: <a href="mailto:cancellations@pujanam.com">cancellations@pujanam.com</a></li>
            <li>Phone: +91 9373120370</li>
            <li>Support Ticket: Via User Dashboard</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CancellationPolicy;