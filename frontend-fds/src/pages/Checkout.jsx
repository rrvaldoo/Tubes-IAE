import React, { useState, useEffect } from 'react';
import PaymentForm from '../components/PaymentForm';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

/**
 * Checkout Page for Food Delivery System
 */
function Checkout() {
  const navigate = useNavigate();
  const [nim, setNim] = useState('');
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedNim = localStorage.getItem('fds_nim');
    const storedUserId = localStorage.getItem('fds_userId');
    const storedUser = localStorage.getItem('fds_user');
    
    if (storedNim) {
      setNim(storedNim);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fds_token');
    localStorage.removeItem('fds_userId');
    localStorage.removeItem('fds_nim');
    localStorage.removeItem('fds_user');
    navigate('/login');
  };

  const handlePaymentComplete = (order) => {
    // Navigate to order confirmation page
    navigate(`/order-confirmation/${order.orderId}`, { state: { order } });
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="header-section">
          <h1>Food Delivery System - Checkout</h1>
          {user && (
            <div className="user-badge">
              <span>Welcome, {user.name}!</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
        
        <div className="user-info">
          <label>
            NIM/Email (for DOSWALLET payment):
            <input
              type="text"
              value={nim}
              onChange={(e) => {
                setNim(e.target.value);
                localStorage.setItem('fds_nim', e.target.value);
              }}
              placeholder="Enter your NIM or email"
              required
            />
          </label>
          <p className="help-text">
            This NIM/Email must match your DOSWALLET account identifier.
            {user && <span className="logged-in-indicator"> ✓ Logged in as: {user.email}</span>}
          </p>
        </div>

        <PaymentForm 
          userId={userId || 'user_1'}
          nim={nim}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}

export default Checkout;

