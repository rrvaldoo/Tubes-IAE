"""
Wallet Service GraphQL Schema
"""
import graphene
from graphene import ObjectType, String, Decimal, Int, Field
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from auth import verify_token, get_token_from_request
from models import Wallet

class WalletType(ObjectType):
    wallet_id = Int()
    user_id = Int()
    balance = Decimal()
    points = Int()
    created_at = String()
    updated_at = String()

class Query(ObjectType):
    my_wallet = Field(WalletType)
    wallet = Field(WalletType, user_id=Int(required=True))
    
    def resolve_my_wallet(self, info):
        """Get current user's wallet"""
        token = get_token_from_request()
        if not token:
            return None
        
        payload = verify_token(token)
        if not payload:
            return None
        
        wallet = Wallet.get_by_user_id(payload['user_id'])
        if not wallet:
            # Create wallet if doesn't exist
            Wallet.create(payload['user_id'])
            wallet = Wallet.get_by_user_id(payload['user_id'])
        
        return wallet
    
    def resolve_wallet(self, info, user_id):
        """Get wallet by user ID"""
        return Wallet.get_by_user_id(user_id)

class UpdateBalance(graphene.Mutation):
    class Arguments:
        amount = Decimal(required=True)
        operation = String(required=True)  # 'add' or 'subtract'
    
    Output = WalletType
    
    def mutate(self, info, amount, operation):
        """Update wallet balance"""
        token = get_token_from_request()
        if not token:
            raise Exception("Authentication required")
        
        payload = verify_token(token)
        if not payload:
            raise Exception("Invalid token")
        
        user_id = payload['user_id']
        
        # Ensure wallet exists
        wallet = Wallet.get_by_user_id(user_id)
        if not wallet:
            Wallet.create(user_id)
        
        # Update balance
        Wallet.update_balance(user_id, float(amount), operation)
        
        return Wallet.get_by_user_id(user_id)

class UpdatePoints(graphene.Mutation):
    class Arguments:
        points = Int(required=True)
        operation = String(required=True)  # 'add' or 'subtract'
    
    Output = WalletType
    
    def mutate(self, info, points, operation):
        """Update wallet points"""
        token = get_token_from_request()
        if not token:
            raise Exception("Authentication required")
        
        payload = verify_token(token)
        if not payload:
            raise Exception("Invalid token")
        
        user_id = payload['user_id']
        
        # Ensure wallet exists
        wallet = Wallet.get_by_user_id(user_id)
        if not wallet:
            Wallet.create(user_id)
        
        # Update points
        Wallet.update_points(user_id, points, operation)
        
        return Wallet.get_by_user_id(user_id)

class Mutation(ObjectType):
    update_balance = UpdateBalance.Field()
    update_points = UpdatePoints.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)

