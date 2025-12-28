/**
 * Order Service - Handles order management and payment integration
 * Integrates with DOSWALLET Payment Service and manages order lifecycle
 */

import { processPayment } from './doswallet';

// Mock order storage (in real app, this would be API calls to Order Service backend)
let orders = [];
let orderIdCounter = 1;

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Object} Created order
 */
export function createOrder(orderData) {
  const order = {
    orderId: orderIdCounter++,
    userId: orderData.userId,
    nim: orderData.nim,
    items: orderData.items,
    restaurantId: orderData.restaurantId,
    totalAmount: calculateTotal(orderData.items, orderData.deliveryFee || 0),
    deliveryFee: orderData.deliveryFee || 0,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    paymentStatus: 'UNPAID',
    trxId: null
  };
  
  orders.push(order);
  return order;
}

/**
 * Calculate total order amount (items + tax + delivery fee)
 * @param {Array} items - Order items
 * @param {number} deliveryFee - Delivery fee
 * @returns {number} Total amount
 */
export function calculateTotal(items, deliveryFee = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // 11% tax
  return subtotal + tax + deliveryFee;
}

/**
 * Process order payment through DOSWALLET
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment result
 */
export async function processOrderPayment(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    return {
      success: true,
      message: 'Order already paid',
      order: order
    };
  }

  if (order.status === 'CANCELLED') {
    return {
      success: false,
      message: 'Order has been cancelled',
      order: order
    };
  }

  // Update order status to PROCESSING
  order.status = 'PROCESSING';

  try {
    // Call DOSWALLET Payment Service
    const paymentResult = await processPayment(order.nim, order.totalAmount);

    if (paymentResult.status === 'SUCCESS') {
      // Payment successful - update order
      order.paymentStatus = 'PAID';
      order.status = 'PAID';
      order.trxId = paymentResult.trxId;
      
      // In real implementation, this would trigger:
      // 1. Save to Payment Log FDS
      // 2. Call Order Service to update status
      // 3. Reduce stock in Restaurant Service
      // 4. Forward to Driver Service
      
      return {
        success: true,
        message: 'Payment successful',
        order: order,
        paymentResult: paymentResult
      };
    } else {
      // Payment failed - cancel order
      order.status = 'CANCELLED';
      order.paymentStatus = 'FAILED';
      
      return {
        success: false,
        message: paymentResult.message || 'Payment failed',
        order: order,
        paymentResult: paymentResult
      };
    }
  } catch (error) {
    // Network error or timeout - cancel order
    order.status = 'CANCELLED';
    order.paymentStatus = 'FAILED';
    
    return {
      success: false,
      message: error.message || 'Payment service unavailable',
      order: order
    };
  }
}

/**
 * Get order by ID
 * @param {number} orderId 
 * @returns {Object|null}
 */
export function getOrder(orderId) {
  return orders.find(o => o.orderId === orderId) || null;
}

/**
 * Get all orders for a user
 * @param {string} userId 
 * @returns {Array}
 */
export function getUserOrders(userId) {
  return orders.filter(o => o.userId === userId);
}

/**
 * Cancel order (if not paid)
 * @param {number} orderId 
 * @returns {boolean}
 */
export function cancelOrder(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (order && order.paymentStatus !== 'PAID') {
    order.status = 'CANCELLED';
    return true;
  }
  return false;
}

