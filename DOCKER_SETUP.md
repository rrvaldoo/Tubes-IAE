# DosWallet - Docker Setup Guide

## 🐳 Setup dengan Docker

Docker setup memudahkan deployment dan development karena semua service bisa dijalankan dengan satu command.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) atau **Docker Engine** (Linux)
- **Docker Compose** (biasanya sudah include dengan Docker Desktop)

### Install Docker

- **Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```

## 🚀 Quick Start

### 1. Clone/Download Project

Pastikan Anda sudah di root directory project DosWallet.

### 2. Build dan Run Semua Services

```bash
# Build dan start semua containers
docker-compose up --build

# Atau run di background
docker-compose up -d --build
```

Ini akan:
- ✅ Build semua 4 microservices
- ✅ Setup MySQL database
- ✅ Import schema.sql secara otomatis
- ✅ Start semua services

### 3. Verifikasi Services

Buka browser dan cek:

- **User Service**: http://localhost:5001/graphql
- **Wallet Service**: http://localhost:5002/graphql
- **Transaction Service**: http://localhost:5003/graphql
- **Notification Service**: http://localhost:5004/graphql

Semua harus menampilkan GraphQL Playground.

### 4. Cek Logs

```bash
# Logs semua services
docker-compose logs -f

# Logs specific service
docker-compose logs -f user-service
docker-compose logs -f mysql
```

## 🛠️ Docker Commands

### Start Services
```bash
docker-compose up              # Start dengan logs
docker-compose up -d          # Start di background
docker-compose up --build     # Rebuild dan start
```

### Stop Services
```bash
docker-compose stop           # Stop containers
docker-compose down            # Stop dan remove containers
docker-compose down -v        # Stop, remove containers, dan volumes
```

### Restart Services
```bash
docker-compose restart        # Restart semua
docker-compose restart user-service  # Restart specific service
```

### View Logs
```bash
docker-compose logs           # View all logs
docker-compose logs -f        # Follow logs
docker-compose logs user-service  # Specific service
```

### Rebuild After Code Changes
```bash
docker-compose up --build     # Rebuild dan restart
```

### Access Container Shell
```bash
docker-compose exec user-service bash
docker-compose exec mysql bash
```

## 📊 Services Overview

| Service | Port | Container Name | GraphQL URL |
|---------|------|----------------|-------------|
| MySQL | 3306 | doswallet-mysql | - |
| User Service | 5001 | doswallet-user-service | http://localhost:5001/graphql |
| Wallet Service | 5002 | doswallet-wallet-service | http://localhost:5002/graphql |
| Transaction Service | 5003 | doswallet-transaction-service | http://localhost:5003/graphql |
| Notification Service | 5004 | doswallet-notification-service | http://localhost:5004/graphql |

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` untuk mengubah konfigurasi:

```yaml
environment:
  DB_HOST: mysql
  DB_PORT: 3306
  DB_USER: doswallet_user
  DB_PASSWORD: doswallet123      # Ganti dengan password yang aman
  DB_NAME: doswallet
  JWT_SECRET: your-secret-key    # Ganti dengan secret key yang kuat
```

### Database Credentials

Default credentials:
- **Root Password**: `doswallet123`
- **Database**: `doswallet`
- **User**: `doswallet_user`
- **Password**: `doswallet123`

⚠️ **PENTING**: Ganti password default untuk production!

### Port Configuration

Jika port sudah digunakan, edit di `docker-compose.yml`:

```yaml
ports:
  - "5001:5001"  # Format: "HOST:CONTAINER"
```

## 🗄️ Database Management

### Access MySQL

```bash
# Via Docker
docker-compose exec mysql mysql -u doswallet_user -pdoswallet123 doswallet

# Atau dari host
mysql -h localhost -P 3306 -u doswallet_user -pdoswallet123 doswallet
```

### Backup Database

```bash
docker-compose exec mysql mysqldump -u doswallet_user -pdoswallet123 doswallet > backup.sql
```

### Restore Database

```bash
docker-compose exec -T mysql mysql -u doswallet_user -pdoswallet123 doswallet < backup.sql
```

### Reset Database

```bash
# Stop containers
docker-compose down -v

# Start lagi (akan recreate database)
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Cek port yang digunakan
netstat -ano | findstr :5001

# Atau ubah port di docker-compose.yml
```

### Container Won't Start

```bash
# Cek logs
docker-compose logs service-name

# Rebuild
docker-compose up --build --force-recreate
```

### Database Connection Error

1. Pastikan MySQL container sudah healthy:
   ```bash
   docker-compose ps
   ```

2. Cek MySQL logs:
   ```bash
   docker-compose logs mysql
   ```

3. Pastikan service menunggu MySQL ready (healthcheck)

### Permission Denied

**Linux/Mac:**
```bash
sudo docker-compose up
```

**Windows:** Run Docker Desktop as Administrator

### Out of Memory

Jika error "out of memory":
1. Increase Docker memory limit di Docker Desktop settings
2. Atau reduce `pool_size` di `database.py`

## 📱 Connect Android App

Edit `android/app/src/main/java/com/doswallet/app/api/GraphQLClient.kt`:

**Untuk Android Emulator:**
```kotlin
const val USER_SERVICE_URL = "http://10.0.2.2:5001/graphql"
```

**Untuk Device Fisik:**
```kotlin
const val USER_SERVICE_URL = "http://YOUR_COMPUTER_IP:5001/graphql"
```

Ganti `YOUR_COMPUTER_IP` dengan IP komputer Anda di network yang sama.

## 🔄 Development Workflow

### 1. Code Changes

Edit code di `backend/` directory.

### 2. Rebuild Service

```bash
# Rebuild specific service
docker-compose up --build user-service

# Atau rebuild all
docker-compose up --build
```

### 3. Hot Reload (Optional)

Untuk development, bisa mount volumes untuk hot reload (tidak disarankan untuk production).

## 📦 Production Deployment

### 1. Update Environment Variables

Edit `docker-compose.yml` dengan:
- Strong passwords
- Secure JWT secret
- Production database credentials

### 2. Build Production Images

```bash
docker-compose -f docker-compose.yml build
```

### 3. Run in Production

```bash
docker-compose up -d
```

### 4. Setup Reverse Proxy (Optional)

Gunakan Nginx atau Traefik untuk reverse proxy ke semua services.

## ✅ Checklist

- [ ] Docker Desktop terinstall dan running
- [ ] Semua containers berjalan (`docker-compose ps`)
- [ ] GraphQL Playground bisa diakses di semua services
- [ ] Database sudah terbuat dan terisi schema
- [ ] Android app bisa connect ke services
- [ ] Logs tidak ada error

## 🎉 Selamat!

Docker setup selesai! Semua services berjalan dalam container yang terisolasi dan mudah di-manage.

Untuk bantuan lebih lanjut, cek logs dengan `docker-compose logs -f`.

