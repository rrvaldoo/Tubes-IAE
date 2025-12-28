# 🧪 GraphQL Test Queries - User Service

## ✅ Status Service
- **Endpoint:** `http://localhost:5001/graphql`
- **Status:** ✅ Running & Healthy
- **GraphiQL:** ✅ Accessible

## 📝 Test Queries

### 1. Test Register (Create New User)

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

**Expected Response:**
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
      "message": "Registration successful"
    }
  }
}
```

### 2. Test Login (with Email)

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
      phone
    }
    message
  }
}
```

### 3. Test Login (with Phone)

```graphql
mutation {
  login(input: {
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

### 4. Test Get User by ID

```graphql
query {
  user(userId: 1) {
    user_id
    name
    email
    phone
    created_at
  }
}
```

### 5. Test Get Current User (Requires Token)

**First, copy token dari response login/register, lalu:**

1. Klik tombol **"Docs"** di GraphiQL (kanan atas)
2. Scroll ke bagian **"HTTP HEADERS"** atau cari field untuk headers
3. Tambahkan header:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

4. Jalankan query:
```graphql
query {
  me {
    user_id
    name
    email
    phone
    created_at
  }
}
```

## 🔍 Cara Menggunakan GraphiQL

1. **Buka:** `http://localhost:5001/graphql`
2. **Tulis query** di panel kiri
3. **Klik tombol Play** (▶) atau tekan `Ctrl+Enter`
4. **Lihat hasil** di panel kanan

## 📚 Explore Schema

1. Klik tombol **"Docs"** (kanan atas)
2. Lihat semua available queries dan mutations
3. Klik untuk melihat detail parameter

## ⚠️ Common Issues

### Issue: "null" response
- **Normal** jika belum ada query yang dijalankan
- Jalankan salah satu query di atas

### Issue: "User not found"
- User belum terdaftar
- Jalankan mutation `register` terlebih dahulu

### Issue: "Email already registered"
- Email sudah digunakan
- Gunakan email lain atau test dengan user yang sudah ada

### Issue: Connection error
- Pastikan service berjalan: `http://localhost:5001/health`
- Cek apakah port 5001 tidak digunakan aplikasi lain

## ✅ Checklist Test

- [ ] GraphiQL interface terbuka
- [ ] Health endpoint mengembalikan "healthy"
- [ ] Bisa register user baru
- [ ] Bisa login dengan email
- [ ] Bisa login dengan phone
- [ ] Bisa query user by ID
- [ ] Bisa query "me" dengan token

## 🎯 Next Steps

Setelah User Service berhasil, test service lainnya:
- **Wallet Service:** `http://localhost:5002/graphql`
- **Transaction Service:** `http://localhost:5003/graphql` (dengan mutation `pay`)
- **Notification Service:** `http://localhost:5004/graphql`

