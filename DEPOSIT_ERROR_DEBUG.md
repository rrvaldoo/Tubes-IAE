# Debug Deposit Error 400

## Masalah
User tidak bisa melakukan deposit karena error 400 (Bad Request) dari GraphQL endpoint.

## Analisis

### 1. Database Schema ✅
Database schema sudah sesuai:
- Table `transactions` memiliki semua field yang diperlukan
- Field `status` ada dengan ENUM('pending','completed','failed')
- Field `payment_method`, `description`, `idempotency_key` semua ada

### 2. GraphQL Schema ✅
- Mutation `Deposit` sudah didefinisikan dengan benar
- Menggunakan `Float` untuk `amount` (sudah diperbaiki dari `Decimal`)
- Parameter `paymentMethod` sudah di-mapping dengan `name='paymentMethod'`

### 3. Resolver Functions ✅
- `deposit_atomic()` sudah benar
- `get_by_id()` sudah benar
- Resolver untuk `date` dan `amount` sudah ditambahkan

## Kemungkinan Penyebab Error 400

### A. GraphQL Query Parsing Error
GraphQL mungkin tidak bisa mem-parse query karena:
1. Syntax error di query
2. Type mismatch
3. Field tidak ditemukan di schema

### B. Authentication Error
Token mungkin tidak valid atau tidak terkirim dengan benar.

### C. Database Connection Error
Koneksi ke database mungkin bermasalah.

## Langkah Debugging

### 1. Cek Response Body
Buka browser console → Network tab → Klik request yang error → Response tab
Lihat error message yang sebenarnya dari GraphQL.

### 2. Cek Backend Logs
```bash
docker logs doswallet-transaction-service --tail 100
```

### 3. Test dengan GraphiQL
Buka http://localhost:5003/graphql dan test mutation langsung:
```graphql
mutation {
  deposit(amount: 100000.0, paymentMethod: "bank_transfer", description: "test") {
    transaction_id
    amount
    status
  }
}
```

### 4. Cek Token
Pastikan token JWT valid dan terkirim di header Authorization.

## Solusi yang Sudah Diterapkan

1. ✅ Mengubah tipe `Decimal` ke `Float` di schema
2. ✅ Menambahkan resolver untuk `date` dan `amount`
3. ✅ Menambahkan error logging di `app.py`
4. ✅ Memperbaiki query name `myTransactions`
5. ✅ Memastikan `transactionClient` digunakan di frontend

## Next Steps

1. **Cek Response Body**: Lihat error message detail dari GraphQL di browser console
2. **Test dengan GraphiQL**: Test mutation langsung di GraphQL Playground
3. **Cek Token**: Pastikan token valid dan user_id ada di database
4. **Cek Database**: Pastikan user memiliki wallet di database

## Test Manual

1. Buka http://localhost:5003/graphql
2. Set header: `{"Authorization": "Bearer YOUR_TOKEN"}`
3. Jalankan mutation:
```graphql
mutation {
  deposit(amount: 100000.0, paymentMethod: "bank_transfer", description: "test") {
    transaction_id
    user_id
    amount
    type
    status
    date
  }
}
```

Jika masih error, lihat error message detail di response.

