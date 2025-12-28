-- migrate_wallets.sql
-- Copy wallets table from `doswallet` DB into `doswallet_wallet_db`

INSERT INTO doswallet_wallet_db.wallets (wallet_id, user_id, balance, points, created_at, updated_at)
SELECT wallet_id, user_id, balance, points, created_at, updated_at FROM doswallet.wallets
ON DUPLICATE KEY UPDATE balance = VALUES(balance), points = VALUES(points), updated_at = VALUES(updated_at);

SELECT 'wallets_migrated' AS status, COUNT(1) AS rows FROM doswallet_wallet_db.wallets;
