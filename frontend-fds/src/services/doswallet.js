/**
 * DOSWALLET Payment Service Client
 * Handles server-to-server communication with DOSWALLET Transaction Service
 */

const DOSWALLET_GRAPHQL_URL = import.meta.env.VITE_DOSWALLET_URL || 'http://localhost:5003/graphql';
const PAYMENT_TIMEOUT = 5000; // 5 seconds timeout

/**
 * Process payment through DOSWALLET
 * @param {string} nim - User NIM/Email identifier
 * @param {number} amount - Payment amount
 * @returns {Promise<{status: string, trxId?: string, balanceRemaining?: number, message?: string}>}
 */
export async function processPayment(nim, amount) {
  const mutation = `
    mutation Pay($nim: String!, $amount: Float!) {
      pay(nim: $nim, amount: $amount) {
        status
        trxId
        balanceRemaining
        message
      }
    }
  `;

  const variables = {
    nim: nim,
    amount: parseFloat(amount)
  };

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Payment request timeout. DOSWALLET service did not respond within 5 seconds.'));
    }, PAYMENT_TIMEOUT);
  });

  // Create payment request promise
  const paymentPromise = fetch(DOSWALLET_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: variables
    })
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Payment processing error');
    }
    
    return result.data.pay;
  });

  // Race between payment and timeout
  try {
    const result = await Promise.race([paymentPromise, timeoutPromise]);
    return result;
  } catch (error) {
    // Return FAILED status for timeout or network errors
    return {
      status: 'FAILED',
      trxId: null,
      balanceRemaining: null,
      message: error.message || 'Payment service unavailable'
    };
  }
}

/**
 * Validate payment amount
 * @param {number} amount 
 * @returns {boolean}
 */
export function validateAmount(amount) {
  return amount > 0 && !isNaN(amount) && isFinite(amount);
}

