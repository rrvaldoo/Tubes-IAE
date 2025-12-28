-- migrate_users.sql
-- Copy users table from old `doswallet` DB into `doswallet_user_db`
-- Run this on the MySQL server after ensuring both DBs exist.

SET @rows_before = (SELECT COUNT(1) FROM doswallet.users);

INSERT INTO doswallet_user_db.users (user_id, name, email, phone, password, created_at, updated_at)
SELECT user_id, name, email, phone, password, created_at, updated_at FROM doswallet.users
ON DUPLICATE KEY UPDATE
 name = VALUES(name), email = VALUES(email), phone = VALUES(phone), password = VALUES(password), updated_at = VALUES(updated_at);

SELECT 'users_migrated' AS status, COUNT(1) as rows INTO @rows_after FROM doswallet_user_db.users;
SELECT @rows_before AS source_rows, @rows_after AS target_rows;
