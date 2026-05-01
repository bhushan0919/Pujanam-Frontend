// frontend/src/pages/DeleteAccount.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authStorage } from '../api/apiClient';
import '../styles/PolicyPages.css';

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    if (!reason) {
      setError('Please select a reason for deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { token } = authStorage.getAuth('user');
      
      const response = await fetch('http://localhost:5000/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Your account has been deleted successfully. We are sad to see you go!');
        logout();
        navigate('/');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/user/login');
    return null;
  }

  return (
    <div className="policy-container">
      <div className="policy-content delete-account-content">
        <h1>Delete My Account</h1>
        <p className="warning-text">⚠️ Warning: This action is permanent and cannot be undone!</p>

        {step === 1 && (
          <>
            <section>
              <h2>What happens when you delete your account?</h2>
              <ul>
                <li>❌ Your profile information will be permanently removed</li>
                <li>❌ Your booking history will be anonymized</li>
                <li>❌ You will lose access to all your bookings</li>
                <li>❌ Your reviews and ratings will be anonymized</li>
                <li>✅ Your past bookings with pandits will be preserved for their records</li>
                <li>✅ Any pending refunds will still be processed</li>
              </ul>
            </section>

            <section>
              <h2>Before you delete your account, consider:</h2>
              <ul>
                <li>📧 Download your data (coming soon)</li>
                <li>🔄 You can also deactivate temporarily instead of deleting</li>
                <li>💬 Contact support if you're facing issues we can help with</li>
              </ul>
            </section>

            <button 
              className="btn-continue"
              onClick={() => setStep(2)}
            >
              Continue to Account Deletion
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <section>
              <h2>Why are you leaving us?</h2>
              <div className="reason-options">
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Not satisfied with service"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Not satisfied with service
                </label>
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Too expensive"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Too expensive
                </label>
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Found alternative platform"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Found alternative platform
                </label>
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Privacy concerns"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Privacy concerns
                </label>
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="No longer need services"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  No longer need services
                </label>
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Other"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Other
                </label>
              </div>
            </section>

            <section>
              <h2>Confirm Deletion</h2>
              <p>Type <strong>DELETE</strong> in the box below to confirm:</p>
              <input
                type="text"
                className="confirm-input"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type DELETE here"
              />
            </section>

            {error && <div className="error-message">{error}</div>}

            <div className="delete-actions">
              <button 
                className="btn-cancel"
                onClick={() => navigate('/user/dashboard')}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Permanently Delete My Account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccount;