"""
Transaction Service GraphQL Schema
"""
import graphene
from graphene import ObjectType, String, Decimal, Int, Field, List
from datetime import datetime
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'wallet-service'))
from auth import verify_token, get_token_from_request
from models import Transaction

# Import Wallet - since both services share the same database
# We can import directly from wallet-service models
import sys
wallet_service_path = os.path.join(os.path.dirname(__file__), '..', 'wallet-service')
if wallet_service_path not in sys.path:
    sys.path.insert(0, wallet_service_path)
from models import Wallet

class TransactionType(ObjectType):
    transaction_id = Int()
    user_id = Int()
    amount = Decimal()
    type = String()
    payment_method = String()
    date = String()
    receiver_id = Int()
    description = String()

class Query(ObjectType):
    my_transactions = List(TransactionType, limit=Int(), offset=Int())
    transaction = Field(TransactionType, transaction_id=Int(required=True))
    transactions_by_type = List(TransactionType, type=String(required=True), limit=Int(), offset=Int())
    
    def resolve_my_transactions(self, info, limit=50, offset=0):
        """Get current user's transactions"""
        token = get_token_from_request()
        if not token:
            return []
        
        payload = verify_token(token)
        if not payload:
            return []
        
        return Transaction.get_by_user_id(payload['user_id'], limit, offset)
    
    def resolve_transaction(self, info, transaction_id):
        """Get transaction by ID"""
        return Transaction.get_by_id(transaction_id)
    
    def resolve_transactions_by_type(self, info, type, limit=50, offset=0):
        """Get transactions by type"""
        token = get_token_from_request()
        if not token:
            return []
        
        payload = verify_token(token)
        if not payload:
            return []
        
        return Transaction.get_by_type(payload['user_id'], type, limit, offset)

class Deposit(graphene.Mutation):
    class Arguments:
        amount = Decimal(required=True)
        payment_method = String()
        description = String()
    
    Output = TransactionType
    
    def mutate(self, info, amount, payment_method=None, description=None):
        """Create deposit transaction"""
        token = get_token_from_request()
        if not token:
            raise Exception("Authentication required")
        
        payload = verify_token(token)
        if not payload:
            raise Exception("Invalid token")
        
        user_id = payload['user_id']
        
        # Create transaction
        transaction_id = Transaction.create(
            user_id=user_id,
            amount=float(amount),
            transaction_type='deposit',
            payment_method=payment_method,
            description=description
        )
        
        # Update wallet balance
        Wallet.update_balance(user_id, float(amount), 'add')
        
        return Transaction.get_by_id(transaction_id)

class Withdraw(graphene.Mutation):
    class Arguments:
        amount = Decimal(required=True)
        payment_method = String()
        description = String()
    
    Output = TransactionType
    
    def mutate(self, info, amount, payment_method=None, description=None):
        """Create withdrawal transaction"""
        token = get_token_from_request()
        if not token:
            raise Exception("Authentication required")
        
        payload = verify_token(token)
        if not payload:
            raise Exception("Invalid token")
        
        user_id = payload['user_id']
        
        # Check balance
        current_balance = Wallet.get_balance(user_id)
        if current_balance < float(amount):
            raise Exception("Insufficient balance")
        
        # Create transaction
        transaction_id = Transaction.create(
            user_id=user_id,
            amount=float(amount),
            transaction_type='withdraw',
            payment_method=payment_method,
            description=description
        )
        
        # Update wallet balance
        Wallet.update_balance(user_id, float(amount), 'subtract')
        
        return Transaction.get_by_id(transaction_id)

class Transfer(graphene.Mutation):
    class Arguments:
        receiver_id = Int(required=True)
        amount = Decimal(required=True)
        description = String()
    
    Output = TransactionType
    
    def mutate(self, info, receiver_id, amount, description=None):
        """Create transfer transaction"""
        token = get_token_from_request()
        if not token:
            raise Exception("Authentication required")
        
        payload = verify_token(token)
        if not payload:
            raise Exception("Invalid token")
        
        user_id = payload['user_id']
        
        if user_id == receiver_id:
            raise Exception("Cannot transfer to yourself")
        
        # Check balance
        current_balance = Wallet.get_balance(user_id)
        if current_balance < float(amount):
            raise Exception("Insufficient balance")
        
        # Create transaction
        transaction_id = Transaction.create(
            user_id=user_id,
            amount=float(amount),
            transaction_type='transfer',
            receiver_id=receiver_id,
            description=description or f"Transfer to user {receiver_id}"
        )
        
        # Update sender balance
        Wallet.update_balance(user_id, float(amount), 'subtract')
        
        # Update receiver balance
        Wallet.update_balance(receiver_id, float(amount), 'add')
        
        return Transaction.get_by_id(transaction_id)

class Mutation(ObjectType):
    deposit = Deposit.Field()
    withdraw = Withdraw.Field()
    transfer = Transfer.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)

