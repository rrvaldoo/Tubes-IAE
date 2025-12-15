# Setup Database DosWallet

## 🚀 Cara Setup Database

### Opsi 1: Menggunakan Script PowerShell (Recommended)

```powershell
cd database
.\setup_database.ps1
```

Script akan:
- Mencari MySQL di sistem Anda
- Meminta kredensial database
- Membuat database dan tabel secara otomatis

### Opsi 2: Menggunakan MySQL Workbench (GUI)

1. **Buka MySQL Workbench**
2. **Connect** ke MySQL server Anda
3. **File > Open SQL Script**
4. Pilih file `schema.sql`
5. Klik **Execute** (⚡ icon) atau tekan `Ctrl+Shift+Enter`

### Opsi 3: Menggunakan Command Line (Jika MySQL di PATH)

```bash
# Login ke MySQL
mysql -u root -p

# Di dalam MySQL, jalankan:
source database/schema.sql

# Atau copy-paste isi schema.sql langsung
```

### Opsi 4: Manual dengan XAMPP/WAMP

#### XAMPP:
1. Start **Apache** dan **MySQL** di XAMPP Control Panel
2. Buka **phpMyAdmin** (http://localhost/phpmyadmin)
3. Klik **New** untuk membuat database baru
4. Nama database: `doswallet`
5. Pilih database `doswallet`
6. Klik tab **SQL**
7. Copy-paste isi `schema.sql`
8. Klik **Go**

#### WAMP:
1. Start **WAMP** server
2. Buka **phpMyAdmin** (http://localhost/phpmyadmin)
3. Ikuti langkah yang sama seperti XAMPP

## 📋 Checklist Setup

- [ ] MySQL terinstall atau XAMPP/WAMP terinstall
- [ ] MySQL service berjalan
- [ ] Database `doswallet` sudah dibuat
- [ ] Tabel `users`, `wallets`, `transactions`, `notifications` sudah ada
- [ ] Kredensial database sudah dicatat untuk konfigurasi backend

## ⚠️ Troubleshooting

### MySQL tidak ditemukan di PATH

**Solusi 1: Tambahkan MySQL ke PATH**
1. Cari lokasi MySQL (biasanya `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
2. Copy path tersebut
3. Buka **System Properties > Environment Variables**
4. Edit **Path** variable
5. Tambahkan path MySQL
6. Restart PowerShell/Command Prompt

**Solusi 2: Gunakan Full Path**
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

**Solusi 3: Install XAMPP/WAMP**
- XAMPP: https://www.apachefriends.org/
- WAMP: https://www.wampserver.com/
- Keduanya sudah include MySQL dan phpMyAdmin

### Error: Access Denied

- Pastikan username dan password benar
- Default XAMPP: username `root`, password kosong
- Default WAMP: username `root`, password kosong
- MySQL Server: gunakan password yang Anda set saat install

### Error: Database already exists

Tidak masalah, database sudah ada. Anda bisa skip atau drop database dulu:
```sql
DROP DATABASE IF EXISTS doswallet;
```

## 🔧 Konfigurasi Backend

Setelah database setup, edit file `.env` di setiap backend service:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=doswallet
```

**Untuk XAMPP/WAMP:**
```env
DB_PASSWORD=  # Kosongkan jika tidak ada password
```

## ✅ Verifikasi Setup

Jalankan query ini di MySQL untuk verifikasi:

```sql
USE doswallet;
SHOW TABLES;
```

Harus muncul 4 tabel:
- users
- wallets
- transactions
- notifications

Selamat! Database sudah siap digunakan! 🎉

