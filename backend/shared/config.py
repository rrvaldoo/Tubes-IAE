"""
Shared configuration for all microservices
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'doswallet'),
    'charset': 'utf8mb4'
}

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'doswallet-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 86400  # 24 hours

# Service Ports
SERVICE_PORTS = {
    'user': int(os.getenv('USER_SERVICE_PORT', 5001)),
    'wallet': int(os.getenv('WALLET_SERVICE_PORT', 5002)),
    'transaction': int(os.getenv('TRANSACTION_SERVICE_PORT', 5003)),
    'notification': int(os.getenv('NOTIFICATION_SERVICE_PORT', 5004))
}

# CORS Configuration
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

