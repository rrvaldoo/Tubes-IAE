"""
Transaction Service Models
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from database import execute_query, get_db_connection

class Transaction:
    @staticmethod
    def create(user_id, amount, transaction_type, payment_method=None, receiver_id=None, description=None):
        """Create a new transaction"""
        query = """
            INSERT INTO transactions (user_id, amount, type, payment_method, receiver_id, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        transaction_id = execute_query(
            query,
            (user_id, amount, transaction_type, payment_method, receiver_id, description)
        )
        return transaction_id

    @staticmethod
    def create_with_idempotency(user_id, amount, transaction_type, payment_method=None, receiver_id=None, description=None, idempotency_key=None, status='completed', qr_payload=None):
        """Create a new transaction with optional idempotency key and status. If idempotency_key exists, return existing transaction id."""
        if idempotency_key:
            # Check existing
            existing = execute_query("SELECT transaction_id FROM transactions WHERE idempotency_key = %s", (idempotency_key,), fetch_one=True)
            if existing:
                return existing['transaction_id']

        query = """
            INSERT INTO transactions (user_id, amount, type, payment_method, receiver_id, description, idempotency_key, status, qr_payload)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        transaction_id = execute_query(
            query,
            (user_id, amount, transaction_type, payment_method, receiver_id, description, idempotency_key, status, qr_payload)
        )
        return transaction_id

    @staticmethod
    def transfer_atomic(sender_id, receiver_id, amount, description=None, idempotency_key=None):
        """Perform a transfer in a single DB transaction with row locking to ensure atomicity."""
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")

        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()

            # Lock sender wallet row
            cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (sender_id,))
            sender_wallet = cursor.fetchone()
            if not sender_wallet:
                # Create wallet for sender if not exists
                cursor.execute("INSERT INTO wallets (user_id, balance, points) VALUES (%s, 0.00, 0)", (sender_id,))
                cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (sender_id,))
                sender_wallet = cursor.fetchone()

            # Lock receiver wallet row
            cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (receiver_id,))
            receiver_wallet = cursor.fetchone()
            if not receiver_wallet:
                cursor.execute("INSERT INTO wallets (user_id, balance, points) VALUES (%s, 0.00, 0)", (receiver_id,))
                cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (receiver_id,))
                receiver_wallet = cursor.fetchone()

            # Check balance
            if float(sender_wallet['balance']) < float(amount):
                conn.rollback()
                raise Exception("Insufficient balance")

            # Update balances
            cursor.execute("UPDATE wallets SET balance = balance - %s WHERE user_id = %s", (amount, sender_id))
            cursor.execute("UPDATE wallets SET balance = balance + %s WHERE user_id = %s", (amount, receiver_id))

            # Create transaction record (for sender)
            cursor.execute("INSERT INTO transactions (user_id, amount, type, receiver_id, description, idempotency_key, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                           (sender_id, amount, 'transfer', receiver_id, description, idempotency_key, 'completed'))
            transaction_id = cursor.lastrowid

            conn.commit()

            # Return the inserted transaction
            return Transaction.get_by_id(transaction_id)
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def create_payment_request(amount, external_id=None, description=None, idempotency_key=None, qr_payload=None):
        """Create a pending payment request that can be confirmed later via webhook/callback."""
        # user_id can be null / 0 for external initiated payments; we'll record user_id if provided
        # For simplicity we store user_id as NULL for external payments unless specified
        user_id = None
        status = 'pending'
        # Use create_with_idempotency to prevent duplicates
        transaction_id = Transaction.create_with_idempotency(user_id, amount, 'deposit', payment_method='external', receiver_id=None, description=description, idempotency_key=idempotency_key, status=status, qr_payload=qr_payload)
        return transaction_id

    @staticmethod
    def confirm_payment_by_idempotency(idempotency_key, provider_reference=None):
        """Confirm pending payment by idempotency key: mark as completed and apply wallet update if applicable."""
        # Find pending transaction
        tx = execute_query("SELECT * FROM transactions WHERE idempotency_key = %s", (idempotency_key,), fetch_one=True)
        if not tx:
            raise Exception("Payment not found")
        if tx['status'] == 'completed':
            return tx['transaction_id']

        # If tx has user_id, update wallet, else skip (external incoming payment may need linking)
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()

            # Update transaction status
            cursor.execute("UPDATE transactions SET status = 'completed' WHERE transaction_id = %s", (tx['transaction_id'],))

            # If transaction has user_id, add amount to that wallet
            if tx.get('user_id'):
                cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (tx['user_id'],))
                wallet = cursor.fetchone()
                if not wallet:
                    cursor.execute("INSERT INTO wallets (user_id, balance, points) VALUES (%s, 0.00, 0)", (tx['user_id'],))
                cursor.execute("UPDATE wallets SET balance = balance + %s WHERE user_id = %s", (tx['amount'], tx['user_id']))

            conn.commit()
            return tx['transaction_id']
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def deposit_atomic(user_id, amount, payment_method=None, description=None, idempotency_key=None):
        """Perform deposit in a single DB transaction (create transaction + update wallet)."""
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")

        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()

            # Idempotency check
            if idempotency_key:
                cursor.execute("SELECT transaction_id, status FROM transactions WHERE idempotency_key = %s", (idempotency_key,))
                existing = cursor.fetchone()
                if existing:
                    # If exists and completed, return existing
                    if existing.get('status') == 'completed':
                        conn.commit()
                        return existing['transaction_id']

            # Ensure wallet exists
            cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (user_id,))
            wallet = cursor.fetchone()
            if not wallet:
                cursor.execute("INSERT INTO wallets (user_id, balance, points) VALUES (%s, 0.00, 0)", (user_id,))

            # Insert transaction (as completed)
            cursor.execute("INSERT INTO transactions (user_id, amount, type, payment_method, description, idempotency_key, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                           (user_id, amount, 'deposit', payment_method, description, idempotency_key, 'completed'))
            transaction_id = cursor.lastrowid

            # Update wallet balance
            cursor.execute("UPDATE wallets SET balance = balance + %s WHERE user_id = %s", (amount, user_id))

            conn.commit()
            return transaction_id
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def withdraw_atomic(user_id, amount, payment_method=None, description=None, idempotency_key=None):
        """Perform withdraw in a single DB transaction (create transaction + update wallet)."""
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")

        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()

            # Ensure wallet exists and lock
            cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (user_id,))
            wallet = cursor.fetchone()
            if not wallet:
                conn.rollback()
                raise Exception("Wallet not found")

            if float(wallet['balance']) < float(amount):
                conn.rollback()
                raise Exception("Insufficient balance")

            # Insert transaction
            cursor.execute("INSERT INTO transactions (user_id, amount, type, payment_method, description, idempotency_key, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                           (user_id, amount, 'withdraw', payment_method, description, idempotency_key, 'completed'))
            transaction_id = cursor.lastrowid

            # Update wallet balance
            cursor.execute("UPDATE wallets SET balance = balance - %s WHERE user_id = %s", (amount, user_id))

            conn.commit()
            return transaction_id
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    @staticmethod
    def get_by_id(transaction_id):
        """Get transaction by ID"""
        query = """
            SELECT * FROM transactions WHERE transaction_id = %s
        """
        return execute_query(query, (transaction_id,), fetch_one=True)
    
    @staticmethod
    def get_by_user_id(user_id, limit=50, offset=0):
        """Get transactions by user ID"""
        query = """
            SELECT * FROM transactions 
            WHERE user_id = %s OR receiver_id = %s
            ORDER BY date DESC
            LIMIT %s OFFSET %s
        """
        return execute_query(query, (user_id, user_id, limit, offset), fetch_all=True)
    
    @staticmethod
    def get_by_type(user_id, transaction_type, limit=50, offset=0):
        """Get transactions by type"""
        query = """
            SELECT * FROM transactions 
            WHERE user_id = %s AND type = %s
            ORDER BY date DESC
            LIMIT %s OFFSET %s
        """
        return execute_query(query, (user_id, transaction_type, limit, offset), fetch_all=True)
    
    @staticmethod
    def get_all(limit=50, offset=0):
        """Get all transactions"""
        query = """
            SELECT * FROM transactions 
            ORDER BY date DESC
            LIMIT %s OFFSET %s
        """
        return execute_query(query, (limit, offset), fetch_all=True)
    
    @staticmethod
    def pay_atomic(user_id, amount, description=None, payment_method='food_delivery', idempotency_key=None):
        """
        Perform payment from external system (Food Delivery) in a single DB transaction.
        Checks balance atomically and debits if sufficient.
        Returns dict with: success (bool), transaction_id (int or None), balance_remaining (float or None), message (str)
        """
        if amount <= 0:
            return {
                'success': False,
                'transaction_id': None,
                'balance_remaining': None,
                'message': 'Amount must be greater than zero'
            }
        
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()
            
            # Lock wallet row for atomic balance check
            cursor.execute("SELECT * FROM wallets WHERE user_id = %s FOR UPDATE", (user_id,))
            wallet = cursor.fetchone()
            
            if not wallet:
                conn.rollback()
                return {
                    'success': False,
                    'transaction_id': None,
                    'balance_remaining': None,
                    'message': 'Wallet not found'
                }
            
            current_balance = float(wallet['balance'])
            
            # Check if balance is sufficient
            if current_balance < float(amount):
                conn.rollback()
                return {
                    'success': False,
                    'transaction_id': None,
                    'balance_remaining': current_balance,
                    'message': 'Insufficient Balance'
                }
            
            # Debit amount from wallet
            new_balance = current_balance - float(amount)
            cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, user_id))
            
            # Calculate and add reward points (1 point per Rp 10,000 spent)
            points_earned = int(float(amount) / 10000)
            if points_earned > 0:
                cursor.execute("UPDATE wallets SET points = points + %s WHERE user_id = %s", (points_earned, user_id))
            
            # Create transaction record with status 'completed'
            cursor.execute("""
                INSERT INTO transactions (user_id, amount, type, payment_method, description, idempotency_key, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (user_id, amount, 'withdraw', payment_method, description, idempotency_key, 'completed'))
            transaction_id = cursor.lastrowid
            
            conn.commit()
            
            return {
                'success': True,
                'transaction_id': transaction_id,
                'balance_remaining': new_balance,
                'message': None
            }
        except Exception as e:
            if conn:
                conn.rollback()
            return {
                'success': False,
                'transaction_id': None,
                'balance_remaining': None,
                'message': f'Payment processing error: {str(e)}'
            }
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

