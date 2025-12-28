import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import { walletClient, transactionClient } from '../services/apollo'
import './Dashboard.css'

const GET_WALLET = gql`
  query {
    my_wallet {
      balance
      points
    }
  }
`

const GET_RECENT_TRANSACTIONS = gql`
  query {
    myTransactions(limit: 5) {
      transaction_id
      amount
      type
      date
      description
      status
    }
  }
`

export default function Dashboard(){
  const navigate = useNavigate()
  const [user, setUser] = useState({name:'User'})

  useEffect(()=>{
    const u = localStorage.getItem('user')
    if(u) setUser(JSON.parse(u))
  },[])

  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useQuery(GET_WALLET, { 
    client: walletClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  });
  
  const { data: transactionData, loading: txLoading, refetch: refetchTx } = useQuery(GET_RECENT_TRANSACTIONS, { 
    client: transactionClient,
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  });

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.name}!</h1>
            <p className="subtitle">DOSWALLET - Your Digital Wallet</p>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <a href="/wallet" className="action-card wallet-card">
            <div className="action-icon">💳</div>
            <div className="action-content">
              <h3>Wallet Management</h3>
              <p>View balance, points & update manually</p>
            </div>
            <div className="action-arrow">→</div>
          </a>
          
          <a href="/transactions" className="action-card transactions-card">
            <div className="action-icon">💸</div>
            <div className="action-content">
              <h3>Transactions</h3>
              <p>Top up, withdraw, transfer & history</p>
            </div>
            <div className="action-arrow">→</div>
          </a>
        </div>

        {/* Wallet Overview - Main Focus */}
        <div className="wallet-overview">
          <h2>💰 Your Wallet</h2>
          <div className="overview-cards">
            <div className="overview-card balance-card">
              <div className="overview-icon">💰</div>
              <div className="overview-details">
                <p className="overview-label">Balance</p>
                <p className="overview-value">
                  {walletLoading ? 'Loading...' : formatCurrency(walletData?.my_wallet?.balance)}
                </p>
              </div>
            </div>

            <div className="overview-card points-card">
              <div className="overview-icon">⭐</div>
              <div className="overview-details">
                <p className="overview-label">Points</p>
                <p className="overview-value">
                  {walletLoading ? '...' : walletData?.my_wallet?.points || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          {txLoading ? (
            <p>Loading transactions...</p>
          ) : !transactionData?.myTransactions?.length ? (
            <div className="empty-state">
              <p>No transactions yet</p>
              <a href="/transactions" className="link-button">Make your first transaction</a>
            </div>
          ) : (
            <div className="transactions-list">
              {transactionData.myTransactions.map(tx => (
                <div key={tx.transaction_id} className="transaction-item">
                  <div className="tx-icon">
                    {tx.type === 'deposit' ? '💰' : tx.type === 'withdraw' ? '💸' : '🔄'}
                  </div>
                  <div className="tx-details">
                    <p className="tx-type">{tx.type?.toUpperCase() || 'TRANSACTION'}</p>
                    <p className="tx-amount">{formatCurrency(tx.amount)}</p>
                    {tx.description && <p className="tx-desc">{tx.description}</p>}
                    <p className="tx-date">
                      {tx.date ? new Date(tx.date).toLocaleString('id-ID') : ''}
                    </p>
                  </div>
                  <div className={`tx-status ${tx.status || 'completed'}`}>
                    {tx.status || 'completed'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>ℹ️ About Your Wallet</h3>
          <ul>
            <li><strong>Balance:</strong> Your available funds for transactions</li>
            <li><strong>Points:</strong> Reward points earned from payments (1 point per Rp 10,000)</li>
            <li><strong>Top Up:</strong> Add funds to your wallet balance</li>
            <li><strong>Withdraw:</strong> Withdraw funds from your wallet</li>
            <li><strong>Transfer:</strong> Send money to other DOSWALLET users</li>
            <li><strong>Transactions:</strong> View complete history of all your wallet activities</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
