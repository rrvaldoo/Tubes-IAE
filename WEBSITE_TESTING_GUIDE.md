# 🌐 Website Testing Guide - DOSWALLET x Food Delivery System

## 🎯 Testing Flow

### Scenario 1: Test Payment Integration (Food Delivery System)

#### Step 1: Buka Food Delivery System
```
URL: http://localhost:3001/checkout
```

#### Step 2: Setup User di DOSWALLET (jika belum ada)

**Buka DOSWALLET GraphQL:** `http://localhost:5001/graphql`

**Register user baru:**
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
    }
    message
  }
}
```

**Deposit saldo ke wallet:**
Buka: `http://localhost:5002/graphql`

```graphql
mutation {
  deposit(amount: 100000.0, paymentMethod: "manual", description: "Initial deposit") {
    transaction_id
    amount
    status
  }
}
```

**⚠️ PENTING:** Butuh token untuk deposit. Copy token dari register/login, lalu:
1. Klik "Docs" di GraphiQL
2. Tambahkan header:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

#### Step 3: Test Payment di Food Delivery System

1. **Buka:** `http://localhost:3001/checkout`
2. **Input NIM/Email:** Gunakan email yang sama dengan DOSWALLET (misal: `john@example.com`)
3. **Add items** ke cart (gunakan tombol +/-)
4. **Klik "Pay with DOSWALLET"**
5. **Verifikasi hasil:**
   - ✅ **SUCCESS:** Order status → PAID, Transaction ID muncul
   - ❌ **FAILED:** Order status → CANCELLED, pesan error muncul

### Scenario 2: Test dengan Saldo Tidak Cukup

1. **Pastikan saldo kurang** dari total order
2. **Lakukan checkout** seperti biasa
3. **Expected:** Payment FAILED dengan message "Insufficient Balance"
4. **Order otomatis CANCELLED**

### Scenario 3: Test Timeout (Simulasi)

1. **Stop Transaction Service** sementara:
   ```bash
   # Cari process dan stop
   # Atau matikan service di terminal
   ```
2. **Lakukan checkout** di FDS
3. **Expected:** Timeout setelah 5 detik, order CANCELLED

### Scenario 4: Test DOSWALLET Web App

**Buka:** `http://localhost:3000`

1. **Register/Login** dengan user yang sama
2. **Cek Wallet Balance** - harus sesuai dengan deposit/transaksi
3. **Cek Transaction History** - harus ada record payment dari FDS
4. **Cek Notifications** - harus ada notifikasi payment

## 📋 Checklist Testing

### Pre-Testing Setup
- [ ] MySQL Docker running
- [ ] All backend services running (ports 5001-5004)
- [ ] Frontend FDS running (port 3001)
- [ ] Frontend DOSWALLET Web running (port 3000)
- [ ] User terdaftar di DOSWALLET
- [ ] User memiliki saldo di wallet

### Test Cases

#### ✅ Test Case 1: Payment Success
- [ ] User dengan saldo cukup
- [ ] Payment berhasil
- [ ] Order status → PAID
- [ ] Transaction ID tersimpan
- [ ] Saldo berkurang sesuai amount
- [ ] Notification terkirim

#### ❌ Test Case 2: Payment Failed - Insufficient Balance
- [ ] User dengan saldo kurang
- [ ] Payment gagal
- [ ] Order status → CANCELLED
- [ ] Message: "Insufficient Balance"
- [ ] Saldo tidak berubah

#### ❌ Test Case 3: Payment Failed - User Not Found
- [ ] Input NIM/Email yang tidak terdaftar
- [ ] Payment gagal
- [ ] Message: "User not found"
- [ ] Order status → CANCELLED

#### ⏱️ Test Case 4: Payment Timeout
- [ ] Stop Transaction Service
- [ ] Lakukan checkout
- [ ] Timeout setelah 5 detik
- [ ] Order status → CANCELLED
- [ ] Message: "Payment service unavailable"

## 🔍 Verifikasi Data

### Cek di Database (Optional)

**Connect ke MySQL Docker:**
```bash
docker exec -it doswallet-mysql mysql -u doswallet_user -pdoswallet123 doswallet
```

**Query untuk verifikasi:**
```sql
-- Cek user
SELECT * FROM users;

-- Cek wallet
SELECT * FROM wallets;

-- Cek transactions
SELECT * FROM transactions ORDER BY date DESC LIMIT 10;

-- Cek notifications
SELECT * FROM notifications ORDER BY date DESC LIMIT 10;
```

### Cek di GraphQL

**Transaction Service:** `http://localhost:5003/graphql`

```graphql
query {
  transaction(transactionId: 1) {
    transaction_id
    user_id
    amount
    type
    status
    description
    date
  }
}
```

## 🐛 Troubleshooting

### Problem: Frontend tidak bisa connect ke backend

**Cek:**
1. Backend services running? `http://localhost:5003/health`
2. CORS settings di backend
3. Browser console untuk error messages

### Problem: Payment selalu FAILED

**Cek:**
1. User terdaftar di DOSWALLET?
2. Email/NIM match dengan DOSWALLET?
3. Saldo cukup?
4. Backend logs untuk error details

### Problem: Timeout tidak bekerja

**Cek:**
1. Timeout setting di `frontend-fds/src/services/doswallet.js`
2. Network tab di browser untuk melihat request duration

## 📊 Expected Results

### Payment Success Response
```json
{
  "status": "SUCCESS",
  "trxId": "123",
  "balanceRemaining": 50000.0,
  "message": null
}
```

### Payment Failed Response
```json
{
  "status": "FAILED",
  "trxId": null,
  "balanceRemaining": 30000.0,
  "message": "Insufficient Balance"
}
```

## 🎯 Quick Test Script

1. **Setup User & Saldo** (5 menit)
   - Register di DOSWALLET
   - Deposit saldo

2. **Test Payment Success** (2 menit)
   - Checkout di FDS
   - Verify payment success

3. **Test Payment Failed** (2 menit)
   - Kurangi saldo atau gunakan amount besar
   - Verify payment failed

4. **Verify di DOSWALLET** (2 menit)
   - Cek transaction history
   - Cek notifications
   - Cek balance update

## ✅ Success Criteria

- ✅ Payment integration berfungsi
- ✅ Order status update sesuai payment result
- ✅ Transaction recorded di database
- ✅ Notification terkirim
- ✅ Timeout handling bekerja
- ✅ Error handling proper

Selamat testing! 🚀

