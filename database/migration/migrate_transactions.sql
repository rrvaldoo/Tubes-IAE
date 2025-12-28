-- migrate_transactions.sql
-- Copy transactions table from `doswallet` DB into `doswallet_transaction_db`

INSERT INTO doswallet_transaction_db.transactions (transaction_id, user_id, amount, type, payment_method, date, receiver_id, description, idempotency_key, status, qr_payload)
SELECT transaction_id, user_id, amount, type, payment_method, date, receiver_id, description, idempotency_key, status, qr_payload FROM doswallet.transactions
ON DUPLICATE KEY UPDATE amount=VALUES(amount), status=VALUES(status), description=VALUES(description);

SELECT 'transactions_migrated' AS status, COUNT(1) AS rows FROM doswallet_transaction_db.transactions;
