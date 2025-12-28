# 🚀 Quick Guide: Konfigurasi Database Docker

## 📊 Diagram Konfigurasi

```
┌─────────────────────────────────────────────────────────┐
│                    DOCKER CONTAINER                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         MySQL Container (doswallet-mysql)         │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  MySQL Server (Port 3306 internal)        │ │  │
│  │  │  - Database: doswallet                      │ │  │
│  │  │  - User: doswallet_user                     │ │  │
│  │  │  - Password: doswallet123                   │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                                                  │  │
│  │  Volume: mysql_data (persistent storage)        │  │
│  └──────────────────────────────────────────────────┘  │
│                    ↕ Port Mapping                       │
│                   3310:3306                             │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                    HOST MACHINE                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Backend Services (Python)                 │  │
│  │  Connect to: localhost:3310                       │  │
│  │  Config: backend/.env                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ 3 File Konfigurasi Utama

### 1️⃣ docker-compose.yml
```yaml
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: doswallet123
    MYSQL_DATABASE: doswallet
    MYSQL_USER: doswallet_user
    MYSQL_PASSWORD: doswallet123
  ports:
    - "3310:3306"  # ← Port mapping
  volumes:
    - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
```

### 2️⃣ backend/.env
```env
DB_HOST=localhost
DB_PORT=3310        # ← Port EXTERNAL!
DB_USER=doswallet_user
DB_PASSWORD=doswallet123
DB_NAME=doswallet
```

### 3️⃣ database/schema.sql
```sql
CREATE DATABASE IF NOT EXISTS doswallet;
USE doswallet;
-- ... tables definition
```

## 🎯 Setup dalam 3 Langkah

### Step 1: Start Database
```bash
docker-compose up mysql -d
```

### Step 2: Setup Backend Config
```bash
# Copy template
Copy-Item backend\docker-db-config.env backend\.env
```

### Step 3: Start Backend
```bash
cd backend
python start_all_services.py
```

## ✅ Verifikasi

```bash
# 1. Cek container running
docker ps --filter "name=doswallet-mysql"

# 2. Cek logs
docker-compose logs mysql

# 3. Test koneksi
docker exec -it doswallet-mysql mysql -u doswallet_user -pdoswallet123 doswallet
```

## 🔑 Credentials

| Item | Value |
|------|-------|
| **Host** | localhost |
| **Port** | 3310 |
| **Database** | doswallet |
| **User** | doswallet_user |
| **Password** | doswallet123 |
| **Root Password** | doswallet123 |

## ⚠️ Penting!

1. **Port 3310** (bukan 3306!) - Ini port EXTERNAL untuk connect dari host
2. **Port 3306** - Port INTERNAL di dalam container
3. **Schema otomatis** - File `schema.sql` auto-run saat pertama kali setup
4. **Data persisten** - Volume `mysql_data` menyimpan data

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3310 used | Ubah port di docker-compose.yml |
| Connection refused | Cek container running: `docker ps` |
| Schema tidak ter-apply | `docker-compose down -v` lalu restart |
| Wrong password | Cek `.env` file credentials |

## 📚 Dokumentasi Lengkap

Lihat `DATABASE_DOCKER_SETUP.md` untuk panduan detail.

