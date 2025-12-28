import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { transactionClient } from '../services/apollo';
import './Transactions.css';

// GraphQL Queries & Mutations
const GET_MY_TRANSACTIONS = gql`
  query GetMyTransactions($limit: Int, $offset: Int) {
    myTransactions(limit: $limit, offset: $offset) {
      transaction_id
      user_id
      amount
      type
      payment_method
      date
      receiver_id
      description
      status
    }
  }
`;

const DEPOSIT = gql`
  mutation Deposit($amount: Float!, $paymentMethod: String, $description: String) {
    deposit(amount: $amount, paymentMethod: $paymentMethod, description: $description) {
      transaction_id
      user_id
      amount
      type
      status
      date
    }
  }
`;

const WITHDRAW = gql`
  mutation Withdraw($amount: Float!, $paymentMethod: String, $description: String) {
    withdraw(amount: $amount, paymentMethod: $paymentMethod, description: $description) {
      transaction_id
      user_id
      amount
      type
      status
      date
    }
  }
`;

const TRANSFER = gql`
  mutation Transfer($receiverId: Int!, $amount: Float!, $description: String) {
    transfer(receiverId: $receiverId, amount: $amount, description: $description) {
      transaction_id
      user_id
      amount
      type
      receiver_id
      status
      date
    }
  }
`;

/**
 * Transaction Service Page
 * Fitur: Top Up, Withdraw, Transfer, Transaction History
 */
function Transactions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deposit');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bank_transfer');
  const [depositDescription, setDepositDescription] = useState('');

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [withdrawDescription, setWithdrawDescription] = useState('');

  // Transfer form
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [transferDescription, setTransferDescription] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_MY_TRANSACTIONS, {
    client: transactionClient,
    variables: { limit: 20, offset: 0 },
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

  const [deposit] = useMutation(DEPOSIT, {
    client: transactionClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Deposit successful! Balance updated.' });
      setDepositAmount('');
      setDepositDescription('');
      refetch();
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.message });
    }
  });

  const [withdraw] = useMutation(WITHDRAW, {
    client: transactionClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Withdraw successful! Balance updated.' });
      setWithdrawAmount('');
      setWithdrawDescription('');
      refetch();
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.message });
    }
  });

  const [transfer] = useMutation(TRANSFER, {
    client: transactionClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    },
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Transfer successful! Balance updated.' });
      setTransferAmount('');
      setReceiverId('');
      setTransferDescription('');
      refetch();
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.message });
    }
  });

  React.useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    deposit({
      variables: {
        amount: parseFloat(depositAmount),
        paymentMethod: depositMethod,
        description: depositDescription || 'Top up deposit'
      }
    });
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    withdraw({
      variables: {
        amount: parseFloat(withdrawAmount),
        paymentMethod: withdrawMethod,
        description: withdrawDescription || 'Withdraw from wallet'
      }
    });
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    if (!receiverId || parseInt(receiverId) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid receiver ID' });
      return;
    }
    transfer({
      variables: {
        receiverId: parseInt(receiverId),
        amount: parseFloat(transferAmount),
        description: transferDescription || `Transfer to user ${receiverId}`
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '💸';
      case 'transfer': return '🔄';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return '#4caf50';
      case 'withdraw': return '#f44336';
      case 'transfer': return '#2196f3';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="transactions-container">
          <div className="loading">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Transactions</h1>
          <p className="subtitle">Top up, withdraw, transfer, and view history</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            💰 Top Up
          </button>
          <button
            className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            💸 Withdraw
          </button>
          <button
            className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            🔄 Transfer
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="transaction-section">
            <h2>Top Up / Deposit</h2>
            <p className="section-description">Add balance to your wallet</p>
            
            <form onSubmit={handleDeposit} className="transaction-form">
              <div className="form-group">
                <label>Amount (Rp)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  placeholder="Transaction description"
                />
              </div>

              <button type="submit" className="submit-button deposit-button">
                Top Up Now
              </button>
            </form>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="transaction-section">
            <h2>Withdraw</h2>
            <p className="section-description">Withdraw balance from your wallet</p>
            
            <form onSubmit={handleWithdraw} className="transaction-form">
              <div className="form-group">
                <label>Amount (Rp)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="e_wallet">E-Wallet</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={withdrawDescription}
                  onChange={(e) => setWithdrawDescription(e.target.value)}
                  placeholder="Transaction description"
                />
              </div>

              <button type="submit" className="submit-button withdraw-button">
                Withdraw Now
              </button>
            </form>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div className="transaction-section">
            <h2>Transfer</h2>
            <p className="section-description">Transfer balance to another user</p>
            
            <form onSubmit={handleTransfer} className="transaction-form">
              <div className="form-group">
                <label>Receiver User ID</label>
                <input
                  type="number"
                  min="1"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  placeholder="Enter receiver user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (Rp)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                  placeholder="Transaction description"
                />
              </div>

              <button type="submit" className="submit-button transfer-button">
                Transfer Now
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="transaction-section">
            <h2>Transaction History</h2>
            <p className="section-description">View all your transactions</p>
            
            {error && (
              <div className="error-display">
                Error loading transactions: {error.message}
              </div>
            )}

            {data?.myTransactions && data.myTransactions.length > 0 ? (
              <div className="transactions-list">
                {data.myTransactions.map((tx) => (
                  <div key={tx.transaction_id} className="transaction-item">
                    <div className="transaction-icon" style={{ color: getTypeColor(tx.type) }}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-header">
                        <h4>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</h4>
                        <span className={`status-badge ${tx.status}`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="transaction-amount" style={{ color: getTypeColor(tx.type) }}>
                        {tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver_id) ? '+' : '-'}
                        Rp {parseFloat(tx.amount).toLocaleString('id-ID')}
                      </p>
                      {tx.description && (
                        <p className="transaction-description">{tx.description}</p>
                      )}
                      {tx.receiver_id && (
                        <p className="transaction-receiver">To User ID: {tx.receiver_id}</p>
                      )}
                      <p className="transaction-date">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No transactions yet</p>
                <p className="empty-hint">Start by making a deposit or transfer!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;

