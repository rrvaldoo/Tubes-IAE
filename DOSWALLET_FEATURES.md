# 🎯 DOSWALLET - Daftar Fitur Lengkap

## 📋 Overview

DOSWALLET adalah sistem e-wallet dengan integrasi payment gateway untuk Food Delivery System. Berikut adalah daftar lengkap semua fitur yang tersedia.

---

## 🔐 1. User Service - Authentication & User Management

### ✅ Fitur yang Tersedia

#### **Register (Pendaftaran)**
- **Endpoint:** `http://localhost:5001/graphql`
- **Mutation:** `register`
- **Fitur:**
  - Validasi email unik
  - Validasi phone unik
  - Password hashing dengan bcrypt
  - Auto-generate JWT token
  - Auto-create wallet untuk user baru

**Contoh Query:**
```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    phone: "081234567890"
    password: "password123"
  }) {
    token
    user {
      user_id
      name
      email
      phone
    }
    message
  }
}
```

#### **Login**
- **Mutation:** `login`
- **Fitur:**
  - Login dengan email atau phone number
  - Password verification
  - JWT token generation
  - Session management

**Contoh Query:**
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "password123"
  }) {
    token
    user {
      user_id
      name
      email
    }
    message
  }
}
```

#### **Get Current User**
- **Query:** `me`
- **Requires:** Authentication token
- **Returns:** Current logged-in user info

#### **Get User by ID**
- **Query:** `user(userId: Int!)`
- **Returns:** User information by ID

---

## 💰 2. Wallet Service - Balance & Points Management

### ✅ Fitur yang Tersedia

#### **Get Wallet**
- **Endpoint:** `http://localhost:5002/graphql`
- **Query:** `myWallet`
- **Requires:** Authentication token
- **Returns:** Balance, points, wallet info
- **Auto-create:** Wallet dibuat otomatis jika belum ada

**Contoh Query:**
```graphql
query {
  myWallet {
    wallet_id
    user_id
    balance
    points
    created_at
    updated_at
  }
}
```

#### **Update Balance**
- **Mutation:** `updateBalance`
- **Fitur:**
  - Menambah balance (`operation: "add"`)
  - Mengurangi balance (`operation: "subtract"`)
  - Atomic operation
  - Auto-create wallet jika belum ada

**Contoh Query:**
```graphql
mutation {
  updateBalance(amount: 50000.0, operation: "add") {
    balance
    points
  }
}
```

**Penggunaan:**
- ✅ **Otomatis** saat deposit/top up
- ✅ **Otomatis** saat payment/withdraw
- ✅ **Otomatis** saat transfer
- ✅ **Manual** untuk admin adjustments

#### **Update Points**
- **Mutation:** `updatePoints`
- **Fitur:**
  - Menambah points (`operation: "add"`)
  - Mengurangi points (`operation: "subtract"`)
  - Atomic operation
  - Auto-create wallet jika belum ada

**Contoh Query:**
```graphql
mutation {
  updatePoints(points: 10, operation: "add") {
    balance
    points
  }
}
```

**Penggunaan:**
- ✅ **Otomatis** saat payment berhasil (reward system)
- ✅ **Manual** untuk admin adjustments
- ✅ **Manual** untuk redeem points (diskon)

#### **Reward Points System**
- **Rule:** 1 point = Rp 10,000 yang dibelanjakan
- **Auto-add:** Points otomatis ditambahkan saat payment berhasil
- **Contoh:**
  - Payment Rp 50,000 → Dapat 5 points
  - Payment Rp 25,000 → Dapat 2 points
  - Payment Rp 5,000 → Dapat 0 points (minimum Rp 10,000)

---

## 💳 3. Transaction Service - Transactions & Payment

### ✅ Fitur yang Tersedia

#### **Top Up / Deposit**
- **Endpoint:** `http://localhost:5003/graphql`
- **Mutation:** `deposit`
- **Fitur:**
  - Menambah saldo ke wallet
  - Atomic operation (balance update + transaction record)
  - Idempotency support
  - Auto-create wallet jika belum ada
  - **Balance otomatis update**

**Contoh Query:**
```graphql
mutation {
  deposit(
    amount: 100000.0
    paymentMethod: "bank_transfer"
    description: "Top up via bank transfer"
  ) {
    transaction_id
    user_id
    amount
    type
    status
    date
  }
}
```

**Flow:**
1. User request deposit
2. Transaction record created
3. **Balance otomatis bertambah**
4. Status: `completed`

#### **Withdraw**
- **Mutation:** `withdraw`
- **Fitur:**
  - Mengurangi saldo dari wallet
  - Balance validation (cek saldo cukup)
  - Atomic operation
  - **Balance otomatis berkurang**

**Contoh Query:**
```graphql
mutation {
  withdraw(
    amount: 50000.0
    paymentMethod: "bank_transfer"
    description: "Withdraw to bank"
  ) {
    transaction_id
    amount
    status
  }
}
```

#### **Transfer**
- **Mutation:** `transfer`
- **Fitur:**
  - Transfer saldo ke user lain
  - Balance validation
  - Atomic operation (sender & receiver)
  - **Balance otomatis update untuk kedua user**

**Contoh Query:**
```graphql
mutation {
  transfer(
    receiverId: 2
    amount: 25000.0
    description: "Transfer to friend"
  ) {
    transaction_id
    amount
    receiver_id
    status
  }
}
```

#### **Payment to Food Delivery System** ⭐
- **Mutation:** `pay`
- **Fitur:**
  - Server-to-server payment
  - Tidak perlu authentication (external system)
  - Atomic balance check & debit
  - **Balance otomatis berkurang**
  - **Points otomatis bertambah** (reward system)
  - Transaction logging
  - Notification otomatis

**Contoh Query (dari FDS):**
```graphql
mutation {
  pay(nim: "john@example.com", amount: 50000.0) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

**Flow:**
1. FDS memanggil mutation `pay`
2. DOSWALLET cek saldo user
3. Jika cukup:
   - Debit balance
   - **Tambah points** (1 point per Rp 10,000)
   - Create transaction record
   - Send notification
   - Return SUCCESS dengan trxId
4. Jika tidak cukup:
   - Return FAILED dengan message
   - Balance tidak berubah

#### **Transaction History**
- **Query:** `myTransactions`
- **Returns:** List semua transaksi user
- **Filter:** By type, limit, offset

**Contoh Query:**
```graphql
query {
  myTransactions(limit: 10, offset: 0) {
    transaction_id
    amount
    type
    status
    description
    date
  }
}
```

---

## 🔔 4. Notification Service

### ✅ Fitur yang Tersedia

#### **Get Notifications**
- **Endpoint:** `http://localhost:5004/graphql`
- **Query:** `myNotifications`
- **Returns:** List notifications untuk user

#### **Auto Notifications**
- ✅ Payment success notification
- ✅ Payment failed notification
- ✅ Deposit/withdraw notifications
- ✅ Transfer notifications

---

## 🔄 Balance Update - Automatic Flow

### Kapan Balance Otomatis Update?

| Action | Balance Change | Points Change | Service |
|--------|---------------|---------------|---------|
| **Deposit/Top Up** | ✅ +Amount | ❌ No | Transaction Service |
| **Withdraw** | ✅ -Amount | ❌ No | Transaction Service |
| **Transfer (Sender)** | ✅ -Amount | ❌ No | Transaction Service |
| **Transfer (Receiver)** | ✅ +Amount | ❌ No | Transaction Service |
| **Payment to FDS** | ✅ -Amount | ✅ +Points | Transaction Service |
| **Manual Update** | ✅ Custom | ✅ Custom | Wallet Service |

### Kapan Points Otomatis Update?

| Action | Points Change | Rule |
|--------|---------------|------|
| **Payment Success** | ✅ +Points | 1 point per Rp 10,000 |
| **Manual Update** | ✅ Custom | Admin/User action |

---

## 📊 Integrasi dengan Food Delivery System

### Payment Flow

```
Food Delivery System          DOSWALLET Transaction Service
     │                                  │
     │ 1. User Checkout                 │
     │─────────────────────────────────▶│
     │                                  │
     │ 2. Payment Request                │
     │    pay(nim, amount)              │
     │─────────────────────────────────▶│
     │                                  │
     │                                  │ 3. Validate User
     │                                  │ 4. Check Balance
     │                                  │ 5. Debit Balance
     │                                  │ 6. Add Points (reward)
     │                                  │ 7. Create Transaction
     │                                  │ 8. Send Notification
     │                                  │
     │ 9. Response                      │
     │    {status, trxId, balance}      │
     │◀─────────────────────────────────│
     │                                  │
     │ 10. Update Order Status          │
     │     (PAID/CANCELLED)             │
     │                                  │
```

### Data Exchange

| Parameter | Type | Source (FDS) | Target (DOSWALLET) | Result |
|-----------|------|--------------|-------------------|--------|
| `nim` | String | User ID/NIM | User lookup | User found |
| `amount` | Float | Order total | Balance debit | Balance -amount |
| `trxId` | String | - | Transaction ID | Return to FDS |
| `status` | String | - | Payment result | SUCCESS/FAILED |
| `points` | Int | - | Reward calculation | Auto +points |

---

## 🎯 Fitur Summary

### ✅ User Service
- [x] Register
- [x] Login (email/phone)
- [x] Get current user
- [x] Get user by ID

### ✅ Wallet Service
- [x] Get wallet (balance & points)
- [x] Update balance (manual)
- [x] Update points (manual)
- [x] Auto-create wallet

### ✅ Transaction Service
- [x] Deposit/Top Up (auto update balance)
- [x] Withdraw (auto update balance)
- [x] Transfer (auto update balance both users)
- [x] Payment to FDS (auto update balance + points)
- [x] Transaction history
- [x] Reward points system

### ✅ Notification Service
- [x] Get notifications
- [x] Auto notifications (payment, deposit, etc.)

---

## 🔧 API Endpoints

| Service | Endpoint | Port |
|---------|----------|------|
| User Service | `http://localhost:5001/graphql` | 5001 |
| Wallet Service | `http://localhost:5002/graphql` | 5002 |
| Transaction Service | `http://localhost:5003/graphql` | 5003 |
| Notification Service | `http://localhost:5004/graphql` | 5004 |

---

## 📝 Notes

1. **Balance Update:** Semua balance update dilakukan secara **atomic** untuk mencegah race condition
2. **Points Reward:** Points hanya ditambahkan saat **payment berhasil**, bukan saat deposit
3. **Auto Wallet:** Wallet otomatis dibuat saat user register atau pertama kali akses
4. **Transaction Logging:** Semua transaksi dicatat untuk audit trail
5. **Notifications:** Notifikasi otomatis untuk semua transaksi penting

---

## ✅ Semua Fitur Sudah Tersedia!

Semua fitur yang diminta sudah diimplementasikan dan siap digunakan! 🎉

