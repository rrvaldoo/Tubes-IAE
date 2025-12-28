import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

/**
 * Order Confirmation Page
 * Shows order details after successful payment
 */
function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-container">
          <h2>Order Not Found</h2>
          <button onClick={() => navigate('/checkout')}>Back to Checkout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        {order.paymentStatus === 'PAID' ? (
          <>
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p className="success-message">Your order has been confirmed and will be processed.</p>
          </>
        ) : (
          <>
            <div className="error-icon">✗</div>
            <h1>Payment Failed</h1>
            <p className="error-message">Your order has been cancelled due to payment failure.</p>
          </>
        )}

        <div className="order-details">
          <h2>Order Details</h2>
          <div className="detail-row">
            <span>Order ID:</span>
            <span>{order.orderId}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
          <div className="detail-row">
            <span>Payment Status:</span>
            <span className={`status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
          </div>
          {order.trxId && (
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span>{order.trxId}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Total Amount:</span>
            <span className="amount">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="detail-row">
            <span>Order Date:</span>
            <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="order-items">
          <h3>Order Items</h3>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <span>{item.name} x{item.quantity}</span>
              <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={() => navigate('/checkout')}>Place New Order</button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;

