# DosWallet - Android Setup Guide

## 📱 Setup Aplikasi Android di Android Studio

### Prerequisites
- Android Studio (Arctic Fox atau lebih baru)
- JDK 8 atau lebih tinggi
- Android SDK (minSdk 24, targetSdk 34)
- Backend services sudah berjalan (lihat README.md)

### Langkah Setup

#### 1. Buka Project di Android Studio

1. Buka Android Studio
2. Pilih **File > Open**
3. Pilih folder `android` dari project DosWallet
4. Tunggu Gradle sync selesai

#### 2. Konfigurasi API URLs

Edit file `android/app/src/main/java/com/doswallet/app/api/GraphQLClient.kt`:

**Untuk Android Emulator:**
```kotlin
const val USER_SERVICE_URL = "http://10.0.2.2:5001/graphql"
const val WALLET_SERVICE_URL = "http://10.0.2.2:5002/graphql"
const val TRANSACTION_SERVICE_URL = "http://10.0.2.2:5003/graphql"
const val NOTIFICATION_SERVICE_URL = "http://10.0.2.2:5004/graphql"
```

**Untuk Device Fisik (USB Debugging):**
Ganti `10.0.2.2` dengan IP address komputer Anda (misalnya `192.168.1.100`)

#### 3. Build dan Run

1. Pilih device/emulator dari dropdown
2. Klik **Run** (Shift+F10) atau **Run > Run 'app'**
3. Tunggu aplikasi terinstall dan terbuka

### ⚠️ Troubleshooting

#### Network Security Config
Jika ada error network security, pastikan `AndroidManifest.xml` sudah memiliki:
```xml
android:usesCleartextTraffic="true"
```

#### Gradle Sync Error
- Pastikan internet connection aktif
- File > Invalidate Caches / Restart
- Sync Project with Gradle Files

#### API Connection Error
- Pastikan semua backend service berjalan
- Cek IP address sudah benar
- Untuk emulator: gunakan `10.0.2.2`
- Untuk device fisik: gunakan IP komputer di network yang sama

### 📁 Struktur Project Android

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/doswallet/app/
│   │   │   ├── MainActivity.kt
│   │   │   ├── api/              # GraphQL client & API service
│   │   │   ├── auth/             # Login & Register
│   │   │   ├── main/             # Dashboard, Transfer, dll
│   │   │   ├── wallet/           # Wallet screens
│   │   │   ├── models/           # Data models
│   │   │   └── utils/            # Shared utilities
│   │   ├── res/
│   │   │   ├── layout/           # XML layouts
│   │   │   ├── values/           # Colors, strings, themes
│   │   │   └── menu/             # Navigation menus
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

### 🎨 Theme

Aplikasi menggunakan tema biru sesuai spesifikasi:
- Primary: `#1E88E5`
- Primary Dark: `#1976D2`
- Secondary: `#1565C0`

### 📱 Fitur yang Tersedia

- ✅ Login & Register
- ✅ Dashboard dengan balance & points
- ✅ Transfer saldo
- ✅ QRIS Payment (placeholder)
- ✅ Transaction History
- ✅ Notifications
- ✅ Profile

### 🔄 Update dari React Native

Semua fitur dari React Native sudah di-convert ke Android native:
- Apollo Client → OkHttp + GraphQL manual
- AsyncStorage → SharedPreferences
- React Navigation → Android Navigation Component + Bottom Navigation
- React Native screens → Android Activities & Fragments

### 📝 Catatan

- Aplikasi menggunakan Kotlin
- Minimum SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)
- Menggunakan Material Design Components
- Network calls menggunakan Coroutines

### 🚀 Next Steps

1. Test semua fitur
2. Customize UI jika perlu
3. Implementasi QRIS payment yang lengkap
4. Tambahkan error handling yang lebih baik
5. Optimasi performance

Selamat coding! 🎉

