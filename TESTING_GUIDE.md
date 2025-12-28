# 🧪 DOSWALLET Testing Guide

Panduan lengkap untuk testing backend dan frontend DOSWALLET.

## ✅ Status Testing

### Backend Services (Docker)
Semua backend services sudah berjalan:
- ✅ User Service: http://localhost:5001/graphql
- ✅ Wallet Service: http://localhost:5002/graphql
- ✅ Transaction Service: http://localhost:5003/graphql
- ✅ Notification Service: http://localhost:5004/graphql

### Frontend
- ⚠️ Frontend Web: http://localhost:3000 (Jalankan dengan `cd frontend-web; npm run dev`)

## 🚀 Quick Test Script

Jalankan script testing otomatis:
```powershell
powershell -ExecutionPolicy Bypass -File .\test_doswallet.ps1
```

## 📋 Manual Testing Steps

### 1. Test Backend Services

#### 1.1 Test User Service (Register & Login)

**Buka:** http://localhost:5001/graphql

**Register User Baru:**
```graphql
mutation {
  register(input: {
    name: "Test User"
    email: "test@example.com"
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

**Login:**
```graphql
mutation {
  login(input: {
    email: "test@example.com"
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

**Get Current User (dengan token):**
```graphql
query {
  me {
    user_id
    name
    email
    phone
  }
}
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

#### 1.2 Test Wallet Service

**Buka:** http://localhost:5002/graphql

**Get Wallet Balance (dengan token):**
```graphql
query {
  myWallet {
    wallet_id
    balance
    points
  }
}
```

**Deposit (dengan token):**
```graphql
mutation {
  deposit(
    amount: 100000.0
    paymentMethod: "manual"
    description: "Initial deposit"
  ) {
    transaction_id
    amount
    status
    description
    date
  }
}
```

**Withdraw (dengan token):**
```graphql
mutation {
  withdraw(
    amount: 50000.0
    description: "Withdrawal test"
  ) {
    transaction_id
    amount
    status
    description
    date
  }
}
```

#### 1.3 Test Transaction Service

**Buka:** http://localhost:5003/graphql

**Transfer (dengan token):**
```graphql
mutation {
  transfer(input: {
    recipientEmail: "recipient@example.com"
    amount: 25000.0
    description: "Test transfer"
  }) {
    transaction_id
    amount
    status
    type
    description
    date
  }
}
```

**Get Transaction History (dengan token):**
```graphql
query {
  myTransactions(limit: 10) {
    transaction_id
    amount
    type
    status
    description
    date
  }
}
```

**Get Single Transaction (dengan token):**
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

#### 1.4 Test Notification Service

**Buka:** http://localhost:5004/graphql

**Get Notifications (dengan token):**
```graphql
query {
  myNotifications(limit: 10) {
    notification_id
    title
    message
    type
    is_read
    date
  }
}
```

**Mark as Read (dengan token):**
```graphql
mutation {
  markAsRead(notificationId: 1) {
    notification_id
    is_read
    message
  }
}
```

**Get Unread Count (dengan token):**
```graphql
query {
  unreadCount
}
```

### 2. Test Frontend Web

#### 2.1 Start Frontend

```powershell
cd frontend-web
npm run dev
```

Frontend akan berjalan di: http://localhost:3000

#### 2.2 Test Flow

1. **Register/Login**
   - Buka http://localhost:3000
   - Register user baru atau login dengan user yang sudah ada
   - Verifikasi token tersimpan di localStorage

2. **Dashboard**
   - Setelah login, harus redirect ke dashboard
   - Cek apakah balance dan points ditampilkan

3. **Wallet**
   - Navigate ke halaman Wallet
   - Cek balance dan points
   - Test deposit (jika ada form)

4. **Transactions**
   - Navigate ke halaman Transactions
   - Cek transaction history
   - Verifikasi semua transaksi ditampilkan

5. **Transfer**
   - Test transfer ke user lain
   - Verifikasi balance berkurang
   - Cek transaction history update

## 🔍 Verification Checklist

### Backend Verification

- [ ] User Service dapat register user baru
- [ ] User Service dapat login dan return token
- [ ] Wallet Service dapat get balance
- [ ] Wallet Service dapat deposit
- [ ] Wallet Service dapat withdraw
- [ ] Transaction Service dapat transfer
- [ ] Transaction Service dapat get history
- [ ] Notification Service dapat get notifications
- [ ] Semua service menggunakan JWT authentication dengan benar

### Frontend Verification

- [ ] Frontend dapat connect ke backend services
- [ ] Register/Login berfungsi
- [ ] Token tersimpan di localStorage
- [ ] Dashboard menampilkan data user
- [ ] Wallet menampilkan balance dan points
- [ ] Transaction history ditampilkan
- [ ] Transfer berfungsi
- [ ] Error handling bekerja dengan baik

## 🐛 Troubleshooting

### Backend Issues

**Problem: Service tidak bisa connect ke database**
```powershell
# Cek Docker container status
docker ps

# Cek logs
docker logs doswallet-mysql
docker logs doswallet-user-service
```

**Problem: Port sudah digunakan**
- Stop service yang menggunakan port tersebut
- Atau ubah port di docker-compose.yml

**Problem: CORS error**
- Pastikan CORS_ORIGINS di environment variable sudah di-set ke "*" atau origin frontend

### Frontend Issues

**Problem: Cannot connect to backend**
- Pastikan semua backend services berjalan
- Cek URL di `frontend-web/src/services/apollo.js`
- Cek browser console untuk error details

**Problem: Authentication error**
- Pastikan token tersimpan di localStorage
- Cek apakah token masih valid
- Coba login ulang

**Problem: GraphQL errors**
- Buka GraphQL Playground dan test query langsung
- Cek network tab di browser untuk melihat request/response
- Verifikasi headers Authorization sudah terkirim

## 📊 Expected Results

### Register Response
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "user_id": 1,
        "name": "Test User",
        "email": "test@example.com",
        "phone": "081234567890"
      },
      "message": "User registered successfully"
    }
  }
}
```

### Wallet Balance Response
```json
{
  "data": {
    "myWallet": {
      "wallet_id": 1,
      "balance": 100000.0,
      "points": 0
    }
  }
}
```

### Transaction History Response
```json
{
  "data": {
    "myTransactions": [
      {
        "transaction_id": 1,
        "amount": 100000.0,
        "type": "DEPOSIT",
        "status": "COMPLETED",
        "description": "Initial deposit",
        "date": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

## 🎯 Next Steps

Setelah semua test passed:
1. Test integration dengan Food Delivery System (jika ada)
2. Test error scenarios (insufficient balance, invalid user, dll)
3. Test performance dengan multiple concurrent requests
4. Test security (unauthorized access, token expiration, dll)

## 📝 Notes

- Simpan token dari register/login untuk testing endpoint yang memerlukan authentication
- Gunakan GraphQL Playground untuk testing manual yang lebih mudah
- Check browser console dan network tab untuk debugging frontend issues
- Check Docker logs untuk debugging backend issues

Selamat testing! 🚀

