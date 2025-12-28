# 📊 Konfigurasi Database Docker - Panduan Lengkap

## 🎯 Overview

Dokumen ini menjelaskan cara konfigurasi MySQL database menggunakan Docker untuk proyek DOSWALLET.

## 📋 1. Konfigurasi di docker-compose.yml

### Konfigurasi MySQL Service

```yaml
services:
  mysql:
    image: mysql:8.0                    # Versi MySQL yang digunakan
    container_name: doswallet-mysql      # Nama container
    environment:
      MYSQL_ROOT_PASSWORD: doswallet123 # Password root
      MYSQL_DATABASE: doswallet          # Database yang dibuat otomatis
      MYSQL_USER: doswallet_user         # User untuk aplikasi
      MYSQL_PASSWORD: doswallet123       # Password user
    ports:
      - "3310:3306"                      # Port mapping (external:internal)
    volumes:
      - mysql_data:/var/lib/mysql        # Persistent storage
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql  # Auto-run schema
    networks:
      - doswallet-network                # Network untuk komunikasi
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-pdoswallet123"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Penjelasan Konfigurasi

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| **image** | `mysql:8.0` | Versi MySQL 8.0 |
| **container_name** | `doswallet-mysql` | Nama container untuk mudah diidentifikasi |
| **MYSQL_ROOT_PASSWORD** | `doswallet123` | Password untuk user root |
| **MYSQL_DATABASE** | `doswallet` | Database otomatis dibuat saat pertama kali run |
| **MYSQL_USER** | `doswallet_user` | User khusus untuk aplikasi (bukan root) |
| **MYSQL_PASSWORD** | `doswallet123` | Password untuk user aplikasi |
| **ports** | `3310:3306` | Port 3310 di host → 3306 di container |
| **volumes** | `mysql_data` | Data persisten (tidak hilang saat container stop) |
| **schema.sql** | Auto-run | Schema otomatis dijalankan saat pertama kali setup |

## 🚀 2. Cara Setup Database

### Step 1: Start MySQL Container

```bash
# Start hanya MySQL
docker-compose up mysql -d

# Atau start dengan logs
docker-compose up mysql
```

### Step 2: Verifikasi Container Running

```bash
# Cek status container
docker ps

# Atau filter khusus MySQL
docker ps --filter "name=doswallet-mysql"
```

**Output yang diharapkan:**
```
NAMES             STATUS          PORTS
doswallet-mysql   Up X minutes   0.0.0.0:3310->3306/tcp
```

### Step 3: Cek Logs (Optional)

```bash
# Lihat logs MySQL
docker-compose logs mysql

# Follow logs real-time
docker-compose logs -f mysql
```

## 🔌 3. Konfigurasi Backend untuk Connect

### File: `backend/.env`

Buat file `.env` di folder `backend/` dengan konfigurasi berikut:

```env
# Database Configuration for Docker MySQL
DB_HOST=localhost          # Host (localhost karena port mapping)
DB_PORT=3310              # Port EXTERNAL (bukan 3306!)
DB_USER=doswallet_user    # User aplikasi
DB_PASSWORD=doswallet123  # Password user
DB_NAME=doswallet         # Nama database

# JWT Configuration
JWT_SECRET=doswallet-secret-key-change-in-production

# Service Ports
USER_SERVICE_PORT=5001
WALLET_SERVICE_PORT=5002
TRANSACTION_SERVICE_PORT=5003
NOTIFICATION_SERVICE_PORT=5004

# CORS Configuration
CORS_ORIGINS=*
```

### Atau Copy dari Template

```bash
# Copy file template
Copy-Item backend\docker-db-config.env backend\.env
```

## ✅ 4. Verifikasi Koneksi

### Test Koneksi dari Backend

Jalankan backend service dan cek apakah bisa connect:

```bash
cd backend
python start_all_services.py
```

Cek logs untuk melihat apakah koneksi berhasil.

### Test Koneksi Manual (Optional)

```bash
# Connect ke MySQL container
docker exec -it doswallet-mysql mysql -u doswallet_user -pdoswallet123 doswallet

# Atau dari host (jika MySQL client terinstall)
mysql -h localhost -P 3310 -u doswallet_user -pdoswallet123 doswallet
```

### Test dari Python (Quick Test)

```python
import mysql.connector

config = {
    'host': 'localhost',
    'port': 3310,
    'user': 'doswallet_user',
    'password': 'doswallet123',
    'database': 'doswallet'
}

try:
    conn = mysql.connector.connect(**config)
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

## 📊 5. Struktur Database

Database otomatis dibuat dengan schema dari `database/schema.sql`:

### Tables:
1. **users** - Data pengguna
2. **wallets** - Saldo dan poin
3. **transactions** - Riwayat transaksi
4. **notifications** - Notifikasi pengguna

### Verifikasi Tables

```sql
-- Connect ke database
USE doswallet;

-- Lihat semua tables
SHOW TABLES;

-- Cek struktur table
DESCRIBE users;
DESCRIBE wallets;
DESCRIBE transactions;
DESCRIBE notifications;
```

## 🔧 6. Konfigurasi Lanjutan

### Mengubah Port (Jika 3310 sudah digunakan)

Edit `docker-compose.yml`:

```yaml
ports:
  - "3311:3306"  # Ubah 3310 menjadi port lain
```

Jangan lupa update `DB_PORT` di `.env` juga!

### Mengubah Password

Edit `docker-compose.yml`:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: password_baru
  MYSQL_PASSWORD: password_baru
```

**⚠️ PENTING:** Jika sudah ada data, perlu backup dulu!

### Reset Database (Fresh Start)

```bash
# Stop dan hapus container + volume
docker-compose down -v

# Start ulang (akan create fresh database)
docker-compose up mysql -d
```

## 🛠️ 7. Troubleshooting

### Problem: Port 3310 sudah digunakan

**Solusi:**
```bash
# Cek apa yang menggunakan port 3310
netstat -ano | findstr :3310

# Atau ubah port di docker-compose.yml
```

### Problem: Container tidak start

**Solusi:**
```bash
# Cek logs
docker-compose logs mysql

# Cek apakah port conflict
docker ps -a
```

### Problem: Schema tidak ter-apply

**Solusi:**
```bash
# Hapus volume dan restart
docker-compose down -v
docker-compose up mysql -d

# Atau manual import
docker exec -i doswallet-mysql mysql -u root -pdoswallet123 doswallet < database/schema.sql
```

### Problem: Connection refused

**Cek:**
1. Container running? `docker ps`
2. Port benar? `3310` (bukan 3306!)
3. Credentials benar? Cek `.env` file

## 📝 8. Command Cheat Sheet

```bash
# Start MySQL
docker-compose up mysql -d

# Stop MySQL
docker-compose stop mysql

# Restart MySQL
docker-compose restart mysql

# View logs
docker-compose logs mysql

# Follow logs
docker-compose logs -f mysql

# Connect ke MySQL
docker exec -it doswallet-mysql mysql -u doswallet_user -pdoswallet123 doswallet

# Stop dan hapus container
docker-compose down

# Stop dan hapus container + volume (RESET!)
docker-compose down -v

# Cek status
docker ps --filter "name=doswallet-mysql"
```

## 🎯 9. Best Practices

1. **Jangan gunakan root untuk aplikasi**
   - Gunakan user khusus (`doswallet_user`)
   - Lebih aman dan sesuai best practice

2. **Gunakan volume untuk data persistence**
   - Data tidak hilang saat container stop/restart
   - Volume `mysql_data` menyimpan semua data

3. **Backup secara berkala**
   ```bash
   docker exec doswallet-mysql mysqldump -u root -pdoswallet123 doswallet > backup.sql
   ```

4. **Gunakan healthcheck**
   - Docker otomatis cek kesehatan MySQL
   - Services lain bisa wait sampai MySQL ready

5. **Environment variables untuk production**
   - Jangan hardcode password di docker-compose.yml
   - Gunakan `.env` file atau secrets

## ✅ Checklist Setup

- [ ] Docker dan Docker Compose terinstall
- [ ] File `docker-compose.yml` sudah benar
- [ ] File `database/schema.sql` ada
- [ ] Start MySQL container: `docker-compose up mysql -d`
- [ ] Verifikasi container running: `docker ps`
- [ ] Buat file `backend/.env` dengan konfigurasi database
- [ ] Test koneksi dari backend service
- [ ] Verifikasi tables sudah dibuat

## 🎉 Selesai!

Database Docker sudah siap digunakan. Backend services bisa langsung connect ke `localhost:3310` dengan credentials yang sudah dikonfigurasi.

