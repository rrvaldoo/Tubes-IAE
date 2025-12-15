"""
Transaction Service Models
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from database import execute_query

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

