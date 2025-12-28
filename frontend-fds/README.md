# Food Delivery System - Frontend

Frontend aplikasi Food Delivery System yang terintegrasi dengan DOSWALLET Payment Service.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ dan npm/yarn
- DOSWALLET backend services berjalan (Transaction Service di port 5003)

### Installation

```bash
cd frontend-fds
npm install
```

### Configuration

Buat file `.env` di root folder `frontend-fds`:

```env
VITE_DOSWALLET_URL=http://localhost:5003/graphql
```

### Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3001`

## 📋 Fitur

### Payment Integration dengan DOSWALLET

1. **Checkout Page** (`/checkout`)
   - Input NIM/Email untuk identifikasi user DOSWALLET
   - Order summary dengan breakdown harga
   - Payment processing melalui DOSWALLET

2. **Payment Processing**
   - Server-to-server communication dengan DOSWALLET
   - Timeout handling (5 detik maksimal)
   - Automatic order cancellation jika payment gagal
   - Real-time payment status updates

3. **Order Confirmation** (`/order-confirmation/:orderId`)
   - Menampilkan hasil payment
   - Order details dan transaction ID
   - Status order (PAID/CANCELLED)

## 🔧 Arsitektur

### Services

- **doswallet.js**: Client untuk komunikasi dengan DOSWALLET GraphQL API
- **orderService.js**: Business logic untuk order management dan payment processing

### Components

- **PaymentForm**: Form checkout dengan integrasi payment
- **Checkout**: Halaman checkout utama
- **OrderConfirmation**: Halaman konfirmasi order

## 📡 API Integration

### DOSWALLET Payment Mutation

```graphql
mutation Pay($nim: String!, $amount: Float!) {
  pay(nim: $nim, amount: $amount) {
    status
    trxId
    balanceRemaining
    message
  }
}
```

### Payment Flow

1. User melakukan checkout
2. Order Service membuat order dengan status PENDING
3. Payment Service memanggil DOSWALLET `pay` mutation
4. Jika SUCCESS:
   - Order status → PAID
   - Transaction ID disimpan
   - Order diteruskan ke Driver Service
5. Jika FAILED atau timeout:
   - Order status → CANCELLED
   - Stok restoran tidak dikurangi

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DOSWALLET_URL` | DOSWALLET GraphQL endpoint | `http://localhost:5003/graphql` |

## 🧪 Testing

### Manual Testing

1. Pastikan DOSWALLET backend berjalan
2. Buka `http://localhost:3001/checkout`
3. Input NIM/Email yang terdaftar di DOSWALLET
4. Tambahkan items ke cart
5. Klik "Pay with DOSWALLET"
6. Verifikasi payment result

### Test Scenarios

- ✅ Payment dengan saldo cukup
- ✅ Payment dengan saldo tidak cukup
- ✅ Payment dengan user tidak ditemukan
- ✅ Payment timeout (simulasi dengan mematikan DOSWALLET service)
- ✅ Order cancellation otomatis saat payment gagal

## 📝 Notes

- Payment timeout: 5 detik (sesuai dokumentasi)
- Order otomatis dibatalkan jika payment gagal atau timeout
- NIM/Email harus match dengan user di DOSWALLET
- Semua transaksi dicatat dengan transaction ID untuk audit

## 🔗 Related Documentation

- DOSWALLET Integration Docs: `backend/transaction-service/INTEGRATION_DOCS.md`
- Backend API: `backend/transaction-service/`

