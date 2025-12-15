# DosWallet - Quick Start Guide

## 🚀 Quick Setup dengan Docker (Paling Mudah!)

### Opsi A: Docker Setup (Recommended - 2 menit)

```bash
# Build dan start semua services
docker-compose up --build

# Atau di background
docker-compose up -d --build
```

Selesai! Semua services (MySQL + 4 microservices) sudah berjalan.

**Lihat [DOCKER_SETUP.md](DOCKER_SETUP.md) untuk detail lengkap**

---

## 🚀 Quick Setup Manual (5 Menit)

### 1. Setup Database (1 menit)

**Opsi A: Menggunakan Script PowerShell (Recommended)**
```powershell
cd database
.\setup_database.ps1
```

**Opsi B: Menggunakan MySQL Workbench**
1. Buka MySQL Workbench
2. Connect ke MySQL server
3. File > Open SQL Script > pilih `database/schema.sql`
4. Execute (⚡ icon)

**Opsi C: Menggunakan XAMPP/WAMP phpMyAdmin**
1. Start XAMPP/WAMP
2. Buka http://localhost/phpmyadmin
3. Buat database `doswallet`
4. Pilih database, klik tab SQL
5. Copy-paste isi `database/schema.sql`
6. Klik Go

**Opsi D: Command Line (jika MySQL di PATH)**
```bash
mysql -u root -p < database/schema.sql
```

**Lihat [database/SETUP_INSTRUCTIONS.md](database/SETUP_INSTRUCTIONS.md) untuk detail lengkap**

### 2. Setup Backend (2 menit)

```bash
cd backend

# Install dependencies untuk semua service
pip install Flask flask-cors flask-graphql graphene mysql-connector-python bcrypt python-dotenv

# Copy .env.example ke setiap service (atau buat manual)
# Edit .env di setiap service folder dengan kredensial MySQL Anda

# Windows: Jalankan semua service sekaligus
start_all_services.bat

# Linux/Mac: Jalankan manual di terminal terpisah
cd user-service && python app.py
cd wallet-service && python app.py
cd transaction-service && python app.py
cd notification-service && python app.py
```

### 3. Setup Frontend (2 menit)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan aplikasi
npm start

# Untuk Android
npm run android
```

## ✅ Verifikasi Setup

### Backend Services
Buka browser dan cek:
- User Service: http://localhost:5001/graphql
- Wallet Service: http://localhost:5002/graphql
- Transaction Service: http://localhost:5003/graphql
- Notification Service: http://localhost:5004/graphql

Semua harus menampilkan GraphQL Playground.

### Frontend
- Aplikasi React Native harus terbuka di emulator/device
- Login screen harus muncul

## 🧪 Test Login

1. Buka GraphQL Playground di http://localhost:5001/graphql
2. Jalankan mutation:

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
    }
    message
  }
}
```

3. Login di aplikasi mobile dengan email dan password yang baru dibuat

## ⚠️ Troubleshooting

### Port sudah digunakan?
Edit `.env` di service yang bermasalah, ubah port-nya.

### Database connection error?
- Pastikan MySQL berjalan
- Cek kredensial di `.env`
- Pastikan database `doswallet` sudah dibuat

### Frontend tidak bisa connect ke backend?
- Untuk Android Emulator: ubah `localhost` menjadi `10.0.2.2` di `frontend/src/services/apollo.js`
- Pastikan semua backend service berjalan
- Cek firewall settings

## 📝 Next Steps

1. Test semua fitur: Register, Login, Transfer, dll
2. Customize tema warna jika perlu
3. Implementasi QRIS payment yang lengkap
4. Integrasi dengan Food Delivery System

Selamat coding! 🎉

