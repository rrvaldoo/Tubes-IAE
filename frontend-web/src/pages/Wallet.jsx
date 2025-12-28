import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { walletClient } from '../services/apollo';
import './Wallet.css';

// GraphQL Queries & Mutations
const GET_MY_WALLET = gql`
  query GetMyWallet {
    my_wallet {
      wallet_id
      user_id
      balance
      points
      created_at
      updated_at
    }
  }
`;

const UPDATE_BALANCE = gql`
  mutation UpdateBalance($amount: Decimal!, $operation: String!) {
    updateBalance(amount: $amount, operation: $operation) {
      wallet_id
      user_id
      balance
      points
    }
  }
`;

const UPDATE_POINTS = gql`
  mutation UpdatePoints($points: Int!, $operation: String!) {
    updatePoints(points: $points, operation: $operation) {
      wallet_id
      user_id
      balance
      points
    }
  }
`;

/**
 * Wallet Service Page
 * Menampilkan balance, points, dan fitur update manual
 */
function Wallet() {
  const navigate = useNavigate();
  const [balanceAmount, setBalanceAmount] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState('add');
  const [pointsOperation, setPointsOperation] = useState('add');
  const [message, setMessage] = useState({ type: '', text: '' });

  const { data, loading, error, refetch } = useQuery(GET_MY_WALLET, {
    client: walletClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onError: (err) => {
      if (err.message.includes('Authentication')) {
        navigate('/login');
      }
    }
  });

  const [updateBalance] = useMutation(UPDATE_BALANCE, {
    client: walletClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Balance updated successfully!' });
      setBalanceAmount('');
      refetch();
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.message });
    }
  });

  const [updatePoints] = useMutation(UPDATE_POINTS, {
    client: walletClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Points updated successfully!' });
      setPointsAmount('');
      refetch();
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.message });
    }
  });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleBalanceUpdate = (e) => {
    e.preventDefault();
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    updateBalance({
      variables: {
        amount: parseFloat(balanceAmount),
        operation: balanceOperation
      }
    });
  };

  const handlePointsUpdate = (e) => {
    e.preventDefault();
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid points amount' });
      return;
    }
    updatePoints({
      variables: {
        points: parseInt(pointsAmount),
        operation: pointsOperation
      }
    });
  };

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-container">
          <div className="loading">Loading wallet...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-page">
        <div className="wallet-container">
          <div className="error-display">Error loading wallet. Please try again.</div>
        </div>
      </div>
    );
  }

  const wallet = data?.my_wallet;

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <div className="wallet-header">
          <h1>My Wallet</h1>
          <p className="subtitle">Manage your balance and points</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Wallet Overview Cards */}
        <div className="wallet-cards">
          <div className="wallet-card balance-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Balance</h3>
              <p className="card-value">Rp {wallet?.balance?.toLocaleString('id-ID') || '0'}</p>
              <p className="card-label">Available balance</p>
            </div>
          </div>

          <div className="wallet-card points-card">
            <div className="card-icon">⭐</div>
            <div className="card-content">
              <h3>Points</h3>
              <p className="card-value">{wallet?.points || 0}</p>
              <p className="card-label">Reward points</p>
            </div>
          </div>
        </div>

        {/* Update Balance Section */}
        <div className="wallet-section">
          <h2>Update Balance</h2>
          <p className="section-description">Manually update your wallet balance (Admin function)</p>
          
          <form onSubmit={handleBalanceUpdate} className="update-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount (Rp)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Operation</label>
                <select
                  value={balanceOperation}
                  onChange={(e) => setBalanceOperation(e.target.value)}
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="update-button">
              Update Balance
            </button>
          </form>
        </div>

        {/* Update Points Section */}
        <div className="wallet-section">
          <h2>Update Points</h2>
          <p className="section-description">Manually update your reward points (Admin/Redeem function)</p>
          
          <form onSubmit={handlePointsUpdate} className="update-form">
            <div className="form-row">
              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  min="0"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  placeholder="Enter points"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Operation</label>
                <select
                  value={pointsOperation}
                  onChange={(e) => setPointsOperation(e.target.value)}
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract (Redeem)</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="update-button">
              Update Points
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>ℹ️ Information</h3>
          <ul>
            <li>Balance automatically updates when you deposit, withdraw, transfer, or make payments</li>
            <li>Points are automatically added when you make payments (1 point per Rp 10,000)</li>
            <li>Points can be used for discounts on future purchases</li>
            <li>Manual updates are typically for admin adjustments or point redemption</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Wallet;

