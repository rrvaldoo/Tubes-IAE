import React, { useState } from 'react';
import { processOrderPayment, createOrder, calculateTotal } from '../services/orderService';
import './PaymentForm.css';

/**
 * Payment Form Component for Food Delivery System
 * Handles order checkout and payment processing through DOSWALLET
 */
function PaymentForm({ userId, nim, onPaymentComplete }) {
  const [items, setItems] = useState([
    { id: 1, name: 'Nasi Goreng', price: 25000, quantity: 1 },
    { id: 2, name: 'Es Teh Manis', price: 5000, quantity: 1 }
  ]);
  const [deliveryFee] = useState(10000);
  const [restaurantId] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [order, setOrder] = useState(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = calculateTotal(items, deliveryFee);

  const handleQuantityChange = (itemId, delta) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (!nim) {
      alert('NIM/Email is required for payment');
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      // Create order
      const newOrder = createOrder({
        userId: userId,
        nim: nim,
        items: items.filter(item => item.quantity > 0),
        restaurantId: restaurantId,
        deliveryFee: deliveryFee
      });

      setOrder(newOrder);

      // Process payment through DOSWALLET
      const result = await processOrderPayment(newOrder.orderId);

      setPaymentResult(result);
      setOrder(result.order);

      if (result.success) {
        // Payment successful
        if (onPaymentComplete) {
          onPaymentComplete(result.order);
        }
      } else {
        // Payment failed - order automatically cancelled
        alert(`Payment failed: ${result.message}`);
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        message: error.message || 'An error occurred during payment'
      });
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <h2>Checkout - Food Delivery</h2>
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="items-list">
          {items.filter(item => item.quantity > 0).map(item => (
            <div key={item.id} className="order-item">
              <span className="item-name">{item.name}</span>
              <div className="item-controls">
                <button 
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={isProcessing}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, 1)}
                  disabled={isProcessing}
                >
                  +
                </button>
              </div>
              <span className="item-price">
                Rp {item.price.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        <div className="price-breakdown">
          <div className="price-row">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="price-row">
            <span>Tax (11%):</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="price-row">
            <span>Delivery Fee:</span>
            <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="price-row total">
            <span>Total:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="payment-info">
        <p><strong>NIM/Email:</strong> {nim || 'Not set'}</p>
        <p className="info-text">
          Payment will be processed through DOSWALLET. 
          Order will be cancelled if payment fails or timeout (5 seconds).
        </p>
      </div>

      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={isProcessing || !nim || items.filter(item => item.quantity > 0).length === 0}
      >
        {isProcessing ? 'Processing Payment...' : 'Pay with DOSWALLET'}
      </button>

      {paymentResult && (
        <div className={`payment-result ${paymentResult.success ? 'success' : 'failed'}`}>
          <h4>Payment Result</h4>
          <p><strong>Status:</strong> {paymentResult.paymentResult?.status || paymentResult.message}</p>
          {paymentResult.paymentResult?.trxId && (
            <p><strong>Transaction ID:</strong> {paymentResult.paymentResult.trxId}</p>
          )}
          {paymentResult.paymentResult?.balanceRemaining !== null && paymentResult.paymentResult?.balanceRemaining !== undefined && (
            <p><strong>Remaining Balance:</strong> Rp {paymentResult.paymentResult.balanceRemaining.toLocaleString('id-ID')}</p>
          )}
          {paymentResult.paymentResult?.message && (
            <p><strong>Message:</strong> {paymentResult.paymentResult.message}</p>
          )}
        </div>
      )}

      {order && (
        <div className="order-info">
          <h4>Order Information</h4>
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          {order.trxId && <p><strong>Transaction ID:</strong> {order.trxId}</p>}
        </div>
      )}
    </div>
  );
}

export default PaymentForm;

