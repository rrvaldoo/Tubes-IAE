<#
run_all_migrations.ps1

PowerShell helper to:
  - apply init script (creates DBs and users)
  - run migration SQL files in order
  - verify migration results (row counts and basic checks)

Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File .\database\migration\run_all_migrations.ps1

#>

$container = "doswallet-mysql"
$mysql_root_pw = "doswallet123"

# File order: init then migrations
$initScript = "database/init/01_create_databases_and_users.sql"
$migrationFiles = @(
    "database/migration/migrate_users.sql",
    "database/migration/migrate_wallets.sql",
    "database/migration/migrate_transactions.sql",
    "database/migration/migrate_notifications.sql"
)

function Exec-MySQLFile($path) {
    Write-Host "-> Executing: $path"
    if (-not (Test-Path $path)) {
        Write-Error "File not found: $path"
        return $false
    }

    Get-Content $path -Raw | docker exec -i $container sh -c "mysql -u root -p'$mysql_root_pw'"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Execution failed for $path (exit code $LASTEXITCODE)"
        return $false
    }
    return $true
}

# Ensure container is running
$running = docker ps -q -f "name=$container"
if (-not $running) {
    Write-Error "Container '$container' is not running. Start docker-compose first."
    exit 10
}

# connectivity check
docker exec -i $container sh -c "mysql -u root -p'$mysql_root_pw' -e 'SELECT 1;'" > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Cannot connect to MySQL as root inside container '$container' (check password and container health)."
    exit 11
}

# Run init script
if (Test-Path $initScript) {
    Write-Host "Applying init script: $initScript"
    if (-not (Exec-MySQLFile $initScript)) { exit 12 }
} else {
    Write-Warning "Init script not found at $initScript; skipping DB/user creation."
}

# Verify that service DB exists (example: doswallet_user_db)
$check = docker exec -i $container sh -c "mysql -u root -p'$mysql_root_pw' -e \"SHOW DATABASES LIKE 'doswallet_user_db';\""
if ($LASTEXITCODE -ne 0 -or $check -notmatch 'doswallet_user_db') {
    Write-Error "Expected database 'doswallet_user_db' not found after init step. Check init SQL and container logs."
    exit 13
}

# Run migration files
foreach ($m in $migrationFiles) {
    if (-not (Exec-MySQLFile $m)) { exit 20 }
}

# Verification: print counts for each source/target
Write-Host "\n--- Migration verification: row counts ---"
$queries = @(
    "SELECT 'users' AS table_name, (SELECT COUNT(*) FROM doswallet.users) AS source_rows, (SELECT COUNT(*) FROM doswallet_user_db.users) AS target_rows;",
    "SELECT 'wallets' AS table_name, (SELECT COUNT(*) FROM doswallet.wallets) AS source_rows, (SELECT COUNT(*) FROM doswallet_wallet_db.wallets) AS target_rows;",
    "SELECT 'transactions' AS table_name, (SELECT COUNT(*) FROM doswallet.transactions) AS source_rows, (SELECT COUNT(*) FROM doswallet_transaction_db.transactions) AS target_rows;",
    "SELECT 'notifications' AS table_name, (SELECT COUNT(*) FROM doswallet.notifications) AS source_rows, (SELECT COUNT(*) FROM doswallet_notification_db.notifications) AS target_rows;"
)

foreach ($q in $queries) {
    docker exec -i $container sh -c "mysql -u root -p'$mysql_root_pw' -e \"$q\""
}

Write-Host "\nDone. If counts look good, restart services and run smoke tests as described in database/SETUP_INSTRUCTIONS.md"; exit 0
