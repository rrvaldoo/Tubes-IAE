# Menjalankan Hanya Database dengan Docker

## 🎯 Skenario: Database di Docker, Backend di Local

Jika Anda ingin menggunakan Docker hanya untuk database MySQL, dan menjalankan backend services secara manual di local:

### 1. Start Database Docker

```bash
docker-compose up mysql -d
```

Atau jika ingin melihat logs:

```bash
docker-compose up mysql
```

### 2. Update Konfigurasi Backend

Backend services perlu dikonfigurasi untuk connect ke Docker MySQL:

**Port Docker MySQL:** `3310` (mapped dari 3306 internal)

**Buat file `.env` di setiap service folder atau di `backend/shared/`:**

```env
DB_HOST=localhost
DB_PORT=3310
DB_USER=doswallet_user
DB_PASSWORD=doswallet123
DB_NAME=doswallet
```

### 3. Jalankan Backend Services

```bash
cd backend
python start_all_services.py
```

## ✅ Keuntungan

- ✅ Database terisolasi di Docker
- ✅ Tidak perlu Laragon MySQL
- ✅ Backend tetap bisa di-debug dengan mudah
- ✅ Database otomatis setup dengan schema.sql

## 🔍 Verifikasi

Cek apakah MySQL container berjalan:

```bash
docker ps
```

Harusnya ada container `doswallet-mysql` yang running.

## 🛑 Stop Database

```bash
docker-compose down
```

Atau hanya stop MySQL:

```bash
docker-compose stop mysql
```

