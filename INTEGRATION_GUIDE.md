# DOSWALLET x Food Delivery System - Integration Guide

## 📋 Overview

Dokumentasi ini menjelaskan integrasi antara DOSWALLET (Service Provider) dan Food Delivery System (External Consumer) menggunakan GraphQL API.

## 🏗️ Arsitektur

```
Food Delivery System                    DOSWALLET
┌─────────────────────┐              ┌──────────────────┐
│  Payment Service     │              │  Transaction      │
│  (FDS Backend)       │─────────────▶│  Service          │
│                      │  GraphQL     │  (Gateway)        │
│                      │  POST        │                   │
└─────────────────────┘              └──────────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Wallet       │
                                       │ Service      │
                                       │ (Balance     │
                                       │  Check)      │
                                       └──────────────┘
```

## 🔌 API Endpoint

**URL:** `http://doswallet-service-url/graphql`

**Method:** POST (HTTP)

**Content-Type:** application/json

## 📝 GraphQL Schema

### Mutation: pay

```graphql
mutation Pay($nim: String!, $amount: Float!) {
  pay(nim: $nim, amount: $amount) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nim` | String | Yes | User identifier (NIM/Email) |
| `amount` | Float | Yes | Payment amount (total order) |

### Response: PaymentResponse

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | "SUCCESS" or "FAILED" |
| `trxId` | String | Transaction ID (if success) |
| `balanceRemaining` | Float | Remaining balance after payment |
| `message` | String | Error message (if failed) |

## 🔄 Payment Flow

### 1. User Checkout (FDS)
- User membuat pesanan di aplikasi FDS
- Order Service memvalidasi stok restoran
- Payment Service dipanggil untuk proses pembayaran

### 2. Payment Request (FDS → DOSWALLET)
```javascript
// FDS Payment Service calls DOSWALLET
const response = await fetch('http://localhost:5003/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation Pay($nim: String!, $amount: Float!) {
        pay(nim: $nim, amount: $amount) {
          status
          trxId
          balanceRemaining
          message
        }
      }
    `,
    variables: {
      nim: userNim,
      amount: orderTotal
    }
  })
});
```

### 3. Payment Processing (DOSWALLET)
- Transaction Service menerima request
- Validasi user berdasarkan NIM
- Atomic balance check (row locking)
- Debit saldo jika cukup
- Create transaction record
- Send notification to user

### 4. Response Handling (FDS)

**Success Response:**
```json
{
  "data": {
    "pay": {
      "status": "SUCCESS",
      "trxId": "123",
      "balanceRemaining": 45000.0,
      "message": null
    }
  }
}
```

**Failed Response:**
```json
{
  "data": {
    "pay": {
      "status": "FAILED",
      "trxId": null,
      "balanceRemaining": 30000.0,
      "message": "Insufficient Balance"
    }
  }
}
```

### 5. Order Status Update (FDS)

**If SUCCESS:**
- Order status → `PAID`
- Save `trxId` to Payment Log FDS
- Update Order Service: status → `PAID`
- Reduce stock in Restaurant Service
- Forward order to Driver Service

**If FAILED or Timeout:**
- Order status → `CANCELLED`
- Payment status → `FAILED`
- Stock tidak dikurangi
- User mendapat notifikasi kegagalan

## ⏱️ Timeout Handling

FDS harus mengimplementasikan timeout maksimal **5 detik**:

```javascript
const PAYMENT_TIMEOUT = 5000; // 5 seconds

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error('Payment timeout'));
  }, PAYMENT_TIMEOUT);
});

const paymentPromise = fetch(/* ... */);

try {
  const result = await Promise.race([paymentPromise, timeoutPromise]);
  // Handle success
} catch (error) {
  // Handle timeout - cancel order
  order.status = 'CANCELLED';
}
```

## 🔒 Security & Validation

### Constraints

1. **Konsistensi Identitas**: NIM/Email harus sama di FDS dan DOSWALLET
2. **Atomic Check**: DOSWALLET menjamin tidak ada saldo negatif
3. **Prepaid Payment**: Order tidak diteruskan sebelum payment SUCCESS
4. **Error Handling**: Jika DOSWALLET down, FDS anggap transaksi gagal

### Error Scenarios

| Scenario | Response Status | Message |
|----------|----------------|---------|
| User not found | FAILED | "User not found" |
| Insufficient balance | FAILED | "Insufficient Balance" |
| Invalid amount | FAILED | "Amount must be greater than zero" |
| Service timeout | FAILED | "Payment service unavailable" |
| Network error | FAILED | Error message |

## 📊 Data Mapping

| Parameter | Type | Source (FDS) | Target (DOSWALLET) | Description |
|-----------|------|--------------|-------------------|-------------|
| `nim` | String | User ID / NIM | Wallet Service (Lookup) | User identifier |
| `amount` | Float | Order Total | Wallet Service (Debit) | Payment amount |
| `trxId` | String | - | Payment Service (Return) | Transaction ID |
| `status` | String | - | Order Service (Decision) | Order status |

## 🧪 Testing

### Test Payment Success

```graphql
mutation {
  pay(nim: "user@example.com", amount: 50000.0) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

### Test Payment Failure (Insufficient Balance)

```graphql
mutation {
  pay(nim: "user@example.com", amount: 1000000.0) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

### Test User Not Found

```graphql
mutation {
  pay(nim: "nonexistent@example.com", amount: 50000.0) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

## 📁 Implementation Files

### Backend (DOSWALLET)
- `backend/transaction-service/schema.py` - GraphQL schema dengan mutation `pay`
- `backend/transaction-service/models.py` - Method `pay_atomic()` untuk atomic payment

### Frontend (FDS)
- `frontend-fds/src/services/doswallet.js` - DOSWALLET client dengan timeout handling
- `frontend-fds/src/services/orderService.js` - Order management dan payment integration
- `frontend-fds/src/components/PaymentForm.jsx` - UI component untuk payment

## 🚀 Quick Start

1. **Start DOSWALLET Backend:**
   ```bash
   cd backend
   python start_all_services.py
   # atau
   docker-compose up
   ```

2. **Start FDS Frontend:**
   ```bash
   cd frontend-fds
   npm install
   npm run dev
   ```

3. **Test Payment:**
   - Buka `http://localhost:3001/checkout`
   - Input NIM/Email yang terdaftar di DOSWALLET
   - Add items dan checkout
   - Verify payment result

## 📝 Notes

- Payment mutation tidak memerlukan authentication token (server-to-server)
- Semua transaksi dicatat dengan transaction ID untuk audit trail
- Notifikasi otomatis dikirim ke user setelah payment (success/failure)
- Timeout 5 detik sesuai requirement untuk mencegah hanging requests

